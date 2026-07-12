import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Home } from 'lucide-react';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <ShieldAlert size={48} className="text-red-600" />
                </motion.div>

                <h1 className="text-3xl font-black text-slate-900">Access Denied</h1>

                <p className="text-slate-500 text-lg leading-relaxed">
                    You don't have permission to access this area. <br />
                    This page is restricted to authorized personnel only.
                </p>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left flex items-start gap-4">
                    <Lock className="text-slate-400 shrink-0 mt-1" size={20} />
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">Security Restriction</h4>
                        <p className="text-xs text-slate-500 mt-1">
                            Your current user role does not grant access to this resource. Please contact your system administrator if you believe this is an error.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-semibold shadow-lg shadow-slate-900/20"
                >
                    <Home size={20} />
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
