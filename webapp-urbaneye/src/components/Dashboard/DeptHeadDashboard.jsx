import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceCommand } from '../../hooks/useVoiceCommand';
import VoiceAssistantButton from '../common/VoiceAssistantButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, FileText, LogOut, Menu, X, Search, MapPin, RefreshCw,
    Clock, CheckCircle, Activity, ChevronRight, ChevronLeft, Building, UserPlus,
    TrendingUp, AlertTriangle, BarChart3, Eye, Filter, Calendar, Award, Target,
    ArrowUpRight, ArrowDownRight, Zap, User, CheckCircle2, XCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1';

const SEVERITY_CONFIG = {
    high: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', bar: 'bg-red-500' },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
    low: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
};

const STATUS_CONFIG = {
    open: { label: 'Unassigned', bg: 'bg-yellow-100 text-yellow-800' },
    assigned: { label: 'Assigned', bg: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'In Progress', bg: 'bg-indigo-100 text-indigo-800' },
    resolved: { label: 'Resolved', bg: 'bg-emerald-100 text-emerald-800' },
};

const DeptHeadDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [reports, setReports] = useState([]);
    const [fieldOfficers, setFieldOfficers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportDetailModal, setReportDetailModal] = useState(false);
    const [selectedOfficerView, setSelectedOfficerView] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const stats = useMemo(() => {
        const total = reports.length;
        const resolved = reports.filter(r => r.status === 'resolved').length;
        const pending = reports.filter(r => r.status === 'open').length;
        const inProgress = reports.filter(r => ['in_progress', 'assigned'].includes(r.status)).length;
        const highPriority = reports.filter(r => r.severity === 'high' && r.status !== 'resolved').length;
        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
        
        return { total, resolved, pending, inProgress, highPriority, resolutionRate };
    }, [reports]);

    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
            if (statusFilter !== 'all' && r.status !== statusFilter) return false;
            if (searchTerm) {
                const s = searchTerm.toLowerCase();
                return (r.category?.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s));
            }
            return true;
        });
    }, [reports, severityFilter, statusFilter, searchTerm]);

    const officerStats = useMemo(() => {
        return fieldOfficers.map(officer => {
            const assigned = reports.filter(r => r.assigned_to === officer.id).length;
            const completed = reports.filter(r => r.assigned_to === officer.id && r.status === 'resolved').length;
            const inProgress = reports.filter(r => r.assigned_to === officer.id && r.status === 'in_progress').length;
            const rate = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
            return { ...officer, assigned, completed, inProgress, rate };
        });
    }, [fieldOfficers, reports]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await axios.get(`${API_BASE}/reports`, { headers });
            const data = res.data.reports || [];
            setReports(data);

            const staffRes = await axios.get(`${API_BASE}/gov/staff`, { headers });
            if (staffRes.data.success) {
                const officers = staffRes.data.staff.filter(s => s.role === 'field_officer' && s.department === user.department);
                setFieldOfficers(officers);
            }

        } catch (error) {
            console.error("Error fetching data", error);
        }
        setLoading(false);
    };

    const processVoiceCommand = (command) => {
        const cmd = command.toLowerCase().trim();

        if (cmd.includes('advance select') && cmd.includes('full')) {
            setActiveView('reports');
            if (cmd.includes('delhi') || cmd.includes('gwalior') || cmd.includes('canberra')) {
                speak('Advanced selection processed. Showing detailed reports layout.');
            }
            return;
        }

        if (cmd.includes('overview') || cmd.includes('home')) { setActiveView('overview'); speak('Opening Overview'); }
        else if (cmd.includes('reports') || cmd.includes('manage reports')) { setActiveView('reports'); speak('Opening Reports'); }
        else if (cmd.includes('team') || cmd.includes('staff')) { setActiveView('team'); speak('Opening Team Management'); }
        else if (cmd.includes('analytics') || cmd.includes('charts')) { setActiveView('analytics'); speak('Opening Analytics'); }
    };

    const { isListening, voiceTranscript, voiceFeedback, toggleVoiceCommand, speak } = useVoiceCommand(processVoiceCommand);

    const handleAssign = async (officerId) => {
        if (!selectedReport) return;
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.put(`${API_BASE}/reports/${selectedReport.id}/assign`, { officerId }, { headers });

            setAssignModalOpen(false);
            setSelectedReport(null);
            fetchDashboardData();
        } catch (error) {
            console.error("Assign error", error);
            alert("Failed to assign report.");
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'reports', icon: FileText, label: 'Department Reports' },
        { id: 'team', icon: Users, label: 'Field Team' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' }
    ];

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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                        <Building size={20} className="text-white" />
                    </div>
                    {!sidebarCollapsed && (
                        <div className="overflow-hidden">
                            <h1 className="font-bold text-slate-800 text-sm tracking-wide">UrbanEye</h1>
                            <p className="text-xs text-slate-500">{user?.department} Head</p>
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
                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            title={sidebarCollapsed ? item.label : ''}>
                            <item.icon size={20} className={activeView === item.id ? 'text-blue-600' : ''} />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* User & Logout */}
                <div className="p-3 border-t border-slate-100">
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow">
                                {user?.name?.charAt(0) || 'D'}
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
                            {activeView === 'overview' && 'Department Overview'}
                            {activeView === 'reports' && 'Manage Reports'}
                            {activeView === 'team' && 'Field Team Management'}
                            {activeView === 'analytics' && 'Analytics & Insights'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">Welcome back, {user?.name}</p>
                    </div>
                    <button onClick={fetchDashboardData}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <RefreshCw size={40} className="animate-spin text-blue-500 mb-4" />
                            <p className="text-slate-500 font-medium">Loading dashboard...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div key={activeView} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>

                                {/* ===== OVERVIEW ===== */}
                                {activeView === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                            {[
                                                { label: 'Total Reports', value: stats.total, icon: FileText, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 text-blue-700' },
                                                { label: 'Unassigned', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 text-amber-700' },
                                                { label: 'In Progress', value: stats.inProgress, icon: Activity, gradient: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50 text-indigo-700' },
                                                { label: 'Resolved', value: stats.resolved, icon: CheckCircle, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 text-emerald-700' },
                                                { label: 'High Priority', value: stats.highPriority, icon: AlertTriangle, gradient: 'from-red-500 to-rose-600', bg: 'bg-red-50 text-red-700' },
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

                                        {/* Resolution Rate + Urgent Reports */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Resolution Rate */}
                                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                                                    Department Performance
                                                </h3>
                                                <div className="flex items-center justify-center">
                                                    <div className="relative w-36 h-36">
                                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                                            <circle cx="60" cy="60" r="52" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                                                            <circle cx="60" cy="60" r="52" stroke="url(#blueGrad)" strokeWidth="10" fill="none"
                                                                strokeDasharray={`${stats.resolutionRate * 3.267} 326.7`} strokeLinecap="round" />
                                                            <defs>
                                                                <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                    <stop offset="0%" stopColor="#3b82f6" />
                                                                    <stop offset="100%" stopColor="#1d4ed8" />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-3xl font-bold text-slate-800">{stats.resolutionRate}%</span>
                                                            <span className="text-xs text-slate-500">resolved</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                                                    <div className="bg-blue-50 rounded-xl py-2">
                                                        <p className="text-lg font-bold text-blue-700">{fieldOfficers.length}</p>
                                                        <p className="text-xs text-blue-600">Officers</p>
                                                    </div>
                                                    <div className="bg-emerald-50 rounded-xl py-2">
                                                        <p className="text-lg font-bold text-emerald-700">{stats.resolved}</p>
                                                        <p className="text-xs text-emerald-600">Completed</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Urgent Reports */}
                                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                                                        Urgent Unassigned Reports
                                                    </h3>
                                                    <button onClick={() => setActiveView('reports')} 
                                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                                        View All <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                                                    {reports.filter(r => r.status === 'open').sort((a, b) => {
                                                        const order = { high: 0, medium: 1, low: 2 };
                                                        return (order[a.severity] || 2) - (order[b.severity] || 2);
                                                    }).slice(0, 6).map((report, idx) => {
                                                        const sev = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.medium;
                                                        return (
                                                            <motion.div key={report.id} initial={{ opacity: 0, x: -10 }} 
                                                                animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                                                className={`flex items-center gap-4 p-3 rounded-xl border ${sev.border} ${sev.bg} hover:shadow-sm transition-all`}>
                                                                <div className={`w-8 h-8 rounded-lg ${sev.badge} flex items-center justify-center flex-shrink-0`}>
                                                                    <AlertTriangle size={16} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-slate-800 text-sm capitalize truncate">
                                                                        {report.category}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 truncate">{report.description}</p>
                                                                </div>
                                                                <button onClick={() => { setSelectedReport(report); setAssignModalOpen(true); }}
                                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all flex-shrink-0">
                                                                    Assign
                                                                </button>
                                                            </motion.div>
                                                        );
                                                    })}
                                                    {reports.filter(r => r.status === 'open').length === 0 && (
                                                        <div className="flex flex-col items-center py-8 text-slate-400">
                                                            <CheckCircle size={40} className="mb-2" />
                                                            <p className="font-medium">All reports assigned!</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Top Performing Officers */}
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                                                Top Performing Officers
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {officerStats.sort((a, b) => b.rate - a.rate).slice(0, 3).map((officer, idx) => (
                                                    <div key={officer.id} 
                                                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg
                                                            ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                                                              idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
                                                              'bg-gradient-to-br from-orange-400 to-orange-600'}`}>
                                                            #{idx + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-slate-800 truncate">{officer.name}</p>
                                                            <p className="text-xs text-slate-500">{officer.completed}/{officer.assigned} resolved</p>
                                                            <div className="mt-1 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-500' : 'bg-orange-500'}`}
                                                                    style={{ width: `${officer.rate}%` }} />
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xl font-bold text-slate-800">{officer.rate}%</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ===== REPORTS ===== */}
                                {activeView === 'reports' && (
                                    <div className="space-y-4">
                                        {/* Filters */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="relative flex-1">
                                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="text" placeholder="Search reports..."
                                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {['all', 'high', 'medium', 'low'].map(sev => (
                                                    <button key={sev} onClick={() => setSeverityFilter(sev)}
                                                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border
                                                            ${severityFilter === sev
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                            }`}>
                                                        {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {['all', 'open', 'assigned', 'in_progress', 'resolved'].map(status => (
                                                    <button key={status} onClick={() => setStatusFilter(status)}
                                                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border
                                                            ${statusFilter === status
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                            }`}>
                                                        {status === 'all' ? 'All Status' : STATUS_CONFIG[status]?.label || status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-500">
                                            Showing <span className="font-semibold text-slate-700">{filteredReports.length}</span> reports
                                        </p>

                                        {/* Reports Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {filteredReports.map((report, idx) => {
                                                const sev = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.medium;
                                                return (
                                                    <motion.div key={report.id} initial={{ opacity: 0, y: 16 }} 
                                                        animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                                                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                                        <div className={`h-1.5 ${sev.bar}`} />
                                                        <div className="p-5">
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-bold text-slate-800 capitalize truncate">{report.category}</h3>
                                                                    <p className="text-xs text-slate-400 mt-1">
                                                                        {report.timestamp ? new Date(report.timestamp * 1000).toLocaleDateString('en-IN', 
                                                                            { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${sev.badge} flex-shrink-0`}>
                                                                    {report.severity?.toUpperCase()}
                                                                </span>
                                                            </div>

                                                            <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                                                                {report.description}
                                                            </p>

                                                            {report.latitude && (
                                                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 bg-slate-50 rounded-lg px-3 py-2">
                                                                    <MapPin size={14} />
                                                                    <span>{report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}</span>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center justify-between mb-4">
                                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold 
                                                                    ${STATUS_CONFIG[report.status]?.bg || 'bg-slate-100 text-slate-600'}`}>
                                                                    {STATUS_CONFIG[report.status]?.label || report.status}
                                                                </span>
                                                                <button onClick={() => { setSelectedReport(report); setReportDetailModal(true); }}
                                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                                                    <Eye size={14} /> Details
                                                                </button>
                                                            </div>

                                                            {report.status === 'open' && (
                                                                <button onClick={() => { setSelectedReport(report); setAssignModalOpen(true); }}
                                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all">
                                                                    <UserPlus size={15} /> Assign to Officer
                                                                </button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {filteredReports.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                                <FileText size={48} className="mb-3" />
                                                <p className="font-semibold text-lg">No reports found</p>
                                                <p className="text-sm mt-1">Try adjusting your filters</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ===== TEAM ===== */}
                                {activeView === 'team' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {officerStats.map((officer, idx) => (
                                                <motion.div key={officer.id} initial={{ opacity: 0, scale: 0.95 }} 
                                                    animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                                                    className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                            {officer.name?.charAt(0) || 'O'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-slate-800 truncate">{officer.name}</h3>
                                                            <p className="text-sm text-slate-500 truncate">{officer.email}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                                                    Active
                                                                </span>
                                                                <span className="text-xs text-slate-400">{officer.department}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                                                            <p className="text-xl font-bold text-blue-700">{officer.assigned}</p>
                                                            <p className="text-xs text-blue-600 mt-1">Assigned</p>
                                                        </div>
                                                        <div className="bg-indigo-50 rounded-xl p-3 text-center">
                                                            <p className="text-xl font-bold text-indigo-700">{officer.inProgress}</p>
                                                            <p className="text-xs text-indigo-600 mt-1">Active</p>
                                                        </div>
                                                        <div className="bg-emerald-50 rounded-xl p-3 text-center">
                                                            <p className="text-xl font-bold text-emerald-700">{officer.completed}</p>
                                                            <p className="text-xs text-emerald-600 mt-1">Done</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-medium text-slate-600">Performance</span>
                                                            <span className="text-xs font-bold text-slate-800">{officer.rate}%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${officer.rate}%` }} 
                                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                                className={`h-full rounded-full ${officer.rate >= 80 ? 'bg-emerald-500' : officer.rate >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} />
                                                        </div>
                                                    </div>

                                                    <button onClick={() => setSelectedOfficerView(officer)}
                                                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all">
                                                        <Eye size={14} /> View Details
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {fieldOfficers.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                                <Users size={48} className="mb-3" />
                                                <p className="font-semibold text-lg">No field officers found</p>
                                                <p className="text-sm mt-1">No officers in your department yet</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ===== ANALYTICS ===== */}
                                {activeView === 'analytics' && (
                                    <div className="space-y-6">
                                        {/* Category Breakdown */}
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                                                Reports by Category
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {Object.entries(
                                                    reports.reduce((acc, r) => { 
                                                        acc[r.category] = (acc[r.category] || 0) + 1; 
                                                        return acc; 
                                                    }, {})
                                                ).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                                                    <div key={cat} className="bg-slate-50 rounded-xl p-4 text-center hover:bg-slate-100 transition-all">
                                                        <p className="text-2xl font-bold text-slate-800">{count}</p>
                                                        <p className="text-xs text-slate-500 capitalize mt-1">{cat}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Severity Breakdown */}
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                                                Performance by Severity
                                            </h3>
                                            <div className="space-y-4">
                                                {['high', 'medium', 'low'].map(sev => {
                                                    const count = reports.filter(r => r.severity === sev).length;
                                                    const resolved = reports.filter(r => r.severity === sev && r.status === 'resolved').length;
                                                    const pct = count > 0 ? Math.round((resolved / count) * 100) : 0;
                                                    const sConf = SEVERITY_CONFIG[sev];
                                                    return (
                                                        <div key={sev}>
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <span className={`text-sm font-semibold capitalize ${sConf.color}`}>{sev} Severity</span>
                                                                <span className="text-sm text-slate-500">{resolved}/{count} resolved ({pct}%)</span>
                                                            </div>
                                                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} 
                                                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                                                    className={`h-full rounded-full ${sConf.bar}`} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Officer Leaderboard */}
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                                                Officer Leaderboard
                                            </h3>
                                            <div className="space-y-3">
                                                {officerStats.sort((a, b) => b.completed - a.completed).map((officer, idx) => (
                                                    <div key={officer.id} 
                                                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md
                                                            ${idx < 3 ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-slate-400'}`}>
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-slate-800 truncate">{officer.name}</p>
                                                            <p className="text-xs text-slate-500">{officer.completed} tasks completed</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-slate-800">{officer.rate}%</p>
                                                            <p className="text-xs text-slate-500">Success Rate</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </main>

            {/* ===== ASSIGN MODAL ===== */}
            <AnimatePresence>
                {assignModalOpen && selectedReport && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] p-4"
                        onClick={() => { setAssignModalOpen(false); setSelectedReport(null); }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl" 
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Assign to Officer</h2>
                                        <p className="text-sm text-slate-500 mt-1 capitalize">
                                            {selectedReport.category} - {selectedReport.severity} priority
                                        </p>
                                    </div>
                                    <button onClick={() => { setAssignModalOpen(false); setSelectedReport(null); }} 
                                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <p className="text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-xl">
                                    {selectedReport.description}
                                </p>

                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {fieldOfficers.map(officer => {
                                        const oStat = officerStats.find(o => o.id === officer.id);
                                        return (
                                            <button key={officer.id} onClick={() => handleAssign(officer.id)}
                                                className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                                                    {officer.name?.charAt(0) || 'O'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-slate-800 truncate">{officer.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {oStat?.inProgress || 0} active • {oStat?.rate || 0}% success rate
                                                    </p>
                                                </div>
                                                <UserPlus size={18} className="text-blue-600 flex-shrink-0" />
                                            </button>
                                        );
                                    })}
                                    {fieldOfficers.length === 0 && (
                                        <div className="text-center py-8 text-slate-400">
                                            <Users size={40} className="mx-auto mb-2" />
                                            <p>No officers available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== REPORT DETAIL MODAL ===== */}
            <AnimatePresence>
                {reportDetailModal && selectedReport && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] p-4"
                        onClick={() => { setReportDetailModal(false); setSelectedReport(null); }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" 
                            onClick={e => e.stopPropagation()}>
                            <div className={`h-2 ${SEVERITY_CONFIG[selectedReport.severity]?.bar || 'bg-slate-300'}`} />
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 capitalize">{selectedReport.category}</h2>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {selectedReport.timestamp ? new Date(selectedReport.timestamp * 1000).toLocaleString('en-IN') : 'N/A'}
                                        </p>
                                    </div>
                                    <button onClick={() => { setReportDetailModal(false); setSelectedReport(null); }} 
                                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                                        <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                                            {selectedReport.description || 'No description provided'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</label>
                                            <p className={`mt-1 text-sm font-semibold capitalize ${SEVERITY_CONFIG[selectedReport.severity]?.color || 'text-slate-700'}`}>
                                                {selectedReport.severity}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                                            <span className={`inline-block mt-1 px-3 py-1 rounded-lg text-xs font-bold 
                                                ${STATUS_CONFIG[selectedReport.status]?.bg || 'bg-slate-100 text-slate-600'}`}>
                                                {STATUS_CONFIG[selectedReport.status]?.label || selectedReport.status}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedReport.latitude && (
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3">
                                                <MapPin size={16} className="text-blue-600" />
                                                <span>{selectedReport.latitude?.toFixed(6)}, {selectedReport.longitude?.toFixed(6)}</span>
                                                <a href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="ml-auto text-blue-600 hover:text-blue-700 font-medium text-xs">
                                                    Open Map →
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {selectedReport.assigned_to && (
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Officer</label>
                                            <p className="text-sm text-slate-700 mt-1">
                                                {fieldOfficers.find(o => o.id === selectedReport.assigned_to)?.name || 'Unknown'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {selectedReport.status === 'open' && (
                                    <button onClick={() => { setReportDetailModal(false); setAssignModalOpen(true); }}
                                        className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
                                        <UserPlus size={16} /> Assign to Officer
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== OFFICER DETAIL MODAL ===== */}
            <AnimatePresence>
                {selectedOfficerView && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] p-4"
                        onClick={() => setSelectedOfficerView(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" 
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                            {selectedOfficerView.name?.charAt(0) || 'O'}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800">{selectedOfficerView.name}</h2>
                                            <p className="text-sm text-slate-500">{selectedOfficerView.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedOfficerView(null)} 
                                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-blue-700">{selectedOfficerView.assigned}</p>
                                        <p className="text-sm text-blue-600 mt-1">Total Assigned</p>
                                    </div>
                                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-emerald-700">{selectedOfficerView.completed}</p>
                                        <p className="text-sm text-emerald-600 mt-1">Completed</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-slate-600">Success Rate</span>
                                        <span className="text-sm font-bold text-slate-800">{selectedOfficerView.rate}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${selectedOfficerView.rate >= 80 ? 'bg-emerald-500' : selectedOfficerView.rate >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                            style={{ width: `${selectedOfficerView.rate}%` }} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
                                        Current Tasks
                                    </h3>
                                    <div className="space-y-2">
                                        {reports.filter(r => r.assigned_to === selectedOfficerView.id && r.status !== 'resolved').map(task => (
                                            <div key={task.id} className="p-3 bg-slate-50 rounded-xl">
                                                <p className="font-semibold text-sm text-slate-800 capitalize">{task.category}</p>
                                                <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                                                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold 
                                                    ${STATUS_CONFIG[task.status]?.bg || 'bg-slate-100 text-slate-600'}`}>
                                                    {STATUS_CONFIG[task.status]?.label || task.status}
                                                </span>
                                            </div>
                                        ))}
                                        {reports.filter(r => r.assigned_to === selectedOfficerView.id && r.status !== 'resolved').length === 0 && (
                                            <p className="text-sm text-slate-400 text-center py-4">No active tasks</p>
                                        )}
                                    </div>
                                </div>
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

export default DeptHeadDashboard;
