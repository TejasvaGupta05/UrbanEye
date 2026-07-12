import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceCommand } from '../../hooks/useVoiceCommand';
import VoiceAssistantButton from '../common/VoiceAssistantButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, LogOut, Menu, X, RefreshCw, ChevronRight, ChevronLeft,
    Heart, Users, TrendingUp, MapPin, Clock, CheckCircle, Star,
    ArrowUpRight, Award, Target,  Map as MapIcon, Calendar,
    HandHeart, UserCheck, AlertCircle, Eye, Play, Package, BookOpen,
    Activity, Shield, Home, Baby, Utensils, GraduationCap, Briefcase, Trophy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SocialWorkerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    
    // Mock data - Replace with actual API calls
    const [helpRequests, setHelpRequests] = useState([
        { id: 1, name: 'Ramesh Kumar', category: 'Food Assistance', location: 'Sector 12', status: 'pending', priority: 'high', description: 'Family of 5 needs food support', timestamp: Date.now() },
        { id: 2, name: 'Priya Sharma', category: 'Medical Help', location: 'Old Town', status: 'pending', priority: 'high', description: 'Urgent medical supplies needed', timestamp: Date.now() },
        { id: 3, name: 'Suresh Patel', category: 'Shelter', location: 'Railway Area', status: 'in_progress', priority: 'medium', description: 'Temporary shelter required', timestamp: Date.now() },
        { id: 4, name: 'Anjali Devi', category: 'Education', location: 'Market Road', status: 'pending', priority: 'medium', description: 'School supplies for children', timestamp: Date.now() },
        { id: 5, name: 'Mohan Singh', category: 'Employment', location: 'Industrial Area', status: 'completed', priority: 'low', description: 'Job placement assistance', timestamp: Date.now() },
    ]);

    const stats = useMemo(() => {
        const pending = helpRequests.filter(r => r.status === 'pending').length;
        const inProgress = helpRequests.filter(r => r.status === 'in_progress').length;
        const completed = helpRequests.filter(r => r.status === 'completed').length;
        const highPriority = helpRequests.filter(r => r.priority === 'high' && r.status !== 'completed').length;
        const totalHelped = 127; // Mock data
        const volunteers = 89; // Mock data
        
        return { pending, inProgress, completed, highPriority, totalHelped, volunteers };
    }, [helpRequests]);

    const handleAcceptRequest = (requestId) => {
        setHelpRequests(helpRequests.map(r => r.id === requestId ? { ...r, status: 'in_progress' } : r));
        setDetailModalOpen(false);
    };

    const handleCompleteRequest = (requestId) => {
        setHelpRequests(helpRequests.map(r => r.id === requestId ? { ...r, status: 'completed' } : r));
    };

    const processVoiceCommand = (command) => {
        const cmd = command.toLowerCase().trim();

        if (cmd.includes('advance select') && cmd.includes('full')) {
            setActiveView('requests');
            if (cmd.includes('delhi') || cmd.includes('gwalior') || cmd.includes('canberra')) {
                speak('Advanced selection processed. Showing detailed requests layout.');
            }
            return;
        }

        if (cmd.includes('overview') || cmd.includes('home')) { setActiveView('overview'); speak('Opening Overview'); }
        else if (cmd.includes('requests') || cmd.includes('help requests')) { setActiveView('requests'); speak('Opening Help Requests'); }
        else if (cmd.includes('active cases') || cmd.includes('active')) { setActiveView('active'); speak('Opening Active Cases'); }
        else if (cmd.includes('volunteers') || cmd.includes('team')) { setActiveView('volunteers'); speak('Opening Volunteers'); }
        else if (cmd.includes('impact') || cmd.includes('stats')) { setActiveView('impact'); speak('Opening Impact Stats'); }
    };

    const { isListening, voiceTranscript, voiceFeedback, toggleVoiceCommand, speak } = useVoiceCommand(processVoiceCommand);

    const handleLogout = () => { logout(); navigate('/login'); };

    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'requests', icon: HandHeart, label: 'Help Requests' },
        { id: 'active', icon: Activity, label: 'Active Cases' },
        { id: 'volunteers', icon: Users, label: 'Volunteers' },
        { id: 'impact', icon: Award, label: 'Impact Stats' },
    ];

    const priorityConfig = {
        high: { color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
        medium: { color: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
        low: { color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
    };

    const categoryIcons = {
        'Food Assistance': Utensils,
        'Medical Help': Heart,
        'Shelter': Home,
        'Education': GraduationCap,
        'Employment': Briefcase,
        'Child Care': Baby,
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/20">
                        <Heart size={20} className="text-white" />
                    </div>
                    {!sidebarCollapsed && (
                        <div className="overflow-hidden">
                            <h1 className="font-bold text-slate-800 text-sm tracking-wide">UrbanEye</h1>
                            <p className="text-xs text-slate-500">NGO Portal</p>
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
                                    ? 'bg-pink-50 text-pink-700 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            title={sidebarCollapsed ? item.label : ''}>
                            <item.icon size={20} className={activeView === item.id ? 'text-pink-600' : ''} />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* User & Logout */}
                <div className="p-3 border-t border-slate-100">
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm shadow">
                                {user?.name?.charAt(0) || 'N'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'NGO Partner'}</p>
                                <div className="flex items-center gap-1">
                                    <Star size={12} className="text-pink-500 fill-pink-500" />
                                    <p className="text-xs text-slate-500">4.9 Rating</p>
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
                            {activeView === 'overview' && 'NGO Dashboard Overview'}
                            {activeView === 'requests' && 'Help Requests'}
                            {activeView === 'active' && 'Active Cases'}
                            {activeView === 'volunteers' && 'Volunteer Management'}
                            {activeView === 'impact' && 'Impact & Statistics'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">Making a difference together</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium">
                            <Heart size={16} />
                            <span>{stats.totalHelped} Helped</span>
                        </div>
                        <button onClick={() => setLoading(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-xl text-sm font-medium hover:bg-pink-100 transition-all">
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
                                            { label: 'Pending Requests', value: stats.pending, icon: HandHeart, gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-50 text-pink-700' },
                                            { label: 'Active Cases', value: stats.inProgress, icon: Activity, gradient: 'from-purple-500 to-indigo-600', bg: 'bg-purple-50 text-purple-700' },
                                            { label: 'Families Helped', value: stats.totalHelped, icon: Users, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 text-emerald-700' },
                                            { label: 'Volunteers', value: stats.volunteers, icon: UserCheck, gradient: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50 text-blue-700' },
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
                                            <button onClick={() => setActiveView('requests')}
                                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 transition-all group">
                                                <HandHeart size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-semibold">View Requests</span>
                                            </button>
                                            <button onClick={() => setActiveView('active')}
                                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-all group">
                                                <Activity size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-semibold">Active Cases</span>
                                            </button>
                                            <button onClick={() => setActiveView('volunteers')}
                                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all group">
                                                <Users size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-semibold">Volunteers</span>
                                            </button>
                                            <button onClick={() => setActiveView('impact')}
                                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all group">
                                                <Award size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-semibold">Impact</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Urgent Help Requests */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                                                🚨 Urgent Help Requests
                                            </h3>
                                            <button onClick={() => setActiveView('requests')} 
                                                className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1">
                                                View All <ChevronRight size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {helpRequests.filter(r => r.status === 'pending' && r.priority === 'high').slice(0, 3).map((request, idx) => {
                                                const priority = priorityConfig[request.priority] || priorityConfig.medium;
                                                const CategoryIcon = categoryIcons[request.category] || Package;
                                                return (
                                                    <motion.div key={request.id} initial={{ opacity: 0, x: -10 }} 
                                                        animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50 transition-all cursor-pointer"
                                                        onClick={() => { setSelectedRequest(request); setDetailModalOpen(true); }}>
                                                        <div className={`w-12 h-12 rounded-xl ${priority.bg} flex items-center justify-center flex-shrink-0`}>
                                                            <CategoryIcon size={24} className={priority.color} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-slate-800">{request.name}</h4>
                                                            <p className="text-sm text-slate-500">{request.category}</p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                                                    <MapPin size={12} /> {request.location}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); handleAcceptRequest(request.id); }}
                                                            className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700 transition-all flex-shrink-0">
                                                            Accept
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Impact Summary */}
                                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                <Award size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Community Impact</h3>
                                                <p className="text-sm text-pink-50">Your contribution this month</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                                <p className="text-2xl font-bold">{stats.totalHelped}</p>
                                                <p className="text-sm text-pink-50 mt-1">Lives Touched</p>
                                            </div>
                                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                                <p className="text-2xl font-bold">{stats.completed}</p>
                                                <p className="text-sm text-pink-50 mt-1">Cases Resolved</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                                            <Star size={20} className="text-yellow-300 fill-yellow-300" />
                                            <p className="text-sm font-medium">Thank you for making a difference! 💖</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== HELP REQUESTS ===== */}
                            {activeView === 'requests' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500">
                                        Showing <span className="font-semibold text-slate-700">{helpRequests.filter(r => r.status === 'pending').length}</span> pending requests
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {helpRequests.filter(r => r.status === 'pending').map((request, idx) => {
                                            const priority = priorityConfig[request.priority] || priorityConfig.medium;
                                            const CategoryIcon = categoryIcons[request.category] || Package;
                                            return (
                                                <motion.div key={request.id} initial={{ opacity: 0, y: 16 }} 
                                                    animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                                    <div className="h-1.5 bg-gradient-to-r from-pink-500 to-rose-500" />
                                                    <div className="p-5">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-slate-800">{request.name}</h3>
                                                                <p className="text-sm text-slate-500 mt-1">{request.category}</p>
                                                            </div>
                                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${priority.badge}`}>
                                                                {request.priority.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{request.description}</p>

                                                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 bg-slate-50 rounded-lg px-3 py-2">
                                                            <MapPin size={14} />
                                                            <span>{request.location}</span>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <button onClick={() => { setSelectedRequest(request); setDetailModalOpen(true); }}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all">
                                                                <Eye size={15} /> Details
                                                            </button>
                                                            <button onClick={() => handleAcceptRequest(request.id)}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-semibold hover:bg-pink-700 transition-all">
                                                                <Play size={15} /> Accept
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {helpRequests.filter(r => r.status === 'pending').length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                            <HandHeart size={48} className="mb-3" />
                                            <p className="font-semibold text-lg">No pending requests</p>
                                            <p className="text-sm mt-1">All requests have been addressed</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ===== ACTIVE CASES ===== */}
                            {activeView === 'active' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500">
                                        You have <span className="font-semibold text-slate-700">{stats.inProgress}</span> active case(s)
                                    </p>

                                    <div className="space-y-4">
                                        {helpRequests.filter(r => r.status === 'in_progress').map((request, idx) => {
                                            const CategoryIcon = categoryIcons[request.category] || Package;
                                            return (
                                                <motion.div key={request.id} initial={{ opacity: 0, x: -20 }} 
                                                    animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                                    className="bg-white rounded-2xl border border-slate-200 p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                                                <CategoryIcon size={24} className="text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-bold text-slate-800">{request.name}</h3>
                                                                <p className="text-sm text-slate-500 mt-1">{request.category}</p>
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                                                            In Progress
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-slate-600 mb-4 bg-slate-50 rounded-xl p-3">
                                                        {request.description}
                                                    </p>

                                                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                                        <MapPin size={16} className="text-slate-400" />
                                                        <span>{request.location}</span>
                                                    </div>

                                                    <button onClick={() => handleCompleteRequest(request.id)}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all">
                                                        <CheckCircle size={18} /> Mark as Resolved
                                                    </button>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {helpRequests.filter(r => r.status === 'in_progress').length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                            <Activity size={48} className="mb-3" />
                                            <p className="font-semibold text-lg">No active cases</p>
                                            <p className="text-sm mt-1">Accept a request to get started</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ===== VOLUNTEERS ===== */}
                            {activeView === 'volunteers' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
                                                <Users size={28} className="text-blue-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-slate-800">{stats.volunteers}</p>
                                            <p className="text-sm text-slate-500 mt-1">Active Volunteers</p>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                                <UserCheck size={28} className="text-emerald-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-slate-800">42</p>
                                            <p className="text-sm text-slate-500 mt-1">Available Today</p>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-50 flex items-center justify-center">
                                                <Star size={28} className="text-amber-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-slate-800">4.9</p>
                                            <p className="text-sm text-slate-500 mt-1">Avg. Rating</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                                            Volunteer Management
                                        </h3>
                                        <div className="text-center py-12">
                                            <Users size={48} className="text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500 font-medium">Volunteer management features</p>
                                            <p className="text-sm text-slate-400 mt-2">Coming soon!</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== IMPACT STATS ===== */}
                            {activeView === 'impact' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-pink-50 flex items-center justify-center">
                                                <Heart size={28} className="text-pink-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-slate-800">{stats.totalHelped}</p>
                                            <p className="text-sm text-slate-500 mt-1">Lives Touched</p>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                                <CheckCircle size={28} className="text-emerald-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-slate-800">{stats.completed}</p>
                                            <p className="text-sm text-slate-500 mt-1">Cases Resolved</p>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-50 flex items-center justify-center">
                                                <TrendingUp size={28} className="text-amber-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-slate-800">92%</p>
                                            <p className="text-sm text-slate-500 mt-1">Success Rate</p>
                                        </div>
                                    </div>

                                    {/* Category Breakdown */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                                            Help by Category
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {Object.entries(
                                                helpRequests.reduce((acc, r) => { 
                                                    acc[r.category] = (acc[r.category] || 0) + 1; 
                                                    return acc; 
                                                }, {})
                                            ).map(([cat, count]) => {
                                                const Icon = categoryIcons[cat] || Package;
                                                return (
                                                    <div key={cat} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-all">
                                                        <Icon size={24} className="text-pink-600 mb-2" />
                                                        <p className="text-2xl font-bold text-slate-800">{count}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{cat}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Recent Achievements */}
                                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                <Award size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Outstanding Work!</h3>
                                                <p className="text-sm text-pink-50">Your impact this quarter</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                                <Star size={20} className="text-yellow-300 fill-yellow-300" />
                                                <p className="text-sm font-medium">Achieved 4.9★ community rating</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                                <Trophy size={20} className="text-yellow-300" />
                                                <p className="text-sm font-medium">Helped 127+ families</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                                <Heart size={20} />
                                                <p className="text-sm font-medium">92% success rate on cases</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* ===== DETAIL MODAL ===== */}
            <AnimatePresence>
                {detailModalOpen && selectedRequest && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] p-4"
                        onClick={() => { setDetailModalOpen(false); setSelectedRequest(null); }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" 
                            onClick={e => e.stopPropagation()}>
                            <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-500" />
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">{selectedRequest.name}</h2>
                                        <p className="text-sm text-slate-500 mt-1">{selectedRequest.category}</p>
                                    </div>
                                    <button onClick={() => { setDetailModalOpen(false); setSelectedRequest(null); }} 
                                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                                        <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-slate-50 rounded-xl p-3">
                                            {selectedRequest.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</label>
                                            <p className={`mt-1 text-sm font-semibold capitalize ${priorityConfig[selectedRequest.priority]?.color || 'text-slate-700'}`}>
                                                {selectedRequest.priority}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                                            <span className="inline-block mt-1 px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700">
                                                {selectedRequest.status === 'pending' ? 'PENDING' : selectedRequest.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3">
                                            <MapPin size={16} className="text-pink-600" />
                                            <span>{selectedRequest.location}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedRequest.status === 'pending' && (
                                    <button onClick={() => handleAcceptRequest(selectedRequest.id)}
                                        className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-all">
                                        <Play size={16} /> Accept This Request
                                    </button>
                                )}
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

export default SocialWorkerDashboard;
