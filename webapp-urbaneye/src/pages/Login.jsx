import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, Lock, Mail, ArrowRight, Loader2, Activity, Sparkles, CheckCircle, Server, Wifi, Shield, Database, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';

const demoCredentials = [
    { role: 'Civilian', email: 'ayan.ahmedkhan591@gmail.com', password: 'ayankhan', color: 'bg-blue-100 text-blue-600', desc: 'Report issues, track status' },
    { role: 'Gov Admin', email: 'admin@gov.in', password: 'ayankhan', color: 'bg-red-100 text-red-600', desc: 'Full analytics, AI predictions, heatmap' },
    { role: 'Super Admin', email: 'ayanpthan768@gmail.com', password: 'ayankhan', color: 'bg-purple-100 text-purple-600', desc: 'System configuration, user management' },
    { role: 'Dept Head', email: 'depthead@roads.gov.in', password: 'ayankhan', color: 'bg-amber-100 text-amber-600', desc: 'Department reports, team management' },
    { role: 'Field Officer', email: 'vikash@mcd.gov.in', password: 'ayankhan', color: 'bg-teal-100 text-teal-600', desc: 'Task assignments, on-ground updates' },
    { role: 'Gig Worker', email: 'gig@urbaneye.in', password: 'ayankhan', color: 'bg-orange-100 text-orange-600', desc: 'On-demand task pickup, earnings' },
    { role: 'Social Worker', email: 'ngo@urbaneye.in', password: 'ayankhan', color: 'bg-pink-100 text-pink-600', desc: 'NGO collaboration, social issues' },
];

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [slowRequest, setSlowRequest] = useState(false);
    const [showAllCreds, setShowAllCreds] = useState(false);
    const slowTimerRef = useRef(null);

    const { login, googleLogin, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    // Role-based redirect helper — go directly to the correct dashboard
    const getRedirectPath = (userData) => {
        // If we have a saved "from" path that isn't the generic dashboard, use it
        if (from !== '/dashboard') return from;
        // Otherwise route by role to avoid intermediate redirect hops
        switch (userData?.role) {
            case 'super_admin': return '/super-admin-dashboard';
            case 'gov_admin': return '/gov-admin-dashboard';
            case 'dept_head': return '/dept-head-dashboard';
            case 'field_officer': return '/field-officer-dashboard';
            default: return '/dashboard';
        }
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
        };
    }, []);

    // Google One Tap Login
    useGoogleOneTapLogin({
        onSuccess: async (credentialResponse) => {
            const result = await googleLogin(credentialResponse);
            if (result.success) {
                navigate(from, { replace: true });
            } else {
                setError(result.error);
            }
        },
        onError: () => {
            console.log('One Tap Login Failed');
        },
        disabled: isAuthenticated(),
    });

    const startSlowTimer = () => {
        slowTimerRef.current = setTimeout(() => setSlowRequest(true), 3000);
    };

    const clearSlowTimer = () => {
        if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
        setSlowRequest(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSlowRequest(false);
        startSlowTimer();

        const result = await login(email, password);
        clearSlowTimer();
        setIsSubmitting(false);

        if (result.success) {
            navigate(getRedirectPath(result.user), { replace: true });
        } else {
            setError(result.error);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setIsSubmitting(true);
        setSlowRequest(false);
        startSlowTimer();

        const result = await googleLogin(credentialResponse);
        clearSlowTimer();
        setIsSubmitting(false);

        if (result.success) {
            navigate(getRedirectPath(result.user), { replace: true });
        } else {
            setError(result.error);
        }
    };

    const visibleCreds = showAllCreds ? demoCredentials : demoCredentials.slice(0, 3);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background (Matching Home) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60 animate-pulse" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
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
                    className="hidden lg:block space-y-8"
                >
                    <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-bold">
                        <Sparkles size={16} className="animate-pulse" />
                        AI-Powered Civic Action
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 leading-[1.1]">
                        Welcome back to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">UrbanEye</span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                        Continue your journey in making our cities smarter, cleaner, and safer for everyone.
                    </p>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 text-slate-700 font-medium">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Activity size={20} />
                            </div>
                            <span>Track issue resolution in real-time</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-700 font-medium">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <CheckCircle size={20} />
                            </div>
                            <span>Earn rewards for your contributions</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md mx-auto"
                >
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-2xl shadow-indigo-100/50">
                        <div className="text-center mb-8 lg:hidden">
                            <Link to="/" className="inline-flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Activity size={20} className="text-white" />
                                </div>
                                <span className="text-2xl font-black text-slate-900">UrbanEye</span>
                            </Link>
                            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                        </div>

                        <div className="mb-8 hidden lg:block">
                            <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
                            <p className="text-slate-500 mt-1">Access your dashboard</p>
                        </div>

                        {/* Google Sign In Button */}
                        <div className="mb-6 flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google login failed')}
                                theme="outline"
                                size="large"
                                width="100%"
                                text="signin_with"
                                shape="pill"
                            />
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-slate-400 text-sm font-medium">or email</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2"
                                >
                                    <Activity size={16} />
                                    {error}
                                </motion.div>
                            )}

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
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Signing in…</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            {/* Render cold-boot inline message */}
                            <AnimatePresence>
                                {isSubmitting && slowRequest && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-start gap-3">
                                            <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-indigo-700">Render server is waking up…</p>
                                                <p className="text-xs text-indigo-500 mt-0.5">Free-tier cold boot — usually takes 15–30s on first request</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        {/* Demo Credentials - All Roles */}
                        <div className="mt-8 bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demo Credentials</h3>
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{demoCredentials.length} roles</span>
                            </div>
                            <div className="space-y-1.5">
                                {visibleCreds.map((cred) => (
                                    <button
                                        key={cred.role}
                                        onClick={() => { setEmail(cred.email); setPassword(cred.password); setError(''); }}
                                        className="w-full text-left bg-white p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all text-xs group"
                                    >
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="font-bold text-slate-700">{cred.role}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${cred.color}`}>{cred.email}</span>
                                        </div>
                                        <div className="text-slate-400">{cred.desc}</div>
                                    </button>
                                ))}
                            </div>
                            {demoCredentials.length > 3 && (
                                <button
                                    onClick={() => setShowAllCreds(!showAllCreds)}
                                    className="w-full mt-2 text-xs text-indigo-500 hover:text-indigo-700 font-semibold flex items-center justify-center gap-1 py-1.5 transition-colors"
                                >
                                    {showAllCreds ? 'Show less' : `Show all ${demoCredentials.length} roles`}
                                    <ChevronRight size={12} className={`transition-transform ${showAllCreds ? 'rotate-90' : ''}`} />
                                </button>
                            )}
                            <div className="mt-2 text-[10px] text-slate-400 text-center font-mono">Password for all: ayankhan</div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-slate-500 font-medium">
                                New to UrbanEye?{' '}
                                <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
