import { useState, useEffect } from 'react';
import axios from 'axios';
import { useVoiceCommand } from '../../hooks/useVoiceCommand';
import VoiceAssistantButton from '../common/VoiceAssistantButton';
import {
    MapPin, Calendar, CheckCircle, Zap, ArrowRight, TrendingUp,
    LayoutDashboard, FileText, Shield, LogOut, RefreshCw, X,
    ChevronLeft, ChevronRight, Settings, Star, AlertTriangle, Plus,
    Trophy, Users, Heart, Map as MapIcon, List, Clock, Award,
    Brain, Flame, Wifi, AlertOctagon, Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1';

const CivilianDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, resolved: 0, impact: 0 });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [viewMode, setViewMode] = useState('list');
    const [selectedReport, setSelectedReport] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [ngoRequests, setNgoRequests] = useState([]);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.209]);

    const processVoiceCommand = (command) => {
        const cmd = command.toLowerCase().trim();

        if (cmd.includes('advance select') && cmd.includes('full')) {
            setActiveTab('overview');
            setViewMode('map');
            if (cmd.includes('delhi')) {
                setMapCenter([28.6139, 77.209]);
                speak('Advanced selecting Delhi and opening full map view');
            } else if (cmd.includes('gwalior')) {
                setMapCenter([26.2183, 78.1828]);
                speak('Advanced selecting Gwalior and opening full map view');
            } else if (cmd.includes('canberra')) {
                setMapCenter([-35.2809, 149.1300]);
                speak('Advanced selecting Canberra and opening full map view');
            } else {
                speak('City not recognized for advanced selection');
            }
            return;
        }

        if (cmd.includes('overview') || cmd.includes('dashboard')) { setActiveTab('overview'); speak('Opening Dashboard'); }
        else if (cmd.includes('my reports')) { setActiveTab('reports'); speak('Opening My Reports'); }
        else if (cmd.includes('leaderboard')) { setActiveTab('leaderboard'); speak('Opening Leaderboard'); }
        else if (cmd.includes('gig worker') || cmd.includes('book gig')) { setActiveTab('gig'); speak('Opening Gig Workers'); }
        else if (cmd.includes('ngo')) { setActiveTab('ngo'); speak('Opening NGO Help'); }
        else if (cmd.includes('rewards') || cmd.includes('portfolio')) { setActiveTab('rewards'); speak('Opening Rewards'); }
        else if (cmd.includes('map view')) { setActiveTab('overview'); setViewMode('map'); speak('Opening Map View'); }
        else if (cmd.includes('list view')) { setActiveTab('overview'); setViewMode('list'); speak('Opening List View'); }
    };

    const { isListening, voiceTranscript, voiceFeedback, toggleVoiceCommand, speak } = useVoiceCommand(processVoiceCommand);

    useEffect(() => {
        fetchMyReports();
        fetchLeaderboard();
        fetchMyBookings();
        fetchMyNGORequests();
    }, []);

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const fetchMyReports = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/reports/my`, getAuthHeaders());
            if (res.data.success) {
                setReports(res.data.reports);
                calculateStats(res.data.reports);
            }
        } catch (err) {
            console.error("Failed to fetch reports", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get(`${API_BASE}/auth/leaderboard`);
            if (res.data.success) setLeaderboard(res.data.leaderboard);
        } catch (err) {
            console.error("Failed to fetch leaderboard", err);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const res = await axios.get(`${API_BASE}/bookings/my`, getAuthHeaders());
            if (res.data.success) setBookings(res.data.bookings);
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        }
    };

    const fetchMyNGORequests = async () => {
        try {
            const res = await axios.get(`${API_BASE}/ngo/requests/my`, getAuthHeaders());
            if (res.data.success) setNgoRequests(res.data.requests);
        } catch (err) {
            console.error("Failed to fetch NGO requests", err);
        }
    };

    const fetchReportDetail = async (reportId) => {
        try {
            const res = await axios.get(`${API_BASE}/reports/${reportId}`, getAuthHeaders());
            if (res.data.success) setSelectedReport(res.data.report);
        } catch (err) {
            console.error("Failed to fetch report detail", err);
        }
    };

    const calculateStats = (data) => {
        const resolved = data.filter(r => r.status === 'resolved' || r.status === 'completed').length;
        setStats({
            total: data.length,
            resolved: resolved,
            impact: (resolved * 15) + (data.length * 5)
        });
    };

    const handleHireGig = async (reportId) => {
        if (!window.confirm("Do you want to hire a private Gig Worker for fast resolution (₹300)?")) return;
        try {
            await axios.post(`${API_BASE}/gig/jobs`, { report_id: reportId, service_type: 'gig' }, getAuthHeaders());
            alert("Gig Worker Request Sent! Tracking enabled.");
            fetchMyReports();
        } catch (err) {
            alert("Could not process request. Job might already exist.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            open: "bg-blue-100 text-blue-700",
            in_progress: "bg-orange-100 text-orange-700",
            resolved: "bg-green-100 text-green-700",
            completed: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            assigned: "bg-purple-100 text-purple-700"
        };
        return (
            <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", styles[status] || "bg-slate-100 text-slate-600")}>
                {status?.replace('_', ' ')}
            </span>
        );
    };

    // ========== REPORT DETAIL MODAL ==========
    const ReportDetailModal = () => {
        if (!selectedReport) return null;
        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={() => setSelectedReport(null)}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 capitalize">{selectedReport.category}</h2>
                            <p className="text-slate-400 text-sm font-bold">{selectedReport.department} • {new Date(selectedReport.timestamp * 1000).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => setSelectedReport(null)} className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200">
                            <X size={20} />
                        </button>
                    </div>

                    {selectedReport.image_url && (
                        <img src={selectedReport.image_url} alt={selectedReport.category} className="w-full h-64 object-cover rounded-2xl mb-6" />
                    )}

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-50 p-4 rounded-2xl text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold">Severity</p>
                            <p className="text-lg font-black text-slate-800 capitalize">{selectedReport.severity}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold">Status</p>
                            <StatusBadge status={selectedReport.status} />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold">Location</p>
                            <p className="text-sm font-bold text-slate-600">{selectedReport.latitude?.toFixed(4)}, {selectedReport.longitude?.toFixed(4)}</p>
                        </div>
                    </div>

                    {selectedReport.description && (
                        <div className="mb-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase mb-2">Description</h3>
                            <p className="text-slate-700">{selectedReport.description}</p>
                        </div>
                    )}

                    {selectedReport.logs && selectedReport.logs.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase mb-4">Activity Timeline</h3>
                            <div className="space-y-3">
                                {selectedReport.logs.map((log, i) => (
                                    <div key={i} className="flex items-start gap-4 bg-slate-50 p-4 rounded-xl">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                                        <div>
                                            <p className="font-bold text-slate-700 capitalize">{log.status}</p>
                                            <p className="text-sm text-slate-500">{log.message}</p>
                                            <p className="text-xs text-slate-400">{new Date(log.timestamp * 1000).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedReport.status === 'open' && (
                        <button
                            onClick={() => { handleHireGig(selectedReport.id); setSelectedReport(null); }}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all"
                        >
                            <Zap className="inline mr-2" size={20} /> Fast Track with Gig Worker (₹300)
                        </button>
                    )}
                </motion.div>
            </motion.div>
        );
    };

    // ========== REPORTS SECTION (LIST + MAP) ==========
    const ReportsSection = () => (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
                    <p className="text-slate-400 font-bold text-sm">Monitor your contributions in real-time</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                    <button onClick={() => setViewMode('list')} className={cn("px-5 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2", viewMode === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400")}>
                        <List size={16} /> List
                    </button>
                    <button onClick={() => setViewMode('map')} className={cn("px-5 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2", viewMode === 'map' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400")}>
                        <MapIcon size={16} /> Map
                    </button>
                </div>
            </div>

            {viewMode === 'map' ? (
                <div className="h-[500px] rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl">
                    <MapContainer key={mapCenter.join(',')} center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                        {reports.filter(r => r.latitude && r.longitude).map(report => (
                            <Marker key={report.id} position={[report.latitude, report.longitude]}>
                                <Popup>
                                    <div style={{ minWidth: '200px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b', textTransform: 'capitalize', marginBottom: '4px' }}>
                                            {report.category}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                                            {report.department} • <span style={{ color: report.status === 'resolved' ? '#22c55e' : '#f59e0b', textTransform: 'capitalize' }}>{report.status?.replace('_', ' ')}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => fetchReportDetail(report.id)}
                                                style={{
                                                    background: '#4f46e5',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    fontWeight: '600',
                                                    fontSize: '11px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <MapPin size={12} /> Details
                                            </button>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    background: '#f1f5f9',
                                                    color: '#3b82f6',
                                                    textDecoration: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    fontWeight: '600',
                                                    fontSize: '11px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <MapPin size={12} /> Locate
                                            </a>
                                            <a
                                                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${report.latitude},${report.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    background: '#f1f5f9',
                                                    color: '#f97316',
                                                    textDecoration: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    fontWeight: '600',
                                                    fontSize: '11px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                🌐 Street View
                                            </a>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>



                        ))}
                    </MapContainer>
                </div>
            ) : (
                <div className="grid gap-5">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                <RefreshCw size={48} className="text-indigo-400/50 animate-spin" />
                                <p className="mt-6 text-slate-400 font-bold">Synchronizing data...</p>
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="bg-white rounded-[3rem] p-16 text-center shadow-2xl shadow-slate-100 border border-slate-50">
                                <AlertTriangle size={40} className="mx-auto mb-4 text-indigo-500" />
                                <h3 className="text-2xl font-black text-slate-800 mb-2">No reports yet</h3>
                                <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">Start by creating a report to improve your locality.</p>
                                <button onClick={() => navigate('/analyze')} className="bg-black text-white px-10 py-4 rounded-2xl font-black hover:scale-105 transition-transform">
                                    Get Started
                                </button>
                            </div>
                        ) : reports.map((report, idx) => (
                            <motion.div key={report.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.05 }}
                                className="group bg-white p-6 rounded-[2.5rem] flex flex-col lg:flex-row justify-between items-center border border-slate-100 hover:border-indigo-200 transition-all duration-500 hover:shadow-xl">
                                <div className="flex items-center gap-6 w-full">
                                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                                        {report.image_url ? <img src={report.image_url} alt="" className="w-full h-full object-cover" /> : <MapPin size={28} className="text-slate-300" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-black text-slate-900 capitalize truncate">{report.category}</h3>
                                        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(report.timestamp * 1000).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Shield size={12} /> {report.department}</span>
                                            <span className="flex items-center gap-1 text-indigo-600"><Zap size={12} /> {report.severity}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4 lg:mt-0">
                                    <StatusBadge status={report.status} />
                                    {report.status === 'open' && (
                                        <button onClick={() => handleHireGig(report.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase">Fast Track</button>
                                    )}
                                    <button onClick={() => fetchReportDetail(report.id)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );

    // ========== LEADERBOARD SECTION ==========
    const LeaderboardSection = () => (
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                    <Trophy size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Community Leaderboard</h2>
                    <p className="text-slate-400 font-bold">Top contributors this month</p>
                </div>
            </div>
            <div className="space-y-3">
                {leaderboard.length === 0 ? (
                    <p className="text-center text-slate-400 py-10">No data available</p>
                ) : leaderboard.map((entry, i) => (
                    <div key={entry.user_id} className={cn("flex items-center gap-4 p-4 rounded-2xl transition-all", i < 3 ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100" : "bg-slate-50")}>
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg", i === 0 ? "bg-amber-500 text-white" : i === 1 ? "bg-slate-400 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-slate-200 text-slate-600")}>
                            {entry.rank}
                        </div>
                        <div className="flex-1">
                            <p className="font-black text-slate-800">{entry.name}</p>
                            <p className="text-xs text-slate-400 capitalize">{entry.role.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-indigo-600">{entry.xp} XP</p>
                            <p className="text-xs text-slate-400">{entry.report_count} reports</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // ========== GIG WORKERS SECTION ==========
    const GigWorkersSection = () => (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Gig Worker Bookings</h2>
                    <p className="text-slate-400 font-bold">Track your private service requests</p>
                </div>
                <button onClick={() => navigate('/book')} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700">
                    <Plus size={20} /> New Booking
                </button>
            </div>
            {bookings.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100">
                    <Users size={40} className="mx-auto mb-4 text-slate-300" />
                    <h3 className="text-xl font-black text-slate-800 mb-2">No bookings yet</h3>
                    <p className="text-slate-500 mb-6">Book a gig worker for faster issue resolution</p>
                    <button onClick={() => navigate('/book')} className="bg-black text-white px-8 py-3 rounded-2xl font-black">Book Now</button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map(booking => (
                        <div key={booking.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center">
                            <div>
                                <p className="font-black text-slate-800 capitalize">{booking.service_type}</p>
                                <p className="text-sm text-slate-400">{booking.preferred_date} • {booking.preferred_time}</p>
                            </div>
                            <StatusBadge status={booking.status} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // ========== NGO HELP SECTION ==========
    const NGOHelpSection = () => (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">NGO Assistance</h2>
                    <p className="text-slate-400 font-bold">Request help from local NGOs</p>
                </div>
                <button onClick={() => navigate('/ngo-help')} className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-rose-600">
                    <Heart size={20} /> Request Help
                </button>
            </div>
            {ngoRequests.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100">
                    <Heart size={40} className="mx-auto mb-4 text-rose-300" />
                    <h3 className="text-xl font-black text-slate-800 mb-2">No requests yet</h3>
                    <p className="text-slate-500 mb-6">Reach out to NGOs for community support</p>
                    <button onClick={() => navigate('/ngo-help')} className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-black">Get Help</button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {ngoRequests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center">
                            <div>
                                <p className="font-black text-slate-800 capitalize">{req.category}</p>
                                <p className="text-sm text-slate-500 line-clamp-1">{req.description}</p>
                            </div>
                            <StatusBadge status={req.status} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // ========== REWARDS SECTION ==========
    const RewardsSection = () => (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-2xl">
            <Award size={48} className="mx-auto mb-6 text-amber-500" />
            <h3 className="text-3xl font-black text-slate-900 mb-3">Impact Portfolio</h3>
            <p className="text-slate-400 mb-10 max-w-sm mx-auto font-bold">Keep contributing to unlock premium local rewards.</p>
            <div className="max-w-md mx-auto bg-slate-50 p-8 rounded-[2.5rem]">
                <div className="bg-white px-6 py-2 rounded-full font-black text-sm text-slate-800 inline-block mb-6 shadow-lg">Silver Member</div>
                <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden mb-4">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.impact / 10, 100)}%` }} className="bg-indigo-600 h-full rounded-full" />
                </div>
                <p className="text-sm font-bold text-slate-400">{1000 - stats.impact} XP to Gold Tier</p>
            </div>
        </div>
    );

    const navItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'reports', label: 'My Reports', icon: FileText },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        { id: 'gig', label: 'Gig Workers', icon: Zap },
        { id: 'ngo', label: 'NGO Help', icon: Heart },
        { id: 'rewards', label: 'Rewards', icon: Star },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];



    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-900 overflow-hidden">
            <AnimatePresence>{selectedReport && <ReportDetailModal />}</AnimatePresence>

            {/* Sidebar */}
            <aside className={cn("sticky top-0 h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-500 z-50 shadow-xl", sidebarCollapsed ? "w-[90px]" : "w-[280px]")}>
                <div className="p-6 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                            <Shield size={28} />
                        </div>
                        {!sidebarCollapsed && <span className="text-2xl font-black tracking-tighter text-slate-900">UrbanEye</span>}
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                            className={cn("w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all", activeTab === item.id ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900")}>
                            <item.icon size={22} className={activeTab === item.id ? "text-white" : "text-slate-300"} />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </button>
                    ))}

                </nav>

                <div className="p-4 border-t border-slate-50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-all">
                        <LogOut size={22} />
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>

                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="absolute -right-4 top-24 bg-white border border-slate-100 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-lg z-50">
                    {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 max-w-[1500px] mx-auto px-8 py-10 lg:px-16 h-screen overflow-y-auto scroll-smooth">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-100 pb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">
                            Hi, <span className="text-indigo-600">{user?.name?.split(' ')[0] || 'Citizen'}</span>!
                        </h1>
                        <p className="text-slate-400 font-bold">Your Impact: <span className="text-indigo-600">{stats.impact} XP</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchMyReports} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm">
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={() => navigate('/analyze')} className="flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-2xl font-black shadow-xl hover:-translate-y-0.5 transition-all">
                            <Plus size={22} /> New Report
                        </button>
                    </div>
                </header>

                <div className="space-y-12">
                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Total Reports', value: stats.total, icon: FileText, color: 'indigo' },
                                    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'emerald' },
                                    { label: 'Impact XP', value: stats.impact, icon: TrendingUp, color: 'rose' },
                                ].map((stat, i) => (
                                    <motion.div key={stat.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                                        className="bg-white p-8 rounded-[2.5rem] flex items-center gap-6 border border-slate-50 shadow-xl group">
                                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform",
                                            stat.color === 'indigo' && "bg-indigo-600",
                                            stat.color === 'emerald' && "bg-emerald-500",
                                            stat.color === 'rose' && "bg-rose-500")}>
                                            <stat.icon size={28} />
                                        </div>
                                        <div>
                                            <span className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</span>
                                            <span className="block text-4xl font-black text-slate-900">{stat.value}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <ReportsSection />
                        </>
                    )}
                    {activeTab === 'reports' && <ReportsSection />}
                    {activeTab === 'leaderboard' && <LeaderboardSection />}
                    {activeTab === 'gig' && <GigWorkersSection />}
                    {activeTab === 'ngo' && <NGOHelpSection />}
                    {activeTab === 'rewards' && <RewardsSection />}
                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-50">
                            <Settings size={40} className="mx-auto mb-6 text-slate-300" />
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Settings Coming Soon</h3>
                            <p className="text-slate-400 font-bold">Manage notifications and profile preferences.</p>
                        </div>
                    )}
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

export default CivilianDashboard;
