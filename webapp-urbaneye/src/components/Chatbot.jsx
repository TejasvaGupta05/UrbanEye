import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MessageCircle, X, Send, Mic, MicOff, Volume2, Bot, Sparkles, Languages, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Chatbot.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1';

// --- UrbanEye system prompt (context + guardrails) ---
const SYSTEM_PROMPT = `You are UrbanEye AI Assistant — a helpful, concise, and friendly chatbot embedded in the UrbanEye platform.

## About UrbanEye
UrbanEye is an AI-powered civic infrastructure monitoring platform that empowers citizens to report and track urban issues (potholes, garbage, broken streetlights, water leakage, etc.). Key features:
- **AI-Powered Detection**: Users upload photos and UrbanAI Engine auto-detects issue type and severity
- **Real-time Tracking**: Issues are geo-tagged on a live map
- **Department Routing**: AI auto-routes issues to correct government departments
- **Gig Worker Booking**: Citizens can book verified gig workers for express resolution
- **NGO Help**: Request NGO assistance for community issues
- **Gamification**: Users earn XP and compete on leaderboards for reporting issues
- **Role-based Dashboards**: Civilians, Gov Admins, Dept Heads, Field Officers, Super Admins
- **Mobile App**: Available as an Android APK download

## Your Rules
1. **ONLY answer questions related to UrbanEye** — features, usage, civic issues, how-to, troubleshooting
2. If asked off-topic questions (weather, coding, math, sports, etc.), politely say: "I'm the UrbanEye assistant and can only help with UrbanEye and civic issues. How can I help you with that?"
3. **Reply in the SAME language the user writes in**. If they write in Hindi, reply in Hindi. If Tamil, reply in Tamil. Etc.
4. Keep answers **concise** — max 2-3 sentences unless more detail is needed
5. Be **warm, professional, and helpful**
6. When relevant, guide users to specific features (Analyze page, Dashboard, Book Service, etc.)
7. When the user asks about their reports or report status, use the LIVE REPORT DATA provided below to give accurate, real-time answers
8. When the user asks analytics questions (how many reports, resolved this week, etc.), use the ANALYTICS DATA provided below`;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MAX_HISTORY = 10;
const RATE_LIMIT_MAX = 20;          // max messages
const RATE_LIMIT_WINDOW = 60_000;   // per 1 minute

const QUICK_ACTIONS = [
    'How do I report an issue?',
    'What issues can AI detect?',
    'My report status',
    'Show analytics',
];

// --- Rate limiter ---
class RateLimiter {
    constructor(max, windowMs) {
        this.max = max;
        this.windowMs = windowMs;
        this.timestamps = [];
    }
    canSend() {
        const now = Date.now();
        this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
        return this.timestamps.length < this.max;
    }
    record() {
        this.timestamps.push(Date.now());
    }
    remaining() {
        const now = Date.now();
        this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
        return this.max - this.timestamps.length;
    }
}

const rateLimiter = new RateLimiter(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);

const Chatbot = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [speakingId, setSpeakingId] = useState(null);
    const [voiceLang, setVoiceLang] = useState('en-IN');
    const [userContext, setUserContext] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);
    const chatRef = useRef(null);
    const genAIRef = useRef(null);
    const reportsCache = useRef([]);

    // Fetch user reports + analytics for DB context (only when logged in)
    useEffect(() => {
        if (!isAuthenticated()) {
            setUserContext('');
            reportsCache.current = [];
            return;
        }
        const fetchUserData = async () => {
            try {
                const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

                // Fetch user's own reports
                let userReports = [];
                try {
                    const myRes = await axios.get(`${API_BASE}/reports/my`, { headers });
                    userReports = myRes.data.reports || myRes.data || [];
                } catch {
                    // Fallback: fetch all reports and filter
                    const allRes = await axios.get(`${API_BASE}/reports`, { headers });
                    const all = allRes.data.reports || allRes.data || [];
                    userReports = all.filter(r => r.user_id === user?.sub || r.email === user?.email);
                }

                reportsCache.current = userReports;

                // Build report context
                let reportCtx = '';
                if (userReports.length > 0) {
                    const reportSummary = userReports.slice(0, 8).map((r, i) =>
                        `${i + 1}. [${r.category || r.issue_type || 'Issue'}] "${r.description?.slice(0, 80) || 'No description'}" — Status: ${r.status || 'pending'}, Severity: ${r.severity || 'unknown'}, Dept: ${r.department || 'N/A'}, Date: ${r.created_at ? new Date(r.created_at * 1000).toLocaleDateString() : 'N/A'}`
                    ).join('\n');
                    reportCtx = `\n\n## LIVE REPORT DATA (${userReports.length} total reports by this user)\n${reportSummary}`;
                } else {
                    reportCtx = '\n\n## LIVE REPORT DATA\nThis user has no reports yet.';
                }

                // Build analytics context
                const now = Date.now() / 1000;
                const weekAgo = now - 7 * 86400;
                const monthAgo = now - 30 * 86400;
                const resolved = userReports.filter(r => r.status === 'resolved');
                const pending = userReports.filter(r => r.status === 'pending');
                const inProgress = userReports.filter(r => r.status === 'in_progress');
                const resolvedThisWeek = resolved.filter(r => r.created_at > weekAgo);
                const createdThisMonth = userReports.filter(r => r.created_at > monthAgo);

                const categories = {};
                userReports.forEach(r => {
                    const cat = r.category || r.issue_type || 'Other';
                    categories[cat] = (categories[cat] || 0) + 1;
                });
                const catBreakdown = Object.entries(categories).map(([k, v]) => `${k}: ${v}`).join(', ');

                const analyticsCtx = `\n\n## ANALYTICS DATA\nTotal Reports: ${userReports.length}\nResolved: ${resolved.length} | Pending: ${pending.length} | In Progress: ${inProgress.length}\nResolved this week: ${resolvedThisWeek.length}\nCreated this month: ${createdThisMonth.length}\nCategory breakdown: ${catBreakdown}`;

                setUserContext(`\n\n## Logged-in User Context\nUser: ${user?.name || user?.email}\nRole: ${user?.role || 'civilian'}${reportCtx}${analyticsCtx}`);
            } catch {
                setUserContext(`\n\n## Logged-in User Context\nUser: ${user?.name || user?.email}\nRole: ${user?.role || 'civilian'}`);
            }
        };
        fetchUserData();
    }, [isAuthenticated, user]);

    // Initialize Gemini
    useEffect(() => {
        if (!GEMINI_API_KEY) return;
        try {
            genAIRef.current = new GoogleGenerativeAI(GEMINI_API_KEY);
        } catch (e) {
            console.error('Failed to initialize Gemini:', e);
        }
    }, []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = voiceLang;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsRecording(false);
            };

            recognition.onerror = () => {
                setIsRecording(false);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        }
    }, [voiceLang]);

    // Detect if text contains Devanagari (Hindi/Marathi)
    const isDevanagari = (text) => /[\u0900-\u097F]/.test(text);

    // Text-to-speech with Hindi auto-detection
    const speak = useCallback((text, msgId) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;

            // Auto-detect language from text content
            const lang = isDevanagari(text) ? 'hi-IN' : 'en-IN';
            utterance.lang = lang;

            // Try to find a matching voice
            const voices = window.speechSynthesis.getVoices();
            const matchingVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
            if (matchingVoice) utterance.voice = matchingVoice;

            utterance.onstart = () => setSpeakingId(msgId);
            utterance.onend = () => setSpeakingId(null);
            utterance.onerror = () => setSpeakingId(null);
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    // Toggle voice recording
    const toggleRecording = () => {
        if (!recognitionRef.current) {
            setError('Voice input is not supported in your browser');
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            setIsRecording(true);
            recognitionRef.current.start();
        }
    };

    // Send message to Gemini with STREAMING
    const sendMessage = async (text) => {
        const trimmed = (text || input).trim();
        if (!trimmed || isLoading) return;

        // Rate limiting check
        if (!rateLimiter.canSend()) {
            setError(`Rate limit reached (${RATE_LIMIT_MAX} messages/min). Please wait a moment.`);
            return;
        }

        if (!GEMINI_API_KEY) {
            setError('Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env');
            return;
        }

        rateLimiter.record();

        const userMsg = { role: 'user', text: trimmed, id: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setError('');

        try {
            const model = genAIRef.current.getGenerativeModel({
                model: 'gemini-2.5-flash',
                systemInstruction: SYSTEM_PROMPT + userContext,
            });

            // Build history from last N messages (token optimization)
            const history = messages.slice(-MAX_HISTORY).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }],
            }));

            const chat = model.startChat({
                history,
                generationConfig: {
                    maxOutputTokens: 300,
                    temperature: 0.7,
                    topP: 0.9,
                },
            });

            chatRef.current = chat;

            // Create placeholder bot message for streaming
            const botMsgId = Date.now() + 1;
            setMessages(prev => [...prev, { role: 'bot', text: '', id: botMsgId }]);
            setIsLoading(false); // Hide typing indicator, show streaming text

            // STREAMING: send message and stream response
            const result = await chat.sendMessageStream(trimmed);

            let fullText = '';
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullText += chunkText;
                // Update the bot message in-place with accumulated text
                setMessages(prev =>
                    prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m)
                );
            }
        } catch (err) {
            console.error('Gemini error:', err);
            setError('Failed to get response. Please try again.');
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleQuickAction = (text) => {
        sendMessage(text);
    };

    return (
        <>
            {/* Chat window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-avatar">
                            <Bot size={22} color="white" />
                        </div>
                        <div className="chatbot-header-info">
                            <h3>UrbanEye AI</h3>
                            <p>
                                {isAuthenticated()
                                    ? `Hi ${user?.name?.split(' ')[0] || 'there'}! Ask me anything`
                                    : 'Ask me about UrbanEye'}
                            </p>
                        </div>
                        <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.length === 0 && (
                            <>
                                <div className="chatbot-welcome">
                                    <div className="chatbot-welcome-icon">
                                        <Sparkles size={26} color="white" />
                                    </div>
                                    <h4>Welcome to UrbanEye AI!</h4>
                                    <p>I can help you with reporting issues, tracking reports, understanding features, and more.</p>
                                </div>
                                {!isAuthenticated() && (
                                    <div className="chatbot-login-prompt">
                                        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Log in for personalized help with your reports</p>
                                        <button
                                            onClick={() => { navigate('/login'); setIsOpen(false); }}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                padding: '6px 16px', borderRadius: '12px', fontSize: '13px',
                                                fontWeight: 600, color: '#4f46e5', background: 'rgba(79,70,229,0.08)',
                                                border: '1px solid rgba(79,70,229,0.2)', cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <LogIn size={14} /> Sign in
                                        </button>
                                    </div>
                                )}
                                <div className="chatbot-quick-actions">
                                    {QUICK_ACTIONS.map((q, i) => (
                                        <button
                                            key={i}
                                            className="chatbot-quick-chip"
                                            onClick={() => handleQuickAction(q)}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className={`chatbot-msg ${msg.role}`}>
                                {msg.role === 'bot' && (
                                    <div className="chatbot-bot-avatar">
                                        <Bot />
                                    </div>
                                )}
                                <div>
                                    <div className="chatbot-msg-bubble">
                                        {msg.text}
                                        {msg.role === 'bot' && msg.text === '' && (
                                            <span className="chatbot-streaming-cursor">▊</span>
                                        )}
                                    </div>
                                    {msg.role === 'bot' && msg.text && (
                                        <button
                                            className={`chatbot-speak-btn ${speakingId === msg.id ? 'speaking' : ''}`}
                                            onClick={() => speak(msg.text, msg.id)}
                                            title="Listen"
                                        >
                                            <Volume2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="chatbot-msg bot">
                                <div className="chatbot-bot-avatar">
                                    <Bot />
                                </div>
                                <div className="chatbot-typing">
                                    <div className="chatbot-typing-dot" />
                                    <div className="chatbot-typing-dot" />
                                    <div className="chatbot-typing-dot" />
                                </div>
                            </div>
                        )}

                        {error && <div className="chatbot-error">{error}</div>}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chatbot-input-area">
                        <button
                            className="chatbot-voice-btn"
                            onClick={() => setVoiceLang(voiceLang === 'en-IN' ? 'hi-IN' : 'en-IN')}
                            title={voiceLang === 'hi-IN' ? 'Switch to English voice' : 'Switch to Hindi voice'}
                            style={{ fontSize: '11px', fontWeight: 700, color: voiceLang === 'hi-IN' ? '#4f46e5' : '#64748b' }}
                        >
                            {voiceLang === 'hi-IN' ? '\u0939\u093F' : 'EN'}
                        </button>
                        <button
                            className={`chatbot-voice-btn ${isRecording ? 'recording' : ''}`}
                            onClick={toggleRecording}
                            title={isRecording ? 'Stop recording' : `Voice input (${voiceLang === 'hi-IN' ? 'Hindi' : 'English'})`}
                        >
                            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                        </button>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={isRecording ? 'Listening...' : 'Ask about UrbanEye...'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <button
                            className="chatbot-send-btn"
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isLoading}
                        >
                            <Send size={16} />
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="chatbot-footer">
                        Powered by <span>UrbanAI Engine&trade;</span>
                    </div>
                </div>
            )}

            {/* FAB */}
            <button
                className={`chatbot-fab ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? 'Close chat' : 'Chat with UrbanEye AI'}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </>
    );
};

export default Chatbot;
