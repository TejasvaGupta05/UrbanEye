import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, AlertCircle, Loader2, Activity, Sparkles, Eye, CheckCircle, Trophy, Server, Database, Shield, Wifi } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

// Server boot loading overlay component
const ServerBootOverlay = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const steps = [
        { label: 'Waking up Render server…', icon: Server, detail: 'Free-tier cold boot detected' },
        { label: 'Establishing database connection…', icon: Database, detail: 'PostgreSQL handshake' },
        { label: 'Initializing user registration…', icon: Shield, detail: 'Validation & hashing' },
        { label: 'Preparing your dashboard…', icon: Sparkles, detail: 'UrbanAI Engine ready' },
        { label: 'Account created!', icon: CheckCircle, detail: 'Redirecting to login…' },
    ];

    useEffect(() => {
        const timers = [];
        steps.forEach((_, i) => {
            timers.push(setTimeout(() => setStep(i), i * 1200));
        });
        timers.push(setTimeout(() => onComplete(), steps.length * 1200 + 600));
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-[999] flex items-center justify-center"
        >
            <div className="text-center max-w-md px-6">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-8" />
                <h2 className="text-white text-xl font-bold mb-2">Creating Your Account</h2>
                <p className="text-slate-500 text-sm mb-8">This may take 15–30 seconds on first request (Render free-tier cold boot)</p>
                <div className="space-y-3 text-left">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i <= step ? 'opacity-100' : 'opacity-15'}`}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {i < step ? (
                                        <CheckCircle size={16} className="text-emerald-400" />
                                    ) : i === step ? (
                                        <div className="w-4 h-4 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border border-slate-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className={`text-sm font-semibold ${i <= step ? 'text-white' : 'text-slate-600'}`}>{s.label}</div>
                                    <div className={`text-xs ${i <= step ? 'text-slate-400' : 'text-slate-700'}`}>{s.detail}</div>
                                </div>
                                {i < step && <span className="text-emerald-400 text-xs font-mono">✓</span>}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-8 text-xs text-slate-600 flex items-center justify-center gap-2">
                    <Wifi size={10} className="text-purple-400 animate-pulse" />
                    Backend deployed on Render · Auto-scaling
                </div>
            </div>
        </motion.div>
    );
};

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showServerBoot, setShowServerBoot] = useState(false);
    const [pendingSignup, setPendingSignup] = useState(null);
    const { signup, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setShowServerBoot(true);
        const signupPromise = signup(name, email, password);
        setPendingSignup(signupPromise);
    };

    const handleServerBootComplete = async () => {
        if (pendingSignup) {
            const result = await pendingSignup;
            setShowServerBoot(false);
            if (result.success) {
                navigate('/login');
            } else {
                setError(result.error);
            }
        } else {
            setShowServerBoot(false);
        }
        setIsLoading(false);
        setPendingSignup(null);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setShowServerBoot(true);
        const loginPromise = googleLogin(credentialResponse);
        setPendingSignup(loginPromise);
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Server Boot Overlay */}
            <AnimatePresence>
                {showServerBoot && <ServerBootOverlay onComplete={handleServerBootComplete} />}
            </AnimatePresence>

            {/* Animated Background (Matching Home) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-20 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-60 animate-pulse" />
                <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-50 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }} />

            <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-20 items-center relative z-10">

                {/* Left Side: Hero Text (Hidden on Mobile) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:block space-y-8 order-2 lg:order-1"
                >
                    <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-bold">
                        <Sparkles size={16} className="animate-pulse" />
                        Join the Movement
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 leading-[1.1]">
                        Become a <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Community Guardian</span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                        Join thousands of citizens making a difference. Report issues, earn XP, and transform your city.
                    </p>

                    <div className="grid grid-cols-2 gap-6 pt-4">
                        <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-sm">
                            <CheckCircle className="text-green-500 mb-2" size={24} />
                            <h3 className="font-bold text-slate-900">Instant Reports</h3>
                            <p className="text-sm text-slate-500">Snap and submit issues in seconds</p>
                        </div>
                        <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-sm">
                            <Trophy className="text-amber-500 mb-2" size={24} />
                            <h3 className="font-bold text-slate-900">Earn Rewards</h3>
                            <p className="text-sm text-slate-500">Get recognized for your impact</p>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Signup Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md mx-auto order-1 lg:order-2"
                >
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-2xl shadow-purple-100/50">
                        <div className="text-center mb-8 lg:hidden">
                            <h2 className="text-2xl font-bold text-slate-900">Join Available</h2>
                            <p className="text-slate-500">Create your account</p>
                        </div>

                        <div className="mb-8 hidden lg:block">
                            <h2 className="text-2xl font-bold text-slate-900">Get Started</h2>
                            <p className="text-slate-500 mt-1">Create your free account</p>
                        </div>

                        {/* Google Sign Up Button */}
                        <div className="mb-6 flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google signup failed')}
                                theme="outline"
                                size="large"
                                width="100%"
                                text="signup_with"
                                shape="pill"
                            />
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-slate-400 text-sm font-medium">or email</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2"
                                >
                                    <AlertCircle size={16} />
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                                <div className="relative">
                                    <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                                <div className="relative">
                                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-500 font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-bold transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};



export default Signup;
