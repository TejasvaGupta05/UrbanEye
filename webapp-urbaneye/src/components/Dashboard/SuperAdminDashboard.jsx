import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceCommand } from '../../hooks/useVoiceCommand';
import VoiceAssistantButton from '../common/VoiceAssistantButton';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import {
    Users, Settings, LogOut, LayoutDashboard, Map, TrendingUp,
    AlertCircle, CheckCircle, Clock, Activity, Shield,
    FileText, RefreshCw, ChevronRight, ChevronLeft, Menu,
    Plus, ExternalLink, Zap, Filter, Database, MapPin,
    BarChart3, PieChart as PieIcon, Sparkles, X, Search, Download,
    Trash2, Edit3, UserPlus, Eye, EyeOff, Mail, Lock, Building2, Save
} from 'lucide-react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadialBarChart, RadialBar, AreaChart, Area
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import 'leaflet/dist/leaflet.css';

// Recharts Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-100">
                <p className="font-bold text-slate-700 mb-2">{label || payload[0].name}</p>
                {payload.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                        <span className="text-slate-600 capitalize">{p.name}:</span>
                        <span className="font-bold text-slate-900">{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1';

const SuperAdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [stats, setStats] = useState({
        totalReports: 0,
        resolvedReports: 0,
        pendingReports: 0,
        inProgressReports: 0,
        recentReports: []
    });
    const [reports, setReports] = useState([]);
    const [mapPoints, setMapPoints] = useState([]);

    // Analytics State
    const [selectedCity, setSelectedCity] = useState('all');
    const [categoryStats, setCategoryStats] = useState({});
    const [severityStats, setSeverityStats] = useState({ high: 0, medium: 0, low: 0 });
    const [statusStats, setStatusStats] = useState({ open: 0, assigned: 0, in_progress: 0, resolved: 0 });
    const [deptStats, setDeptStats] = useState({});
    const [trendStats, setTrendStats] = useState([]);

    // Reports View State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const reportsPerPage = 10;

    // Seeder State
    const [seederCity, setSeederCity] = useState('delhi');
    const [seederCount, setSeederCount] = useState(10);
    const [seederLoading, setSeederLoading] = useState(false);
    const [fullSeederLoading, setFullSeederLoading] = useState(false);

    const cityBounds = {
        delhi: { lat: [28.4, 28.9], lng: [76.8, 77.4] },
        gwalior: { lat: [26.1, 26.35], lng: [78.05, 78.3] },
        canberra: { lat: [-35.5, -35.1], lng: [149.0, 149.25] }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const processVoiceCommand = (command) => {
        const cmd = command.toLowerCase().trim();

        if (cmd.includes('advance select') && cmd.includes('full')) {
            setActiveView('map');
            if (cmd.includes('delhi')) {
                setSelectedCity('delhi');
                speak('Advanced selecting Delhi and opening map full layout');
            } else if (cmd.includes('gwalior')) {
                setSelectedCity('gwalior');
                speak('Advanced selecting Gwalior and opening map full layout');
            } else if (cmd.includes('canberra')) {
                setSelectedCity('canberra');
                speak('Advanced selecting Canberra and opening map full layout');
            }
            return;
        }

        if (cmd.includes('overview') || cmd.includes('home') || cmd.includes('dashboard')) { setActiveView('overview'); speak('Opening Overview'); }
        else if (cmd.includes('analytics') || cmd.includes('charts')) { setActiveView('analytics'); speak('Opening Analytics'); }
        else if (cmd.includes('live map') || cmd.includes('map view')) { setActiveView('map'); speak('Opening Live Map'); }
        else if (cmd.includes('reports')) { setActiveView('reports'); speak('Opening Reports'); }
        else if (cmd.includes('user management') || cmd.includes('users')) { setActiveView('users'); speak('Opening User Management'); }
        else if (cmd.includes('data seeder') || cmd.includes('seed')) { setActiveView('seed'); speak('Opening Data Seeder'); }
        else if (cmd.includes('settings')) { setActiveView('settings'); speak('Opening Settings'); }
        else if (cmd.includes('delhi')) { setSelectedCity('delhi'); speak('Filtering to Delhi'); }
        else if (cmd.includes('gwalior')) { setSelectedCity('gwalior'); speak('Filtering to Gwalior'); }
        else if (cmd.includes('canberra')) { setSelectedCity('canberra'); speak('Filtering to Canberra'); }
    };

    const { isListening, voiceTranscript, voiceFeedback, toggleVoiceCommand, speak } = useVoiceCommand(processVoiceCommand);

    useEffect(() => {
        calculateAnalytics(reports);
    }, [selectedCity, reports]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const reportsRes = await axios.get(`${API_BASE}/reports`, {
                headers
            });

            const allReports = (reportsRes.data.reports || []).map(r => ({
                ...r,
                created_at: r.timestamp ? r.timestamp * 1000 : Date.now(),
                id: r.id || `temp-${Math.random()}`
            }));

            setReports(allReports);
            calculateAnalytics(allReports);

            const points = allReports.filter(r => r.latitude && r.longitude).map(r => ({
                lat: r.latitude,
                lng: r.longitude,
                category: r.category,
                severity: r.severity,
                status: r.status,
                department: r.department,
                description: r.description
            }));
            setMapPoints(points);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setReports([]);
            setMapPoints([]);
        }
        setLoading(false);
    };

    const calculateAnalytics = (allReports) => {
        let filteredReports = allReports;
        if (selectedCity !== 'all' && cityBounds[selectedCity]) {
            const bounds = cityBounds[selectedCity];
            filteredReports = allReports.filter(r =>
                r.latitude >= bounds.lat[0] && r.latitude <= bounds.lat[1] &&
                r.longitude >= bounds.lng[0] && r.longitude <= bounds.lng[1]
            );
        }

        const resolved = filteredReports.filter(r => r.status === 'resolved').length;
        const pending = filteredReports.filter(r => r.status === 'open').length;
        const inProgress = filteredReports.filter(r => r.status === 'in_progress').length;
        const assigned = filteredReports.filter(r => r.status === 'assigned').length;

        setStats({
            totalReports: filteredReports.length,
            resolvedReports: resolved,
            pendingReports: pending,
            inProgressReports: inProgress + assigned,
            recentReports: filteredReports.slice(0, 5)
        });

        const catStats = {};
        filteredReports.forEach(r => { catStats[r.category] = (catStats[r.category] || 0) + 1; });
        setCategoryStats(catStats);

        const sevStats = { high: 0, medium: 0, low: 0 };
        filteredReports.forEach(r => { if (sevStats.hasOwnProperty(r.severity)) sevStats[r.severity]++; });
        setSeverityStats(sevStats);

        setStatusStats({ open: pending, assigned, in_progress: inProgress, resolved });

        const dStats = {};
        filteredReports.forEach(r => { dStats[r.department] = (dStats[r.department] || 0) + 1; });
        setDeptStats(dStats);

        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const trendData = last7Days.map(dateStr => {
            const dayReports = filteredReports.filter(r => {
                if (!r.created_at) return false;
                try {
                    const rDate = new Date(r.created_at).toISOString().split('T')[0];
                    return rDate === dateStr;
                } catch (e) {
                    return false;
                }
            });

            return {
                date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                total: dayReports.length,
                resolved: dayReports.filter(r => r.status === 'resolved').length,
                active: dayReports.filter(r => r.status !== 'resolved').length
            };
        });
        setTrendStats(trendData);
    };

    const seedReports = async () => {
        setSeederLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.post(`${API_BASE}/reports/seed`, {
                city: seederCity,
                count: seederCount
            }, { headers });
            if (response.data.success) {
                alert(`✅ Created ${response.data.count} reports in ${seederCity.toUpperCase()}!`);
                fetchDashboardData();
            }
        } catch (error) {
            alert('❌ Failed to seed reports. Make sure backend is running.');
        }
        setSeederLoading(false);
    };

    const seedAll = async () => {
        if (!confirm("⚠️ WARNING: This will populate the database with comprehensive demo data. Continue?")) return;

        setFullSeederLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.post(`${API_BASE}/auth/admin/seed-all`, {
                secret_key: "urbaneye-secret-2024"
            }, { headers });

            if (response.data.success) {
                alert(`✅ Database Seeded Successfully!\n\nCreated:\n- ${response.data.created.users} Users\n- ${response.data.created.reports} Reports\n- ${response.data.created.bookings} Bookings`);
                fetchDashboardData();
            }
        } catch (error) {
            console.error(error);
            alert('❌ Seeding Failed. Check console for details.');
        }
        setFullSeederLoading(false);
    };

    const filteredReportsList = reports.filter(report => {
        const matchesSearch = report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    const currentReports = filteredReportsList.slice(indexOfFirstReport, indexOfLastReport);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <motion.aside
                className={`fixed lg:sticky top-0 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-200 z-50 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'
                    } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="p-6 flex items-center gap-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Shield size={20} />
                    </div>
                    {!sidebarCollapsed && (
                        <div>
                            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                UrbanEye
                            </h1>
                            <p className="text-xs font-bold text-indigo-500 tracking-wider">SUPER ADMIN</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <NavItem icon={LayoutDashboard} label="Overview" active={activeView === 'overview'} collapsed={sidebarCollapsed} onClick={() => setActiveView('overview')} />
                    <NavItem icon={BarChart3} label="Analytics" active={activeView === 'analytics'} collapsed={sidebarCollapsed} onClick={() => setActiveView('analytics')} />
                    <NavItem icon={Map} label="Live Map" active={activeView === 'map'} collapsed={sidebarCollapsed} onClick={() => setActiveView('map')} />
                    <NavItem icon={FileText} label="All Reports" active={activeView === 'reports'} collapsed={sidebarCollapsed} onClick={() => setActiveView('reports')} />
                    <NavItem icon={Users} label="User Management" active={activeView === 'users'} collapsed={sidebarCollapsed} onClick={() => setActiveView('users')} />
                    <NavItem icon={Database} label="Data Seeder" active={activeView === 'seed'} collapsed={sidebarCollapsed} onClick={() => setActiveView('seed')} />
                    <NavItem icon={Settings} label="Settings" active={activeView === 'settings'} collapsed={sidebarCollapsed} onClick={() => setActiveView('settings')} />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button onClick={logout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <LogOut size={20} />
                        {!sidebarCollapsed && <span className="font-semibold">Sign Out</span>}
                    </button>
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full mt-2 flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors lg:flex hidden">
                        {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>
            </motion.aside>

            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            <main className="flex-1 min-w-0 overflow-y-auto h-screen bg-slate-50/50">
                <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 z-30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 capitalize">{activeView.replace('_', ' ')}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative">
                            <Activity size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white" />
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <span className="text-sm font-medium text-slate-600 hidden md:block">{user?.name || 'Super Admin'}</span>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">SA</div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {activeView === 'overview' && <OverviewView stats={stats} trendStats={trendStats} categoryStats={categoryStats} severityStats={severityStats} statusStats={statusStats} selectedCity={selectedCity} setSelectedCity={setSelectedCity} />}
                    {activeView === 'analytics' && <AnalyticsView stats={stats} trendStats={trendStats} categoryStats={categoryStats} severityStats={severityStats} statusStats={statusStats} deptStats={deptStats} selectedCity={selectedCity} setSelectedCity={setSelectedCity} />}
                    {activeView === 'map' && <MapView mapPoints={mapPoints} selectedCity={selectedCity} setSelectedCity={setSelectedCity} />}
                    {activeView === 'reports' && <ReportsView reports={currentReports} searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} paginate={paginate} currentPage={currentPage} totalReports={filteredReportsList.length} reportsPerPage={reportsPerPage} />}
                    {activeView === 'seed' && <SeederView seederCity={seederCity} setSeederCity={setSeederCity} seederCount={seederCount} setSeederCount={setSeederCount} seedReports={seedReports} seederLoading={seederLoading} seedAll={seedAll} fullSeederLoading={fullSeederLoading} />}
                    {activeView === 'users' && <UserManagementView />}
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

const NavItem = ({ icon: Icon, label, active, collapsed, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${collapsed ? 'justify-center' : ''}`}>
        <Icon size={20} className={active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} />
        {!collapsed && <span className="font-semibold">{label}</span>}
    </button>
);

const OverviewView = ({ stats, trendStats, categoryStats, severityStats, statusStats, selectedCity, setSelectedCity }) => (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-end">
            <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1">
                {['all', 'delhi', 'gwalior', 'canberra'].map(city => (
                    <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all ${selectedCity === city
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        {city}
                    </button>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={FileText} label="Total Reports" value={stats.totalReports} color="blue" />
            <StatCard icon={CheckCircle} label="Resolved" value={stats.resolvedReports} color="green" />
            <StatCard icon={Clock} label="Pending" value={stats.pendingReports} color="amber" />
            <StatCard icon={Activity} label="Active" value={stats.inProgressReports} color="purple" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Issue Trends (Last 7 Days)">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendStats}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Status Distribution">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={[
                            { name: 'Open', value: statusStats.open, color: '#ef4444' },
                            { name: 'Assigned', value: statusStats.assigned, color: '#3b82f6' },
                            { name: 'In Progress', value: statusStats.in_progress, color: '#f59e0b' },
                            { name: 'Resolved', value: statusStats.resolved, color: '#10b981' }
                        ]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                            {[
                                { name: 'Open', value: statusStats.open, color: '#ef4444' },
                                { name: 'Assigned', value: statusStats.assigned, color: '#3b82f6' },
                                { name: 'In Progress', value: statusStats.in_progress, color: '#f59e0b' },
                                { name: 'Resolved', value: statusStats.resolved, color: '#10b981' }
                            ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Severity Levels">
                <div className="flex items-center justify-around h-64">
                    {Object.entries(severityStats).map(([key, value]) => (
                        <div key={key} className="text-center">
                            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-8 mb-4 ${key === 'high' ? 'border-red-100 text-red-600' :
                                key === 'medium' ? 'border-amber-100 text-amber-600' : 'border-green-100 text-green-600'
                                }`}>
                                <span className="text-2xl font-black">{value}</span>
                                <svg className={`absolute inset-0 w-full h-full -rotate-90 ${key === 'high' ? 'text-red-500' :
                                    key === 'medium' ? 'text-amber-500' : 'text-green-500'
                                    }`} viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="289" strokeDashoffset={289 - (289 * value / 100)} strokeLinecap="round" />
                                </svg>
                            </div>
                            <span className="font-bold text-slate-600 capitalize block">{key}</span>
                        </div>
                    ))}
                </div>
            </ChartCard>
            <ChartCard title="Top Issue Categories">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(categoryStats).map(([k, v]) => ({ name: k, value: v })).sort((a, b) => b.value - a.value).slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" width={100} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    </div>
);

const AnalyticsView = ({ stats, trendStats, categoryStats, severityStats, statusStats, deptStats, selectedCity, setSelectedCity }) => (
    <div className="space-y-6">
        <div className="flex justify-end">
            <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1">
                {['all', 'delhi', 'gwalior', 'canberra'].map(city => (
                    <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all ${selectedCity === city
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        {city}
                    </button>
                ))}
            </div>
        </div>
        <OverviewView stats={stats} trendStats={trendStats} categoryStats={categoryStats} severityStats={severityStats} statusStats={statusStats} />
    </div>
);

const cityBounds = {
    delhi: { lat: [28.4, 28.8], lng: [76.9, 77.4] },
    gwalior: { lat: [26.1, 26.3], lng: [78.0, 78.3] },
    canberra: { lat: [-35.4, -35.2], lng: [149.0, 149.2] },
};

const MapView = ({ mapPoints, selectedCity, setSelectedCity }) => {
    const getCenter = () => {
        if (selectedCity === 'canberra') return [-35.2809, 149.1300];
        if (selectedCity === 'gwalior') return [26.2183, 78.1828];
        return [28.6139, 77.2090]; // Default to Delhi
    };

    // Filter points if a specific city is selected
    const filteredPoints = selectedCity === 'all'
        ? mapPoints
        : mapPoints.filter(p => {
            const bounds = cityBounds[selectedCity];
            if (!bounds) return true;
            return p.lat >= bounds.lat[0] && p.lat <= bounds.lat[1] &&
                p.lng >= bounds.lng[0] && p.lng <= bounds.lng[1];
        });

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1">
                    {['all', 'delhi', 'gwalior', 'canberra'].map(city => (
                        <button
                            key={city}
                            onClick={() => setSelectedCity(city)}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all ${selectedCity === city
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden h-[600px] relative z-0">
                <MapContainer key={selectedCity} center={getCenter()} zoom={selectedCity === 'all' ? 5 : 12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {filteredPoints.map((point, idx) => (
                        <CircleMarker
                            key={idx}
                            center={[point.lat, point.lng]}
                            radius={6}
                            fillColor={
                                point.severity === 'high' ? '#ef4444' :
                                    point.severity === 'medium' ? '#f59e0b' : '#10b981'
                            }
                            color="white"
                            weight={2}
                            fillOpacity={0.8}
                        >
                            <Popup>
                                <div className="p-2 min-w-[200px]">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${point.severity === 'high' ? 'bg-red-100 text-red-700' :
                                        point.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {point.severity} Severity
                                    </span>
                                    <h3 className="font-bold text-slate-900 capitalize text-sm mb-1">{point.category.replace('_', ' ')}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2">{point.description}</p>
                                    <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                                        <span>{point.department}</span>
                                        <span className={`font-medium ${point.status === 'resolved' ? 'text-green-600' : 'text-blue-600'
                                            }`}>
                                            {point.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>

                {/* Map Legend Overlay */}
                <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-3 rounded-xl shadow-lg border border-slate-100 z-[1000] text-xs font-medium space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm" /> High Severity
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm" /> Medium Severity
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm" /> Low Severity
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportsView = ({ reports, searchTerm, setSearchTerm, statusFilter, setStatusFilter, paginate, currentPage, totalReports, reportsPerPage }) => (
    <div className="space-y-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="Search reports by ID, description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-all" />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                {['all', 'open', 'assigned', 'in_progress', 'resolved'].map(status => (
                    <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-all border ${statusFilter === status ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{status.replace('_', ' ')}</button>
                ))}
            </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">ID / Date</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reports.length > 0 ? reports.map((report) => (
                            <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4"><div className="font-mono text-xs text-slate-500">#{report.id.slice(0, 8)}</div><div className="text-xs font-medium text-slate-900 mt-1">{new Date(report.created_at).toLocaleDateString()}</div></td>
                                <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">{report.category.replace('_', ' ')}</span></td>
                                <td className="px-6 py-4"><p className="text-sm text-slate-600 max-w-[200px] truncate" title={report.description}>{report.description}</p></td>
                                <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${report.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : report.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : report.status === 'assigned' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}><span className={`w-1.5 h-1.5 rounded-full ${report.status === 'resolved' ? 'bg-green-500' : report.status === 'in_progress' ? 'bg-amber-500' : report.status === 'assigned' ? 'bg-blue-500' : 'bg-slate-400'}`} />{report.status.replace('_', ' ')}</span></td>
                                <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-slate-600"><div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center"><Zap size={14} /></div>{report.department}</div></td>
                                <td className="px-6 py-4 text-right"><button className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-colors"><ExternalLink size={18} /></button></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="px-6 py-12 text-center"><div className="flex flex-col items-center justify-center text-slate-400"><FileText size={48} className="mb-4 text-slate-200" /><p className="text-lg font-medium text-slate-500">No reports found</p></div></td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {reports.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <span className="text-sm text-slate-500">Showing <span className="font-bold text-slate-900">1</span> to <span className="font-bold text-slate-900">{reports.length}</span> of <span className="font-bold text-slate-900">{totalReports}</span> results</span>
                    <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                        <button disabled className="p-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700">Page {currentPage}</button>
                        <button disabled={reports.length < reportsPerPage} onClick={() => paginate(currentPage + 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}
        </div>
    </div>
);

const SeederView = ({ seederCity, setSeederCity, seederCount, setSeederCount, seedReports, seederLoading, seedAll, fullSeederLoading }) => (
    <div className="space-y-8">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold text-indigo-300 mb-4">
                        <Database size={14} />DEVELOPER TOOLS
                    </div>
                    <h2 className="text-3xl font-black mb-4">Synthetic Data Generator</h2>
                    <p className="text-indigo-200 leading-relaxed mb-8">Populate your environment with realistic test data.</p>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Target City</label>
                                <select value={seederCity} onChange={(e) => setSeederCity(e.target.value)} className="w-full bg-slate-900/50 border border-indigo-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="delhi">New Delhi</option>
                                    <option value="gwalior">Gwalior</option>
                                    <option value="canberra">Canberra</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Batch Size</label>
                                <select value={seederCount} onChange={(e) => setSeederCount(Number(e.target.value))} className="w-full bg-slate-900/50 border border-indigo-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="5">5 Reports</option>
                                    <option value="10">10 Reports</option>
                                    <option value="25">25 Reports</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={seedReports} disabled={seederLoading} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                            {seederLoading ? <RefreshCw className="animate-spin" /> : <Plus />}Generate Reports Only
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center space-y-6">
                        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-500 ring-4 ring-amber-500/10">
                            <AlertCircle size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Master Reset & Seed</h3>
                            <p className="text-slate-400 text-sm">Wipes current data and creates a full demo environment.</p>
                        </div>
                        <button onClick={seedAll} disabled={fullSeederLoading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-orange-900/20 transition-all transform hover:-translate-y-1">
                            {fullSeederLoading ? <RefreshCw className="animate-spin" /> : <><Database size={20} />SEED EVERYTHING (PRO)</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const SECRET_KEY = 'urbaneye-secret-2024';

const VALID_ROLES = ['civilian', 'social_worker', 'gig_worker', 'gov_admin', 'dept_head', 'field_officer', 'super_admin'];
const DEPARTMENTS = ['Roads', 'Waste', 'Water', 'Electrical', 'General'];

const ROLE_COLORS = {
    super_admin: 'bg-purple-100 text-purple-700 border-purple-200',
    gov_admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dept_head: 'bg-blue-100 text-blue-700 border-blue-200',
    field_officer: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    social_worker: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    gig_worker: 'bg-amber-100 text-amber-700 border-amber-200',
    civilian: 'bg-slate-100 text-slate-700 border-slate-200',
};

const UserManagementView = () => {
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Create form state
    const [createForm, setCreateForm] = useState({
        name: '', email: '', password: '', role: 'civilian', department: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '', role: '', department: '', password: ''
    });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/auth/admin/users`, { secret_key: SECRET_KEY });
            if (res.data.success) {
                setUsers(res.data.users || []);
            }
        } catch (err) {
            console.error('Failed to load users:', err);
            showNotification('Failed to load users from database', 'error');
        }
        setLoading(false);
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.post(`${API_BASE}/auth/admin/stats`, { secret_key: SECRET_KEY });
            if (res.data.success) {
                setUserStats(res.data.stats);
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [fetchUsers, fetchStats]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!createForm.name || !createForm.email || !createForm.password || !createForm.role) {
            showNotification('Please fill all required fields', 'error');
            return;
        }
        setActionLoading(true);
        try {
            const payload = { ...createForm, secret_key: SECRET_KEY };
            if (!['dept_head', 'field_officer'].includes(createForm.role)) {
                delete payload.department;
            }
            const res = await axios.post(`${API_BASE}/auth/admin/create-user`, payload);
            if (res.data.success) {
                showNotification(`User "${createForm.name}" created successfully!`);
                setShowCreateModal(false);
                setCreateForm({ name: '', email: '', password: '', role: 'civilian', department: '' });
                fetchUsers();
                fetchStats();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create user';
            showNotification(msg, 'error');
        }
        setActionLoading(false);
    };

    const handleUpdateUser = async (userId) => {
        setActionLoading(true);
        try {
            const payload = { secret_key: SECRET_KEY };
            if (editForm.name) payload.name = editForm.name;
            if (editForm.role) payload.role = editForm.role;
            if (editForm.department !== undefined) payload.department = editForm.department;
            if (editForm.password) payload.password = editForm.password;

            const res = await axios.put(`${API_BASE}/auth/admin/user/${userId}`, payload);
            if (res.data.success) {
                showNotification('User updated successfully!');
                setEditingUser(null);
                fetchUsers();
                fetchStats();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update user';
            showNotification(msg, 'error');
        }
        setActionLoading(false);
    };

    const handleDeleteUser = async (userId) => {
        setActionLoading(true);
        try {
            const res = await axios.delete(`${API_BASE}/auth/admin/user/${userId}`, {
                data: { secret_key: SECRET_KEY }
            });
            if (res.data.success) {
                showNotification('User deleted successfully!');
                setDeleteConfirm(null);
                fetchUsers();
                fetchStats();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to delete user';
            showNotification(msg, 'error');
        }
        setActionLoading(false);
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-2xl font-semibold text-sm flex items-center gap-2 ${
                            notification.type === 'error'
                                ? 'bg-red-600 text-white'
                                : 'bg-emerald-600 text-white'
                        }`}
                    >
                        {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Row */}
            {userStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <Users size={20} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total Users</p>
                                <p className="text-2xl font-black text-slate-900">{userStats.total_users}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <UserPlus size={20} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">New This Week</p>
                                <p className="text-2xl font-black text-slate-900">{userStats.new_users_this_week}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2">
                        <p className="text-xs font-medium text-slate-500 mb-3">Role Distribution</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(userStats.role_distribution || {}).filter(([, v]) => v > 0).map(([role, count]) => (
                                <span key={role} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${ROLE_COLORS[role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {role.replace('_', ' ')} <span className="font-black">{count}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-all"
                    />
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0">
                        <button onClick={() => setRoleFilter('all')} className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${roleFilter === 'all' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>All Roles</button>
                        {VALID_ROLES.map(role => (
                            <button key={role} onClick={() => setRoleFilter(role)} className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all border ${roleFilter === role ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{role.replace('_', ' ')}</button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all transform active:scale-95"
                    >
                        <UserPlus size={16} /> Add User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <RefreshCw size={32} className="animate-spin mb-4 text-indigo-400" />
                        <p className="font-medium">Loading users from Neon DB...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Created</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ${
                                                    user.role === 'super_admin' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' :
                                                    user.role === 'gov_admin' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {(user.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-sm text-slate-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-500 font-medium">{user.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {user.role?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-500">{user.department || '—'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-400 font-medium">
                                                {user.created_at ? new Date(typeof user.created_at === 'number' ? user.created_at * 1000 : user.created_at).toLocaleDateString() : '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setEditForm({
                                                            name: user.name || '',
                                                            role: user.role || '',
                                                            department: user.department || '',
                                                            password: ''
                                                        });
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit user"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(user)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete user"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <Users size={48} className="mb-4 text-slate-200" />
                                                <p className="text-lg font-medium text-slate-500">No users found</p>
                                                <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && filteredUsers.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                            Showing <span className="font-bold text-slate-900">{filteredUsers.length}</span> of <span className="font-bold text-slate-900">{users.length}</span> users
                        </span>
                        <button
                            onClick={() => { fetchUsers(); fetchStats(); }}
                            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Create New User</h3>
                                    <p className="text-indigo-200 text-sm">Add a user to the Neon database</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="text-white/60 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name *</label>
                                    <div className="relative">
                                        <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={createForm.name}
                                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email *</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            value={createForm.email}
                                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                                            placeholder="user@urbaneye.gov"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Password *</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={createForm.password}
                                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                            className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Role *</label>
                                        <select
                                            value={createForm.role}
                                            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        >
                                            {VALID_ROLES.map(r => (
                                                <option key={r} value={r}>{r.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Department</label>
                                        <select
                                            value={createForm.department}
                                            onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            disabled={!['dept_head', 'field_officer'].includes(createForm.role)}
                                        >
                                            <option value="">None</option>
                                            {DEPARTMENTS.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                        {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit User Modal */}
            <AnimatePresence>
                {editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setEditingUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Edit User</h3>
                                    <p className="text-slate-400 text-sm">{editingUser.email}</p>
                                </div>
                                <button onClick={() => setEditingUser(null)} className="text-white/60 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Role</label>
                                        <select
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        >
                                            {VALID_ROLES.map(r => (
                                                <option key={r} value={r}>{r.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Department</label>
                                        <select
                                            value={editForm.department}
                                            onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        >
                                            <option value="">None</option>
                                            {DEPARTMENTS.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">New Password <span className="text-slate-400 normal-case">(leave blank to keep current)</span></label>
                                    <input
                                        type="password"
                                        value={editForm.password}
                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setEditingUser(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={() => handleUpdateUser(editingUser.id)} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                        {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 text-center">
                                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={24} className="text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete User?</h3>
                                <p className="text-sm text-slate-500 mb-1">
                                    This will permanently delete <span className="font-bold text-slate-700">{deleteConfirm.name}</span>
                                </p>
                                <p className="text-xs text-slate-400 mb-6">{deleteConfirm.email}</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={() => handleDeleteUser(deleteConfirm.id)} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                        {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colorStyles = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', amber: 'bg-amber-50 text-amber-600', purple: 'bg-purple-50 text-purple-600' };
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorStyles[color]}`}><Icon size={28} /></div>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
                <div className="text-2xl font-black text-slate-900">{value}</div>
            </div>
        </div>
    );
};

const ChartCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-indigo-500 rounded-full" />{title}
        </h3>
        {children}
    </div>
);

export default SuperAdminDashboard;

