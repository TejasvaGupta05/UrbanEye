import { useState, useEffect, useRef } from 'react';

export const useVoiceCommand = (onCommand) => {
    const [isListening, setIsListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [voiceFeedback, setVoiceFeedback] = useState('');
    const [speechRecognition, setSpeechRecognition] = useState(null);

    const onCommandRef = useRef(onCommand);

    useEffect(() => {
        onCommandRef.current = onCommand;
    }, [onCommand]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-IN';

            recognition.onstart = () => {
                setIsListening(true);
                setVoiceFeedback('🎤 Listening...');
            };

            recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setVoiceTranscript(finalTranscript || interimTranscript);

                // Process final result immediately
                if (finalTranscript) {
                    setTimeout(() => {
                        const cmd = finalTranscript.toLowerCase().trim();
                        setVoiceFeedback(`Processing: "${cmd}"`);
                        
                        if (onCommandRef.current) {
                            onCommandRef.current(cmd);
                        }
                        
                        setTimeout(() => {
                            setVoiceFeedback('');
                            setVoiceTranscript('');
                        }, 4000);
                    }, 100);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                setIsListening(false);
                setVoiceFeedback(`❌ Error: ${event.error}`);
                setTimeout(() => setVoiceFeedback(''), 3000);
            };

            setSpeechRecognition(recognition);
        }
    }, []);

    // Text-to-Speech function
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-IN';
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleVoiceCommand = () => {
        if (speechRecognition) {
            if (isListening) {
                speechRecognition.stop();
            } else {
                setVoiceTranscript('');
                speechRecognition.start();
            }
        } else {
            setVoiceFeedback('Voice not supported in this browser');
            setTimeout(() => setVoiceFeedback(''), 3000);
        }
    };

    return {
        isListening,
        voiceTranscript,
        voiceFeedback,
        setVoiceFeedback,
        toggleVoiceCommand,
        speak
    };
};
