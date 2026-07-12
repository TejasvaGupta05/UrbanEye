import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceCommand } from '../../hooks/useVoiceCommand';
import VoiceAssistantButton from '../common/VoiceAssistantButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, LogOut, Menu, X, RefreshCw, ChevronRight, ChevronLeft,
    Briefcase, DollarSign, Star, TrendingUp, MapPin, Clock, CheckCircle,
    ArrowUpRight, Award, Target, Zap, Map as MapIcon, Calendar, Trophy,
    Timer, Wallet, Activity, Eye, Play, AlertCircle, Package, Route
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GigWorkerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Mock data - Replace with actual API calls
    const [jobs, setJobs] = useState([
        { id: 1, title: 'Fix Pothole', location: 'MG Road', payment: 300, distance: '2.3 km', status: 'available', priority: 'high', estimatedTime: '2h' },
        { id: 2, title: 'Clean Streetlight', location: 'Park Street', payment: 200, distance: '1.5 km', status: 'available', priority: 'medium', estimatedTime: '1h' },
        { id: 3, title: 'Tree Trimming', location: 'Cyber Hub', payment: 500, distance: '4.2 km', status: 'available', priority: 'high', estimatedTime: '3h' },
        { id: 4, title: 'Drain Cleaning', location: 'Sector 5', payment: 400, distance: '3.1 km', status: 'in_progress', priority: 'medium', estimatedTime: '2.5h' },
        { id: 5, title: 'Wall Repair', location: 'Main Market', payment: 350, distance: '2.8 km', status: 'completed', priority: 'low', estimatedTime: '2h' },
    ]);

    const stats = useMemo(() => {
        const available = jobs.filter(j => j.status === 'available').length;
        const inProgress = jobs.filter(j => j.status === 'in_progress').length;
        const completed = jobs.filter(j => j.status === 'completed').length;
        const todayEarnings = jobs.filter(j => j.status === 'completed').reduce((sum, j) => sum + j.payment, 0);
        const rating = 4.8;
        
        return { available, inProgress, completed, todayEarnings, rating };
    }, [jobs]);

    const handleAcceptJob = (jobId) => {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'in_progress' } : j));
    };

    const handleCompleteJob = (jobId) => {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'completed' } : j));
    };

    const processVoiceCommand = (command) => {
        const cmd = command.toLowerCase().trim();

        if (cmd.includes('advance select') && cmd.includes('full')) {
            setActiveView('map');
            if (cmd.includes('delhi') || cmd.includes('gwalior') || cmd.includes('canberra')) {
                speak('Advanced selection processed. Showing detailed map layout.');
            }
            return;
        }

        if (cmd.includes('overview') || cmd.includes('home')) { setActiveView('overview'); speak('Opening Overview'); }
        else if (cmd.includes('available jobs') || cmd.includes('find jobs')) { setActiveView('available'); speak('Opening Available Jobs'); }
        else if (cmd.includes('active jobs') || cmd.includes('active')) { setActiveView('active'); speak('Opening Active Jobs'); }
        else if (cmd.includes('earnings') || cmd.includes('wallet')) { setActiveView('earnings'); speak('Opening Earnings'); }
        else if (cmd.includes('map') || cmd.includes('job map')) { setActiveView('map'); speak('Opening Job Map'); }
    };

    const { isListening, voiceTranscript, voiceFeedback, toggleVoiceCommand, speak } = useVoiceCommand(processVoiceCommand);

    const handleLogout = () => { logout(); navigate('/login'); };

    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'available', icon: Briefcase, label: 'Available Jobs' },
        { id: 'active', icon: Activity, label: 'Active Jobs' },
        { id: 'earnings', icon: Wallet, label: 'Earnings' },
        { id: 'map', icon: MapIcon, label: 'Job Map' },
    ];

    const priorityConfig = {
        high: { color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
        medium: { color: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
        low: { color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Mobile Menu Button */}
            <button className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-slate-200" 
                onClick={() => setMobileMenuOpen(true)}>
                <Menu size={22} className="text-slate-700" />
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" 
                        onClick={() => setMobileMenuOpen(false)} />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed lg:relative z-50 h-full flex flex-col bg-white border-r border-slate-200 shadow-sm transition-all duration-300
                ${sidebarCollapsed ? 'w-[72px]' : 'w-64'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                
                {/* Brand */}
                <div className="flex items-center gap-3 p-5 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                        <Zap size={20} className="text-white" />
                    </div>
                    {!sidebarCollapsed && (
                        <div className="overflow-hidden">
                            <h1 className="font-bold text-slate-800 text-sm tracking-wide">UrbanEye</h1>
                            <p className="text-xs text-slate-500">Gig Worker</p>
                        </div>
                    )}
                    <button className="lg:hidden ml-auto p-1 hover:bg-slate-100 rounded-lg" 
                        onClick={() => setMobileMenuOpen(false)}>
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                {/* Collapse Toggle */}
                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm hover:bg-slate-50 z-10">
                    {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                </button>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <button key={item.id}
                            onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                ${activeView === item.id
                                    ? 'bg-orange-50 text-orange-700 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            title={sidebarCollapsed ? item.label : ''}>
                            <item.icon size={20} className={activeView === item.id ? 'text-orange-600' : ''} />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* User & Logout */}
                <div className="p-3 border-t border-slate-100">
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow">
                                {user?.name?.charAt(0) || 'G'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                                <div className="flex items-center gap-1">
                                    <Star size={12} className="text-amber-500 fill-amber-500" />
                                    <p className="text-xs text-slate-500">{stats.rating} Rating</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <LogOut size={18} />
                        {!sidebarCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div className="ml-12 lg:ml-0">
                        <h1 className="text-xl font-bold text-slate-800">
                            {activeView === 'overview' && 'Dashboard Overview'}
                            {activeView === 'available' && 'Available Jobs'}
                            {activeView === 'active' && 'Active Jobs'}
                            {activeView === 'earnings' && 'Earnings & Stats'}
                            {activeView === 'map' && 'Job Map'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                            <DollarSign size={16} />
                            <span>₹{stats.todayEarnings}</span>
                        </div>
                        <button onClick={() => setLoading(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-100 transition-all">
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeView} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>

                            {/* ===== OVERVIEW ===== */}
                            {activeView === 'overview' && (
                                <div className="space-y-6">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Available Jobs', value: stats.available, icon: Briefcase, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 text-blue-700' },
                                            { label: "Today's Earnings", value: `₹${stats.todayEarnings}`, icon: DollarSign, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 text-emerald-700' },
                                            { label: 'Active Jobs', value: stats.inProgress, icon: Activity, gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-50 text-orange-700' },
                                            { label: 'Your Rating', value: stats.rating, icon: Star, gradient: 'from-amber-500 to-yellow-600', bg: 'bg-amber-50 text-amber-700' },
                                        ].map((card, i) => (
                                            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                                                transition={{ delay: i * 0.08 }}
                                                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all duration-300 group">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                                                        <card.icon size={20} />
                                                    </div>
                                                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                                                </div>
                                                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                                                <p className="text-sm text-slate-500 mt-1">{card.label}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">Quick Actions</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <button onClick={() => setActiveView('available')}
                                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all group">
                                                <Briefcase size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-semibold">Find Jobs</span>
                                            </button>
                                            <button onClick={() => setActiveView('active')}
                                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 transition-all group">
                                                <Activity size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-semibold">Active Jobs</span>
                                            </button>
                                            <button onClick={() => setActiveView('map')}
                                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-all group">
                                                <MapIcon size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-semibold">Map View</span>
                                            </button>
                                            <button onClick={() => setActiveView('earnings')}
                                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all group">
                                                <Wallet size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-semibold">Earnings</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Nearby High-Paying Jobs */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                                                🔥 High-Paying Jobs Nearby
                                            </h3>
                                            <button onClick={() => setActiveView('available')} 
                                                className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                                                View All <ChevronRight size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {jobs.filter(j => j.status === 'available' && j.payment >= 300).slice(0, 3).map((job, idx) => {
                                                const priority = priorityConfig[job.priority] || priorityConfig.medium;
                                                return (
                                                    <motion.div key={job.id} initial={{ opacity: 0, x: -10 }} 
                                                        animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all">
                                                        <div className={`w-12 h-12 rounded-xl ${priority.bg} flex items-center justify-center flex-shrink-0`}>
                                                            <Package size={24} className={priority.color} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-slate-800">{job.title}</h4>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                                    <MapPin size={12} /> {job.location}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                                    <Route size={12} /> {job.distance}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-xl font-bold text-emerald-600">₹{job.payment}</p>
                                                            <button onClick={() => handleAcceptJob(job.id)}
                                                                className="mt-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition-all">
                                                                Accept
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Performance Summary */}
                                    <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                <Trophy size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Your Performance</h3>
                                                <p className="text-sm text-orange-50">Keep up the great work!</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                                <p className="text-2xl font-bold">{stats.completed}</p>
                                                <p className="text-sm text-orange-50 mt-1">Jobs Completed</p>
                                            </div>
                                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                                <p className="text-2xl font-bold">{stats.rating}</p>
                                                <p className="text-sm text-orange-50 mt-1">Rating</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== AVAILABLE JOBS ===== */}
                            {activeView === 'available' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500">
                                        Showing <span className="font-semibold text-slate-700">{jobs.filter(j => j.status === 'available').length}</span> available jobs
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {jobs.filter(j => j.status === 'available').map((job, idx) => {
                                            const priority = priorityConfig[job.priority] || priorityConfig.medium;
                                            return (
                                                <motion.div key={job.id} initial={{ opacity: 0, y: 16 }} 
                                                    animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                                    <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-500" />
                                                    <div className="p-5">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-slate-800">{job.title}</h3>
                                                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                                    <MapPin size={12} /> {job.location}
                                                                </p>
                                                            </div>
                                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${priority.badge}`}>
                                                                {job.priority.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                                            <div className="bg-slate-50 rounded-lg p-3">
                                                                <p className="text-xs text-slate-500">Distance</p>
                                                                <p className="text-sm font-semibold text-slate-800 mt-1">{job.distance}</p>
                                                            </div>
                                                            <div className="bg-slate-50 rounded-lg p-3">
                                                                <p className="text-xs text-slate-500">Est. Time</p>
                                                                <p className="text-sm font-semibold text-slate-800 mt-1">{job.estimatedTime}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                            <div>
                                                                <p className="text-xs text-slate-500">Payment</p>
                                                                <p className="text-2xl font-bold text-emerald-600">₹{job.payment}</p>
                                                            </div>
                                                            <button onClick={() => handleAcceptJob(job.id)}
                                                                className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-all shadow-sm">
                                                                <Play size={15} /> Accept Job
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {jobs.filter(j => j.status === 'available').length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                            <Briefcase size={48} className="mb-3" />
                                            <p className="font-semibold text-lg">No jobs available</p>
                                            <p className="text-sm mt-1">Check back later for new opportunities</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ===== ACTIVE JOBS ===== */}
                            {activeView === 'active' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500">
                                        You have <span className="font-semibold text-slate-700">{stats.inProgress}</span> active job(s)
                                    </p>

                                    <div className="space-y-4">
                                        {jobs.filter(j => j.status === 'in_progress').map((job, idx) => (
                                            <motion.div key={job.id} initial={{ opacity: 0, x: -20 }} 
                                                animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                                className="bg-white rounded-2xl border border-slate-200 p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-800">{job.title}</h3>
                                                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                                            <MapPin size={14} /> {job.location}
                                                        </p>
                                                    </div>
                                                    <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold">
                                                        In Progress
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                                                        <DollarSign size={20} className="text-emerald-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-slate-800">₹{job.payment}</p>
                                                        <p className="text-xs text-slate-500">Payment</p>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                                                        <Timer size={20} className="text-blue-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-slate-800">{job.estimatedTime}</p>
                                                        <p className="text-xs text-slate-500">Est. Time</p>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                                                        <Route size={20} className="text-purple-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-slate-800">{job.distance}</p>
                                                        <p className="text-xs text-slate-500">Distance</p>
                                                    </div>
                                                </div>

                                                <button onClick={() => handleCompleteJob(job.id)}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all">
                                                    <CheckCircle size={18} /> Mark as Completed
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {jobs.filter(j => j.status === 'in_progress').length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                            <Activity size={48} className="mb-3" />
                                            <p className="font-semibold text-lg">No active jobs</p>
                                            <p className="text-sm mt-1">Accept a job to get started</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ===== EARNINGS ===== */}
                            {activeView === 'earnings' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                                <DollarSign size={28} className="text-emerald-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-slate-800">₹{stats.todayEarnings}</p>
                                            <p className="text-sm text-slate-500 mt-1">Today's Earnings</p>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
                                                <Wallet size={28} className="text-blue-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-slate-800">₹12,450</p>
                                            <p className="text-sm text-slate-500 mt-1">This Month</p>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-50 flex items-center justify-center">
                                                <TrendingUp size={28} className="text-amber-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-slate-800">₹415</p>
                                            <p className="text-sm text-slate-500 mt-1">Avg. Per Job</p>
                                        </div>
                                    </div>

                                    {/* Earnings Chart Placeholder */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                                            Earnings Trend
                                        </h3>
                                        <div className="h-48 flex items-center justify-center bg-slate-50 rounded-xl">
                                            <div className="text-center">
                                                <TrendingUp size={40} className="text-slate-300 mx-auto mb-2" />
                                                <p className="text-sm text-slate-400">Chart coming soon</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Earnings */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                                            Recent Completed Jobs
                                        </h3>
                                        <div className="space-y-3">
                                            {jobs.filter(j => j.status === 'completed').map((job, idx) => (
                                                <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{job.title}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{job.location}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-emerald-600">₹{job.payment}</p>
                                                        <p className="text-xs text-slate-500">Completed</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== MAP VIEW ===== */}
                            {activeView === 'map' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                        <div className="h-[400px] relative bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
                                            <div className="text-center">
                                                <MapIcon size={64} className="text-slate-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-bold text-slate-600 mb-2">Interactive Job Map</h3>
                                                <p className="text-sm text-slate-500 mb-4">View all available jobs on a map</p>
                                                <div className="flex gap-2 justify-center">
                                                    <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-semibold">High Priority</span>
                                                    <span className="px-3 py-1.5 bg-amber-500 text-white rounded-full text-xs font-semibold">Medium Priority</span>
                                                    <span className="px-3 py-1.5 bg-emerald-500 text-white rounded-full text-xs font-semibold">Low Priority</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                                            <Route className="inline mr-2" size={16} />
                                            Jobs Near You
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {jobs.filter(j => j.status === 'available').map((job, idx) => {
                                                const priority = priorityConfig[job.priority] || priorityConfig.medium;
                                                return (
                                                    <div key={job.id} className={`p-4 rounded-xl border ${priority.bg}`}>
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h4 className="font-semibold text-sm text-slate-800">{job.title}</h4>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${priority.badge}`}>
                                                                {job.priority.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mb-3">{job.location}</p>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                                <Route size={12} />
                                                                <span>{job.distance}</span>
                                                            </div>
                                                            <button 
                                                                className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                                                                Navigate →
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
            <VoiceAssistantButton
                isListening={isListening}
                voiceTranscript={voiceTranscript}
                voiceFeedback={voiceFeedback}
                toggleVoiceCommand={toggleVoiceCommand}
            />
        </div>
    );
};

export default GigWorkerDashboard;
