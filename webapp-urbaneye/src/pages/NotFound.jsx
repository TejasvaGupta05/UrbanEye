import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <h1 className="text-9xl font-black text-slate-200">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-slate-800 bg-slate-50 px-4">Page Not Found</span>
                    </div>
                </motion.div>

                <p className="text-slate-500 text-lg">
                    Oops! The page you are looking for disappeared into the void (or never existed).
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 transition-all font-semibold"
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-semibold shadow-lg shadow-slate-900/20"
                    >
                        <Home size={20} />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
