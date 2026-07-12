import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceCommand } from '../../hooks/useVoiceCommand';
import VoiceAssistantButton from '../common/VoiceAssistantButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, CheckCircle, FileText, LogOut,
    Menu, X, MapPin, RefreshCw, Camera, Clock, Activity,
    AlertTriangle, ChevronRight, ChevronLeft, Search, Filter,
    ArrowUpRight, ArrowDownRight, Zap, TrendingUp, Eye,
    Navigation, Play, CircleCheck, Timer, Star, BarChart3, Map as MapIcon,
    Calendar, Award, Target, Route, BookOpen, CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1';

const SEVERITY_CONFIG = {
    high: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', bar: 'bg-red-500', icon: AlertTriangle },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500', icon: Clock },
    low: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', icon: CheckCircle },
};

const STATUS_CONFIG = {
    open: { label: 'Open', bg: 'bg-yellow-100 text-yellow-800' },
    assigned: { label: 'Assigned', bg: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'In Progress', bg: 'bg-indigo-100 text-indigo-800' },
    resolved: { label: 'Resolved', bg: 'bg-emerald-100 text-emerald-800' },
};

const FieldOfficerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [selectedTask, setSelectedTask] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${API_BASE}/reports`, { headers });
            setTasks(res.data.reports || []);
        } catch (error) {
            console.error("Error fetching tasks", error);
        }
        setLoading(false);
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
        else if (cmd.includes('my tasks') || cmd.includes('tasks')) { setActiveView('tasks'); speak('Opening My Tasks'); }
        else if (cmd.includes('map view') || cmd.includes('map')) { setActiveView('map'); speak('Opening Map View'); }
        else if (cmd.includes('completed')) { setActiveView('completed'); speak('Opening Completed Tasks'); }
        else if (cmd.includes('performance') || cmd.includes('stats')) { setActiveView('performance'); speak('Opening Performance'); }
        else if (cmd.includes('activity')) { setActiveView('activity'); speak('Opening Activity Log'); }
    };

    const { isListening, voiceTranscript, voiceFeedback, toggleVoiceCommand, speak } = useVoiceCommand(processVoiceCommand);

    const stats = useMemo(() => {
        const assigned = tasks.filter(t => t.status === 'assigned').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const resolved = tasks.filter(t => t.status === 'resolved').length;
        const open = tasks.filter(t => t.status === 'open').length;
        const highSev = tasks.filter(t => t.severity === 'high' && t.status !== 'resolved').length;
        return { assigned, inProgress, resolved, open, highSev, total: tasks.length };
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            if (activeView === 'overview') return t.status !== 'resolved';
            if (activeView === 'tasks') return t.status !== 'resolved';
            if (activeView === 'completed') return t.status === 'resolved';
            return true;
        }).filter(t => {
            if (severityFilter !== 'all' && t.severity !== severityFilter) return false;
            if (searchTerm) {
                const s = searchTerm.toLowerCase();
                return (t.category?.toLowerCase().includes(s) || t.description?.toLowerCase().includes(s));
            }
            return true;
        });
    }, [tasks, activeView, severityFilter, searchTerm]);

    const handleStatusUpdate = async (taskId, newStatus) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.put(`${API_BASE}/reports/${taskId}/status`, { status: newStatus }, { headers });
            fetchTasks();
        } catch (error) {
            console.error("Error updating status", error);
        }
        setActionLoading(false);
        setConfirmModalOpen(false);
        setConfirmAction(null);
    };

    const openConfirm = (task, status) => {
        setConfirmAction({ task, status });
        setConfirmModalOpen(true);
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'tasks', icon: FileText, label: 'My Tasks' },
        { id: 'map', icon: MapIcon, label: 'Map View' },
        { id: 'completed', icon: CheckCircle, label: 'Completed' },
        { id: 'performance', icon: BarChart3, label: 'Performance' },
        { id: 'activity', icon: BookOpen, label: 'Activity Log' },
    ];

    const statCards = [
        { label: 'Assigned', value: stats.assigned, icon: Zap, gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-700' },
        { label: 'In Progress', value: stats.inProgress, icon: Activity, gradient: 'from-indigo-500 to-purple-600', light: 'bg-indigo-50 text-indigo-700' },
        { label: 'Resolved', value: stats.resolved, icon: CheckCircle, gradient: 'from-emerald-500 to-green-600', light: 'bg-emerald-50 text-emerald-700' },
        { label: 'High Priority', value: stats.highSev, icon: AlertTriangle, gradient: 'from-red-500 to-rose-600', light: 'bg-red-50 text-red-700' },
    ];

    const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Mobile Menu Button */}
            <button className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-slate-200" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={22} className="text-slate-700" />
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed lg:relative z-50 h-full flex flex-col bg-white border-r border-slate-200 shadow-sm transition-all duration-300
                ${sidebarCollapsed ? 'w-[72px]' : 'w-64'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                {/* Brand */}
                <div className="flex items-center gap-3 p-5 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                        <Navigation size={20} className="text-white" />
                    </div>
                    {!sidebarCollapsed && (
                        <div className="overflow-hidden">
                            <h1 className="font-bold text-slate-800 text-sm tracking-wide">UrbanEye</h1>
                            <p className="text-xs text-slate-500">Field Officer</p>
                        </div>
                    )}
                    <button className="lg:hidden ml-auto p-1 hover:bg-slate-100 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
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
                                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            title={sidebarCollapsed ? item.label : ''}>
                            <item.icon size={20} className={activeView === item.id ? 'text-emerald-600' : ''} />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* User & Logout */}
                <div className="p-3 border-t border-slate-100">
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow">
                                {user?.name?.charAt(0) || 'F'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.department} Dept.</p>
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
                            {activeView === 'tasks' && 'My Active Tasks'}
                            {activeView === 'map' && 'Map View & Navigation'}
                            {activeView === 'completed' && 'Completed Tasks'}
                            {activeView === 'performance' && 'Performance Metrics'}
                            {activeView === 'activity' && 'Activity Log'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchTasks}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-all">
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <RefreshCw size={40} className="animate-spin text-emerald-500 mb-4" />
                            <p className="text-slate-500 font-medium">Loading your tasks...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div key={activeView} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>

                                {/* ===== OVERVIEW ===== */}
                                {activeView === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Stats Row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {statCards.map((card, i) => (
                                                <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all duration-300 group">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className={`w-10 h-10 rounded-xl ${card.light} flex items-center justify-center`}>
                                                            <card.icon size={20} />
                                                        </div>
                                                        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                                                    </div>
                                                    <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                                                    <p className="text-sm text-slate-500 mt-1">{card.label}</p>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Resolution Rate + Priority Tasks */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Resolution Rate Card */}
                                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">Resolution Rate</h3>
                                                <div className="flex items-center justify-center">
                                                    <div className="relative w-36 h-36">
                                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                                            <circle cx="60" cy="60" r="52" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                                                            <circle cx="60" cy="60" r="52" stroke="url(#greenGrad)" strokeWidth="10" fill="none"
                                                                strokeDasharray={`${resolutionRate * 3.267} 326.7`} strokeLinecap="round" />
                                                            <defs>
                                                                <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                    <stop offset="0%" stopColor="#10b981" />
                                                                    <stop offset="100%" stopColor="#059669" />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-3xl font-bold text-slate-800">{resolutionRate}%</span>
                                                            <span className="text-xs text-slate-500">completed</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                                                    <div className="bg-emerald-50 rounded-xl py-2">
                                                        <p className="text-lg font-bold text-emerald-700">{stats.resolved}</p>
                                                        <p className="text-xs text-emerald-600">Resolved</p>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-xl py-2">
                                                        <p className="text-lg font-bold text-slate-700">{stats.total}</p>
                                                        <p className="text-xs text-slate-500">Total</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Priority Tasks */}
                                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Priority Tasks</h3>
                                                    <button onClick={() => setActiveView('tasks')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                                        View All <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {tasks.filter(t => t.status !== 'resolved').sort((a, b) => {
                                                        const order = { high: 0, medium: 1, low: 2 };
                                                        return (order[a.severity] || 2) - (order[b.severity] || 2);
                                                    }).slice(0, 5).map((task, idx) => {
                                                        const sev = SEVERITY_CONFIG[task.severity] || SEVERITY_CONFIG.medium;
                                                        const SevIcon = sev.icon;
                                                        return (
                                                            <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                                                className={`flex items-center gap-4 p-3 rounded-xl border ${sev.border} ${sev.bg} cursor-pointer hover:shadow-sm transition-all`}
                                                                onClick={() => { setSelectedTask(task); setDetailModalOpen(true); }}>
                                                                <div className={`w-8 h-8 rounded-lg ${sev.badge} flex items-center justify-center flex-shrink-0`}>
                                                                    <SevIcon size={16} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-slate-800 text-sm capitalize truncate">{task.category}</p>
                                                                    <p className="text-xs text-slate-500 truncate">{task.description}</p>
                                                                </div>
                                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_CONFIG[task.status]?.bg || 'bg-slate-100 text-slate-600'}`}>
                                                                    {STATUS_CONFIG[task.status]?.label || task.status}
                                                                </span>
                                                            </motion.div>
                                                        );
                                                    })}
                                                    {tasks.filter(t => t.status !== 'resolved').length === 0 && (
                                                        <div className="flex flex-col items-center py-8 text-slate-400">
                                                            <CheckCircle size={40} className="mb-2" />
                                                            <p className="font-medium">All tasks completed!</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">Quick Actions</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                                <button onClick={() => setActiveView('tasks')}
                                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all group">
                                                    <FileText size={24} className="group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs font-semibold">View Tasks</span>
                                                </button>
                                                <button onClick={() => setActiveView('map')}
                                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all group">
                                                    <MapIcon size={24} className="group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs font-semibold">Map View</span>
                                                </button>
                                                <button onClick={() => setActiveView('completed')}
                                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all group">
                                                    <CircleCheck size={24} className="group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs font-semibold">Completed</span>
                                                </button>
                                                <button onClick={fetchTasks}
                                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-all group">
                                                    <RefreshCw size={24} className="group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs font-semibold">Sync Data</span>
                                                </button>
                                                <button onClick={() => setActiveView('performance')}
                                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-all group">
                                                    <TrendingUp size={24} className="group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs font-semibold">My Stats</span>
                                                </button>
                                                <button onClick={() => setActiveView('activity')}
                                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all group">
                                                    <BookOpen size={24} className="group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs font-semibold">Activity</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ===== TASKS / COMPLETED ===== */}
                                {(activeView === 'tasks' || activeView === 'completed') && (
                                    <div className="space-y-4">
                                        {/* Filters */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="relative flex-1">
                                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="text" placeholder="Search tasks..."
                                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                                            </div>
                                            <div className="flex gap-2">
                                                {['all', 'high', 'medium', 'low'].map(sev => (
                                                    <button key={sev} onClick={() => setSeverityFilter(sev)}
                                                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border
                                                            ${severityFilter === sev
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                            }`}>
                                                        {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Task Count */}
                                        <p className="text-sm text-slate-500">
                                            Showing <span className="font-semibold text-slate-700">{filteredTasks.length}</span> {activeView === 'completed' ? 'completed' : 'active'} tasks
                                        </p>

                                        {/* Task Cards Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {filteredTasks.map((task, idx) => {
                                                const sev = SEVERITY_CONFIG[task.severity] || SEVERITY_CONFIG.medium;
                                                return (
                                                    <motion.div key={task.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                                                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                                        {/* Severity Bar */}
                                                        <div className={`h-1.5 ${sev.bar}`} />
                                                        <div className="p-5">
                                                            {/* Header */}
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-bold text-slate-800 capitalize truncate">{task.category}</h3>
                                                                    <p className="text-xs text-slate-400 mt-1">
                                                                        {task.timestamp ? new Date(task.timestamp * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${sev.badge} flex-shrink-0`}>
                                                                    {task.severity?.toUpperCase()}
                                                                </span>
                                                            </div>

                                                            {/* Description */}
                                                            <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{task.description}</p>

                                                            {/* Location */}
                                                            {task.latitude && (
                                                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 bg-slate-50 rounded-lg px-3 py-2">
                                                                    <MapPin size={14} className="text-slate-400" />
                                                                    <span>{task.latitude?.toFixed(4)}, {task.longitude?.toFixed(4)}</span>
                                                                </div>
                                                            )}

                                                            {/* Status */}
                                                            <div className="flex items-center justify-between mb-4">
                                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${STATUS_CONFIG[task.status]?.bg || 'bg-slate-100 text-slate-600'}`}>
                                                                    {STATUS_CONFIG[task.status]?.label || task.status}
                                                                </span>
                                                                <button onClick={() => { setSelectedTask(task); setDetailModalOpen(true); }}
                                                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                                                    <Eye size={14} /> Details
                                                                </button>
                                                            </div>

                                                            {/* Action Buttons */}
                                                            {task.status !== 'resolved' && (
                                                                <div className="flex gap-2">
                                                                    {(task.status === 'assigned' || task.status === 'open') && (
                                                                        <button onClick={() => openConfirm(task, 'in_progress')}
                                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20">
                                                                            <Play size={15} /> Start Work
                                                                        </button>
                                                                    )}
                                                                    {task.status === 'in_progress' && (
                                                                        <button onClick={() => openConfirm(task, 'resolved')}
                                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20">
                                                                            <Camera size={15} /> Mark Resolved
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {task.status === 'resolved' && (
                                                                <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold">
                                                                    <CheckCircle size={15} /> Completed
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {filteredTasks.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                                <FileText size={48} className="mb-3" />
                                                <p className="font-semibold text-lg">No tasks found</p>
                                                <p className="text-sm mt-1">Try adjusting your filters</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ===== PERFORMANCE ===== */}
                                {activeView === 'performance' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                                    <CheckCircle size={28} className="text-emerald-600" />
                                                </div>
                                                <p className="text-3xl font-bold text-slate-800">{stats.resolved}</p>
                                                <p className="text-sm text-slate-500 mt-1">Tasks Resolved</p>
                                            </div>
                                            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
                                                    <TrendingUp size={28} className="text-blue-600" />
                                                </div>
                                                <p className="text-3xl font-bold text-slate-800">{resolutionRate}%</p>
                                                <p className="text-sm text-slate-500 mt-1">Resolution Rate</p>
                                            </div>
                                            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-50 flex items-center justify-center">
                                                    <Star size={28} className="text-amber-600" />
                                                </div>
                                                <p className="text-3xl font-bold text-slate-800">
                                                    {resolutionRate >= 80 ? 'A+' : resolutionRate >= 60 ? 'A' : resolutionRate >= 40 ? 'B' : 'C'}
                                                </p>
                                                <p className="text-sm text-slate-500 mt-1">Performance Grade</p>
                                            </div>
                                        </div>

                                        {/* Daily/Weekly Stats */}
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                                                Quick Stats
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-blue-700">{stats.assigned}</p>
                                                    <p className="text-xs text-slate-500 mt-1">Assigned</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-indigo-700">{stats.inProgress}</p>
                                                    <p className="text-xs text-slate-500 mt-1">In Progress</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-red-700">{stats.highSev}</p>
                                                    <p className="text-xs text-slate-500 mt-1">High Priority</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-emerald-700">{stats.resolved}</p>
                                                    <p className="text-xs text-slate-500 mt-1">Completed</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Breakdown */}
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">Task Breakdown by Severity</h3>
                                            <div className="space-y-4">
                                                {['high', 'medium', 'low'].map(sev => {
                                                    const count = tasks.filter(t => t.severity === sev).length;
                                                    const resolved = tasks.filter(t => t.severity === sev && t.status === 'resolved').length;
                                                    const pct = count > 0 ? Math.round((resolved / count) * 100) : 0;
                                                    const sConf = SEVERITY_CONFIG[sev];
                                                    return (
                                                        <div key={sev}>
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <span className={`text-sm font-semibold capitalize ${sConf.color}`}>{sev} Severity</span>
                                                                <span className="text-sm text-slate-500">{resolved}/{count} resolved ({pct}%)</span>
                                                            </div>
                                                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                                                                    className={`h-full rounded-full ${sConf.bar}`} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Category Breakdown */}
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">Tasks by Category</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {Object.entries(
                                                    tasks.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {})
                                                ).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                                                    <div key={cat} className="bg-slate-50 rounded-xl p-4 text-center hover:bg-slate-100 transition-all">
                                                        <p className="text-2xl font-bold text-slate-800">{count}</p>
                                                        <p className="text-xs text-slate-500 capitalize mt-1">{cat}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Performance Insights */}
                                        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                    <Award size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">Performance Insights</h3>
                                                    <p className="text-sm text-emerald-50">Your work summary</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                                    <p className="text-2xl font-bold">{stats.resolved}</p>
                                                    <p className="text-sm text-emerald-50 mt-1">Total Completed</p>
                                                </div>
                                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                                    <p className="text-2xl font-bold">{resolutionRate}%</p>
                                                    <p className="text-sm text-emerald-50 mt-1">Success Rate</p>
                                                </div>
                                            </div>
                                            {resolutionRate >= 80 && (
                                                <div className="mt-4 flex items-center gap-2 bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                                                    <Star size={20} className="text-yellow-300" />
                                                    <p className="text-sm font-medium">Excellent performance! Keep it up! 🎉</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ===== MAP VIEW ===== */}
                                {activeView === 'map' && (
                                    <div className="space-y-6">
                                        {/* Map Placeholder */}
                                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                            <div className="h-[400px] relative bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
                                                <div className="text-center">
                                                    <MapIcon size={64} className="text-slate-300 mx-auto mb-4" />
                                                    <h3 className="text-lg font-bold text-slate-600 mb-2">Interactive Map View</h3>
                                                    <p className="text-sm text-slate-500 mb-4">View all your tasks on a map</p>
                                                    <div className="flex gap-2 justify-center">
                                                        <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-semibold">High Priority</span>
                                                        <span className="px-3 py-1.5 bg-amber-500 text-white rounded-full text-xs font-semibold">Medium Priority</span>
                                                        <span className="px-3 py-1.5 bg-emerald-500 text-white rounded-full text-xs font-semibold">Low Priority</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nearby Tasks */}
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                                                    <Route className="inline mr-2" size={16} />
                                                    Nearby Tasks
                                                </h3>
                                                <span className="text-xs text-emerald-600 font-medium">
                                                    {tasks.filter(t => t.status !== 'resolved' && t.latitude).length} tasks with location
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {tasks.filter(t => t.status !== 'resolved' && t.latitude).slice(0, 6).map((task, idx) => {
                                                    const sev = SEVERITY_CONFIG[task.severity] || SEVERITY_CONFIG.medium;
                                                    return (
                                                        <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} 
                                                            animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                                            className={`p-4 rounded-xl border ${sev.border} ${sev.bg}`}>
                                                            <div className="flex items-start justify-between mb-2">
                                                                <h4 className="font-semibold text-sm text-slate-800 capitalize">{task.category}</h4>
                                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${sev.badge}`}>
                                                                    {task.severity?.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                                    <MapPin size={12} />
                                                                    <span>{task.latitude?.toFixed(3)}, {task.longitude?.toFixed(3)}</span>
                                                                </div>
                                                                <a href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`}
                                                                    target="_blank" rel="noopener noreferrer"
                                                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                                                                    Navigate →
                                                                </a>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                            {tasks.filter(t => t.status !== 'resolved' && t.latitude).length === 0 && (
                                                <div className="text-center py-8 text-slate-400">
                                                    <MapPin size={40} className="mx-auto mb-2" />
                                                    <p className="text-sm">No tasks with location data</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Route Optimization Suggestion */}
                                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                    <Route size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">Smart Route Planning</h3>
                                                    <p className="text-sm text-blue-50">Optimize your field visits</p>
                                                </div>
                                            </div>
                                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                                <p className="text-sm mb-2">💡 Recommended route saves time by visiting nearby locations together</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-xs">Plan your day efficiently</span>
                                                    <button className="px-3 py-1.5 bg-white text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-all">
                                                        View Route
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ===== ACTIVITY LOG ===== */}
                                {activeView === 'activity' && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                                                <Calendar className="inline mr-2" size={16} />
                                                Recent Activity
                                            </h3>
                                            <div className="space-y-4">
                                                {tasks.slice(0, 15).map((task, idx) => {
                                                    const getActivityIcon = (status) => {
                                                        if (status === 'resolved') return <CheckCircle2 className="text-emerald-600" size={16} />;
                                                        if (status === 'in_progress') return <Activity className="text-indigo-600" size={16} />;
                                                        if (status === 'assigned') return <Clock className="text-blue-600" size={16} />;
                                                        return <AlertTriangle className="text-amber-600" size={16} />;
                                                    };

                                                    const getActivityText = (task) => {
                                                        if (task.status === 'resolved') return 'Completed';
                                                        if (task.status === 'in_progress') return 'Working on';
                                                        if (task.status === 'assigned') return 'Assigned to you';
                                                        return 'New report';
                                                    };

                                                    return (
                                                        <motion.div key={task.id} initial={{ opacity: 0, x: -20 }} 
                                                            animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                                                            className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                                {getActivityIcon(task.status)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    {getActivityText(task)} <span className="capitalize text-emerald-600">{task.category}</span>
                                                                </p>
                                                                <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                                                                <p className="text-xs text-slate-400 mt-1">
                                                                    {task.timestamp ? new Date(task.timestamp * 1000).toLocaleString('en-IN', {
                                                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                                    }) : 'Recently'}
                                                                </p>
                                                            </div>
                                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0
                                                                ${STATUS_CONFIG[task.status]?.bg || 'bg-slate-100 text-slate-600'}`}>
                                                                {STATUS_CONFIG[task.status]?.label || task.status}
                                                            </span>
                                                        </motion.div>
                                                    );
                                                })}
                                                {tasks.length === 0 && (
                                                    <div className="text-center py-8 text-slate-400">
                                                        <BookOpen size={40} className="mx-auto mb-2" />
                                                        <p className="text-sm">No activity to show</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Daily Summary */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                                        <Target size={20} className="text-blue-600" />
                                                    </div>
                                                    <h4 className="font-semibold text-slate-800">Today's Tasks</h4>
                                                </div>
                                                <p className="text-3xl font-bold text-slate-800">{stats.assigned + stats.inProgress}</p>
                                                <p className="text-xs text-slate-500 mt-1">Active tasks assigned to you</p>
                                            </div>
                                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                        <CheckCircle2 size={20} className="text-emerald-600" />
                                                    </div>
                                                    <h4 className="font-semibold text-slate-800">Completed</h4>
                                                </div>
                                                <p className="text-3xl font-bold text-slate-800">{stats.resolved}</p>
                                                <p className="text-xs text-slate-500 mt-1">Tasks resolved successfully</p>
                                            </div>
                                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                                        <Timer size={20} className="text-amber-600" />
                                                    </div>
                                                    <h4 className="font-semibold text-slate-800">Avg. Time</h4>
                                                </div>
                                                <p className="text-3xl font-bold text-slate-800">~2h</p>
                                                <p className="text-xs text-slate-500 mt-1">Per task completion</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </main>

            {/* === Task Detail Modal === */}
            <AnimatePresence>
                {detailModalOpen && selectedTask && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] p-4"
                        onClick={() => setDetailModalOpen(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                            {/* Severity Bar */}
                            <div className={`h-2 ${SEVERITY_CONFIG[selectedTask.severity]?.bar || 'bg-slate-300'}`} />
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 capitalize">{selectedTask.category}</h2>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {selectedTask.timestamp ? new Date(selectedTask.timestamp * 1000).toLocaleString('en-IN') : 'N/A'}
                                        </p>
                                    </div>
                                    <button onClick={() => setDetailModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                                        <p className="text-sm text-slate-700 mt-1 leading-relaxed">{selectedTask.description || 'No description provided'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</label>
                                            <p className={`mt-1 text-sm font-semibold capitalize ${SEVERITY_CONFIG[selectedTask.severity]?.color || 'text-slate-700'}`}>{selectedTask.severity}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                                            <span className={`inline-block mt-1 px-3 py-1 rounded-lg text-xs font-bold ${STATUS_CONFIG[selectedTask.status]?.bg || 'bg-slate-100 text-slate-600'}`}>
                                                {STATUS_CONFIG[selectedTask.status]?.label || selectedTask.status}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedTask.latitude && (
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3">
                                                <MapPin size={16} className="text-emerald-600" />
                                                <span>{selectedTask.latitude?.toFixed(6)}, {selectedTask.longitude?.toFixed(6)}</span>
                                                <a href={`https://www.google.com/maps?q=${selectedTask.latitude},${selectedTask.longitude}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="ml-auto text-emerald-600 hover:text-emerald-700 font-medium text-xs">
                                                    Open Map →
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {selectedTask.department && (
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</label>
                                            <p className="text-sm text-slate-700 mt-1">{selectedTask.department}</p>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    {selectedTask.timeline && selectedTask.timeline.length > 0 && (
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Timeline</label>
                                            <div className="mt-2 space-y-2">
                                                {selectedTask.timeline.map((log, i) => (
                                                    <div key={i} className="flex items-start gap-3 text-sm">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-slate-700 font-medium capitalize">{log.status?.replace('_', ' ')}</p>
                                                            <p className="text-xs text-slate-400">{log.message}</p>
                                                            <p className="text-xs text-slate-400">{log.timestamp ? new Date(log.timestamp * 1000).toLocaleString('en-IN') : ''}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                {selectedTask.status !== 'resolved' && (
                                    <div className="mt-6 flex gap-3">
                                        {(selectedTask.status === 'assigned' || selectedTask.status === 'open') && (
                                            <button onClick={() => { setDetailModalOpen(false); openConfirm(selectedTask, 'in_progress'); }}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm">
                                                <Play size={16} /> Start Work
                                            </button>
                                        )}
                                        {selectedTask.status === 'in_progress' && (
                                            <button onClick={() => { setDetailModalOpen(false); openConfirm(selectedTask, 'resolved'); }}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-sm">
                                                <Camera size={16} /> Mark Resolved
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* === Confirm Action Modal === */}
            <AnimatePresence>
                {confirmModalOpen && confirmAction && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2100] p-4"
                        onClick={() => { setConfirmModalOpen(false); setConfirmAction(null); }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${confirmAction.status === 'resolved' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                                {confirmAction.status === 'resolved' ? <CheckCircle size={28} className="text-emerald-600" /> : <Play size={28} className="text-blue-600" />}
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                                {confirmAction.status === 'resolved' ? 'Mark as Resolved?' : 'Start Working?'}
                            </h3>
                            <p className="text-sm text-slate-500 text-center mb-1 capitalize font-medium">{confirmAction.task.category}</p>
                            <p className="text-xs text-slate-400 text-center mb-6">
                                {confirmAction.status === 'resolved'
                                    ? 'This will mark the task as completed.'
                                    : 'This will update the task status to In Progress.'
                                }
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => { setConfirmModalOpen(false); setConfirmAction(null); }}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all">
                                    Cancel
                                </button>
                                <button disabled={actionLoading}
                                    onClick={() => handleStatusUpdate(confirmAction.task.id, confirmAction.status)}
                                    className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-white transition-all shadow-sm disabled:opacity-50
                                        ${confirmAction.status === 'resolved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                    {actionLoading ? 'Updating...' : 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <VoiceAssistantButton
                isListening={isListening}
                voiceTranscript={voiceTranscript}
                voiceFeedback={voiceFeedback}
                toggleVoiceCommand={toggleVoiceCommand}
            />
        </div>
    );
};

export default FieldOfficerDashboard;
