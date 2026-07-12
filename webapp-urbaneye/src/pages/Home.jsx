import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Activity, Map, Upload, Sparkles, Shield, Users, Trophy, Star, ChevronRight, Play, CheckCircle, Zap, Building, MapPin, Download, Smartphone, Eye, Brain, Flame, Wifi, Link2, AlertOctagon, Gauge } from 'lucide-react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import axios from 'axios';
import { ContainerScroll } from '../components/ui/ContainerScrollAnimation';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1';


const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [stats, setStats] = useState({ totalReports: 1240, resolvedReports: 890, activeUsers: 350 });
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const leaderboardRef = useRef(null);
    const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" });
    const isLeaderboardInView = useInView(leaderboardRef, { once: true, margin: "-100px" });
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    useEffect(() => {
        fetchLeaderboard();
        fetchStats();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get(`${API_BASE}/reports/leaderboard`);
            if (res.data.success) {
                setLeaderboard(res.data.leaderboard.slice(0, 5));
            }
        } catch (err) {
            // Use mock data if API fails
            setLeaderboard([
                { rank: 1, name: 'Aarav Sharma', xp: 125, report_count: 25 },
                { rank: 2, name: 'Priya Verma', xp: 100, report_count: 20 },
                { rank: 3, name: 'Vikram Singh', xp: 85, report_count: 17 },
                { rank: 4, name: 'Ananya Gupta', xp: 70, report_count: 14 },
                { rank: 5, name: 'Rahul Kumar', xp: 55, report_count: 11 },
            ]);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_BASE}/reports`);
            if (res.data.reports) {
                const reports = res.data.reports;
                setStats({
                    totalReports: reports.length,
                    resolvedReports: reports.filter(r => r.status === 'resolved').length,
                    activeUsers: 350
                });
            }
        } catch (err) {
            console.log('Using default stats');
        }
    };

    // Helper to get correct dashboard route based on role
    const getDashboardRoute = () => {
        if (!isAuthenticated() || !user) return '/login';
        switch (user.role) {
            case 'super_admin': return '/super-admin-dashboard';
            case 'gov_admin': return '/gov-admin-dashboard';
            case 'dept_head': return '/dept-head-dashboard';
            case 'field_officer': return '/field-officer-dashboard';
            case 'civilian': return '/dashboard';
            case 'gig_worker': return '/dashboard';
            case 'social_worker': return '/dashboard';
            default: return '/dashboard';
        }
    };

    const features = [
        {
            icon: Upload,
            title: "AI-Powered Detection",
            description: "Upload any image and our UrbanAI Engine instantly identifies civic issues like potholes, garbage, and broken streetlights.",
            color: "from-blue-500 to-indigo-600"
        },
        {
            icon: MapPin,
            title: "Real-time Tracking",
            description: "Every report is geo-tagged and tracked in real-time. Watch as issues move from reported to resolved.",
            color: "from-emerald-500 to-teal-600"
        },
        {
            icon: Building,
            title: "Department Routing",
            description: "Issues are automatically routed to the correct government department based on AI classification.",
            color: "from-purple-500 to-pink-600"
        },
        {
            icon: Zap,
            title: "Express Resolution",
            description: "Need it fixed fast? Book a verified gig worker for immediate on-ground resolution.",
            color: "from-amber-500 to-orange-600"
        },
        {
            icon: Brain,
            title: "AI Command Center",
            description: "Predictive infrastructure intelligence correlates weather, history, and live data to flag risks before they happen.",
            color: "from-purple-600 to-indigo-700"
        },
        {
            icon: AlertOctagon,
            title: "Emergency Mode",
            description: "During storms or disasters, the system auto-escalates critical hazards and pushes alerts to all departments instantly.",
            color: "from-red-500 to-rose-600"
        },
        {
            icon: Gauge,
            title: "Smart Meter Monitor",
            description: "Live consumption monitoring with anomaly detection and theft flagging across all utility distribution points.",
            color: "from-amber-500 to-yellow-600"
        },
        {
            icon: Wifi,
            title: "Smart City IoT",
            description: "Unified registry of street sensors, cameras, waste monitors, and flood detectors across all wards.",
            color: "from-cyan-500 to-blue-600"
        },
    ];

    const departments = [
        { label: 'AI Command Center', sub: 'Predictive analytics', icon: Brain, color: 'from-purple-600 to-indigo-700', route: '/ai-command-center', badge: 'Live' },
        { label: 'Electricity Dept', sub: 'Delhi grid monitoring', icon: Zap, color: 'from-amber-400 to-yellow-600', route: '/electricity', badge: 'Live' },
        { label: 'Gas Department', sub: 'IGL pipeline safety', icon: Flame, color: 'from-orange-500 to-red-600', route: '/gas', badge: 'Live' },
        { label: 'Smart Meters', sub: 'Anomaly & theft detection', icon: Gauge, color: 'from-amber-500 to-orange-600', route: '/smart-meters', badge: 'Live' },
        { label: 'Emergency Mode', sub: 'Disaster response', icon: AlertOctagon, color: 'from-red-500 to-rose-700', route: '/emergency-mode', badge: 'Standby' },
        { label: 'Smart City Devices', sub: 'IoT device registry', icon: Wifi, color: 'from-cyan-500 to-blue-600', route: '/smart-city-devices', badge: 'Live' },
        { label: 'Govt Integration', sub: 'ERP, NIC & ICCC', icon: Link2, color: 'from-indigo-500 to-blue-700', route: '/gov-integration', badge: 'Connected' },
    ];

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60 animate-pulse" />
                    <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Text Content */}
                        <motion.div
                            style={{ y: heroY, opacity: heroOpacity }}
                            className="space-y-8"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-bold mb-6">
                                    <Sparkles size={16} className="animate-pulse" />
                                    Powered by UrbanAI Engine™
                                </div>
                                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                    Empowering Citizens,
                                    <br />
                                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                                        Saving Cities.
                                    </span>
                                </h1>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-xl text-slate-500 leading-relaxed max-w-lg"
                            >
                                Urban Eye uses advanced AI to detect, track, and resolve civic infrastructure issues.
                                Join the movement for smarter, safer cities.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="flex flex-wrap items-center gap-4"
                            >
                                <NavLink
                                    to="/analyze"
                                    className="group flex items-center gap-2 sm:gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 transition-all"
                                >
                                    <Sparkles size={20} />
                                    Try AI Analysis
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </NavLink>
                                <NavLink
                                    to={getDashboardRoute()}
                                    className="group flex items-center gap-2 sm:gap-3 bg-white hover:bg-slate-50 text-slate-700 px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg border-2 border-slate-200 hover:border-slate-300 transition-all"
                                >
                                    <Play size={18} className="text-indigo-600" />
                                    View Live Map
                                </NavLink>
                            </motion.div>

                            {/* Trust Badges */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="flex items-center gap-6 pt-4"
                            >
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>Free to use</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <Shield size={16} className="text-indigo-500" />
                                    <span>Government verified</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <Zap size={16} className="text-amber-500" />
                                    <span>Instant results</span>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right: Stats Cards */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative"
                        >
                            <div className="relative">
                                {/* Main Dashboard Preview Card */}
                                <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="bg-slate-800 rounded-2xl p-4 mb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-slate-400 text-sm">Live Issues Map</span>
                                            <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                                LIVE
                                            </span>
                                        </div>
                                        <div className="h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center">
                                            <Map size={48} className="text-indigo-400 opacity-50" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-indigo-500/20 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-black text-indigo-400">{stats.totalReports}</p>
                                            <p className="text-xs text-slate-400">Reports</p>
                                        </div>
                                        <div className="bg-emerald-500/20 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-black text-emerald-400">{stats.resolvedReports}</p>
                                            <p className="text-xs text-slate-400">Resolved</p>
                                        </div>
                                        <div className="bg-purple-500/20 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-black text-purple-400">{stats.activeUsers}</p>
                                            <p className="text-xs text-slate-400">Users</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Cards */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                            <Activity size={20} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">System Status</p>
                                            <p className="font-bold text-slate-800">Operational</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                            <Eye size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">UrbanAI Engine™</p>
                                            <p className="font-bold text-slate-800 text-sm">Vision Tech</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} className="py-32 bg-gradient-to-b from-white to-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider">How it works</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 mb-4">
                            AI-Powered Civic Intelligence
                        </h2>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                            From detection to resolution, our platform streamlines the entire civic issue lifecycle.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="group bg-white rounded-3xl p-8 border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={24} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Smart City Platform Departments Section */}
            <section className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <span className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-purple-500/20">
                            <Sparkles size={14} /> Smart City Platform
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                            Live Command Centers
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Real-time monitoring, predictive intelligence, and emergency response — all connected in one platform across Delhi NCR.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {departments.map((dept, i) => (
                            <motion.div
                                key={dept.route}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.07 }}
                                viewport={{ once: true }}
                            >
                                <Link to={dept.route}
                                    className="group flex flex-col h-full bg-slate-900 rounded-2xl border border-white/5 hover:border-white/20 p-6 hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${dept.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                            <dept.icon size={22} className="text-white" />
                                        </div>
                                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            {dept.badge}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white text-lg mb-1">{dept.label}</h3>
                                        <p className="text-slate-400 text-sm">{dept.sub}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-white/60 mt-4 transition-colors">
                                        Open dashboard <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Video Showcase Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="aspect-w-16 aspect-h-9 bg-slate-900 relative group" style={{ aspectRatio: '16/9' }}>
                            {/* Placeholder Video / Overlay */}
                            {!isPlaying && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-all">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            if (videoRef.current) {
                                                videoRef.current.play();
                                                setIsPlaying(true);
                                            }
                                        }}
                                        className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-lg group-hover:bg-white/30 transition-all cursor-pointer"
                                    >
                                        <Play size={32} className="text-white fill-white ml-1" />
                                    </motion.button>

                                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                                        <h3 className="text-3xl font-bold text-white mb-2">See UrbanEye in Action</h3>
                                        <p className="text-white/80 text-lg">Watch how we're transforming city management, one report at a time.</p>
                                    </div>
                                </div>
                            )}

                            {/* You can replace the src with your actual video or use an iframe */}
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                poster="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=2000&q=80"
                                controls
                                onPause={() => setIsPlaying(false)}
                            >
                                {/* Place your video file named 'city_video.mp4' in the 'public' folder */}
                                <source src="/AdVideo.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Dashboard Preview with Scroll Animation */}
            <section className="bg-slate-50">
                <ContainerScroll
                    titleComponent={
                        <>
                            <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider">See it in action</span>
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mt-3">
                                Powerful Dashboard <br />
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    At Your Fingertips
                                </span>
                            </h2>
                        </>
                    }
                >
                    <div className="h-full w-full bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] p-4 flex gap-4 overflow-hidden">
                        {/* Sidebar */}
                        <div className="hidden md:flex flex-col w-56 shrink-0 space-y-3">
                            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <Activity size={16} className="text-white" />
                                </div>
                                <span className="text-white font-bold text-sm">UrbanEye</span>
                            </div>
                            {[
                                { icon: '🔴', label: 'Critical', value: '24' },
                                { icon: '🟡', label: 'In Progress', value: '156' },
                                { icon: '🟢', label: 'Resolved', value: '89' }
                            ].map((s, i) => (
                                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-lg">{s.icon}</span>
                                    <p className="text-xl font-bold text-white">{s.value}</p>
                                    <p className="text-xs text-slate-400">{s.label}</p>
                                </div>
                            ))}
                            <div className="mt-auto p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-green-400 text-xs font-bold">LIVE</span>
                                </div>
                            </div>
                        </div>

                        {/* Delhi Heatmap */}
                        <div className="flex-1 bg-slate-900/50 rounded-2xl relative overflow-hidden border border-white/10">
                            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                                <Map size={16} className="text-indigo-400" />
                                <span className="text-white text-sm font-bold">Delhi NCR Heatmap</span>
                            </div>

                            {/* Real Leaflet Map */}
                            <MapContainer
                                center={[28.6139, 77.2090]}
                                zoom={12}
                                scrollWheelZoom={false}
                                zoomControl={false}
                                dragging={false}
                                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap'
                                />
                                {/* Delhi Issue Hotspots */}
                                {[
                                    { pos: [28.6315, 77.2167], name: 'Connaught Place', severity: 'high', count: 45 },
                                    { pos: [28.6519, 77.1909], name: 'Karol Bagh', severity: 'high', count: 32 },
                                    { pos: [28.6562, 77.2328], name: 'Chandni Chowk', severity: 'medium', count: 28 },
                                    { pos: [28.5355, 77.2069], name: 'Saket', severity: 'medium', count: 19 },
                                    { pos: [28.5673, 77.3211], name: 'Noida', severity: 'low', count: 15 },
                                    { pos: [28.5921, 77.0460], name: 'Dwarka', severity: 'low', count: 12 },
                                    { pos: [28.7041, 77.1025], name: 'Rohini', severity: 'medium', count: 22 },
                                    { pos: [28.6280, 77.2789], name: 'Mayur Vihar', severity: 'low', count: 8 }
                                ].map((spot, i) => (
                                    <CircleMarker
                                        key={i}
                                        center={spot.pos}
                                        radius={spot.severity === 'high' ? 25 : spot.severity === 'medium' ? 18 : 12}
                                        pathOptions={{
                                            color: spot.severity === 'high' ? '#ef4444' : spot.severity === 'medium' ? '#f59e0b' : '#22c55e',
                                            fillColor: spot.severity === 'high' ? '#ef4444' : spot.severity === 'medium' ? '#f59e0b' : '#22c55e',
                                            fillOpacity: 0.4,
                                            weight: 2
                                        }}
                                    >
                                        <Popup>
                                            <div className="text-center">
                                                <strong>{spot.name}</strong>
                                                <p className="text-sm">{spot.count} active issues</p>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>

                            {/* Overlay Controls */}
                            <div className="absolute top-3 left-3 flex items-center gap-2 z-[1000]">
                                <MapPin size={16} className="text-indigo-600" />
                                <span className="text-slate-800 text-sm font-bold bg-white/90 backdrop-blur shadow-lg px-3 py-1.5 rounded-lg">Delhi NCR Live</span>
                            </div>

                            {/* Legend */}
                            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur shadow-lg rounded-xl p-3 flex gap-4 text-xs z-[1000]">
                                <span className="flex items-center gap-1.5 text-slate-700 font-medium"><span className="w-3 h-3 bg-red-500 rounded-full" /> High</span>
                                <span className="flex items-center gap-1.5 text-slate-700 font-medium"><span className="w-3 h-3 bg-amber-500 rounded-full" /> Med</span>
                                <span className="flex items-center gap-1.5 text-slate-700 font-medium"><span className="w-3 h-3 bg-green-500 rounded-full" /> Low</span>
                            </div>

                            {/* Active Count */}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur shadow-lg rounded-xl p-3 text-right z-[1000]">
                                <p className="text-2xl font-black text-indigo-600">1,247</p>
                                <p className="text-xs text-slate-500">Active Issues</p>
                            </div>
                        </div>
                    </div>
                </ContainerScroll>
            </section>

            {/* Leaderboard Section */}
            <section ref={leaderboardRef} className="py-32 bg-slate-900 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Text */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={isLeaderboardInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="text-indigo-400 font-bold text-sm uppercase tracking-wider">Community Heroes</span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-6">
                                Top Contributors
                            </h2>
                            <p className="text-xl text-slate-400 mb-8">
                                Celebrate the citizens making their cities better. Every report earns XP and helps build a safer community.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Trophy size={20} className="text-amber-400" />
                                    <span>5 XP per report</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Star size={20} className="text-amber-400" />
                                    <span>Monthly rewards</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Leaderboard Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={isLeaderboardInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Trophy size={24} className="text-amber-400" />
                                    Leaderboard
                                </h3>
                                <span className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">This Week</span>
                            </div>

                            <div className="space-y-3">
                                {leaderboard.map((user, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={isLeaderboardInView ? { opacity: 1, x: 0 } : {}}
                                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-slate-700/50 ${index === 0 ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20' : 'bg-slate-700/30'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                                            index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800' :
                                                index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                                                    'bg-slate-600 text-slate-300'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white">{user.name}</p>
                                            <p className="text-sm text-slate-400">{user.report_count} reports</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-indigo-400">{user.xp} XP</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <NavLink
                                to={getDashboardRoute()}
                                className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all"
                            >
                                View Full Leaderboard
                                <ChevronRight size={18} />
                            </NavLink>
                        </motion.div>
                    </div>
                </div>
            </section>


            {/* App Download Section */}
            <section className="py-24 bg-slate-900 relative overflow-hidden border-t border-white/10">
                {/* Animated Background Orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-indigo-500/30 flex flex-col md:flex-row items-center gap-12"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="flex-1 space-y-6"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium"
                            >
                                <Smartphone size={16} />
                                <span>Mobile App Available</span>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                viewport={{ once: true }}
                                className="text-3xl md:text-5xl font-black text-white leading-tight"
                            >
                                Report Issues on the Go
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                viewport={{ once: true }}
                                className="text-lg text-slate-300"
                            >
                                Download the UrbanEye mobile app to instantly report civic issues, track status updates, and earn rewards directly from your smartphone.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                viewport={{ once: true }}
                                className="flex flex-wrap gap-4 pt-4"
                            >
                                <a
                                    href="/app-release.apk"
                                    className="group flex items-center gap-3 bg-white text-indigo-900 px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-50 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300"
                                    download
                                >
                                    <Download size={20} className="group-hover:animate-bounce" />
                                    Download APK
                                </a>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30, rotateY: 15 }}
                            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="flex-1 flex justify-center items-center"
                        >
                            {/* Modern Phone Mockup */}
                            <div className="relative w-72 md:w-80 aspect-[9/19] border-[6px] border-slate-700 rounded-[2.5rem] bg-slate-900 shadow-2xl overflow-hidden ring-4 ring-slate-800/50 hover:ring-indigo-500/30 transition-all duration-500">
                                {/* Dynamic Island / Notch */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-full z-20 flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                                    <div className="w-8 h-2 bg-slate-700 rounded-full"></div>
                                </div>

                                {/* Screen Content */}
                                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex flex-col pt-12 px-4 pb-6">
                                    {/* App Header */}
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3 shadow-xl shadow-indigo-500/30">
                                            <Eye size={28} className="text-white" />
                                        </div>
                                        <h3 className="text-white font-bold text-lg">UrbanEye</h3>
                                        <p className="text-indigo-300 text-xs">Smarter Cities, Together.</p>
                                    </div>

                                    {/* Action Button */}
                                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-3.5 rounded-2xl flex items-center gap-3 shadow-xl shadow-purple-500/20 mb-4">
                                        <div className="bg-white/20 p-2.5 rounded-xl">
                                            <Upload size={18} className="text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white text-sm font-bold">Report an Issue</p>
                                            <p className="text-white/70 text-xs">Snap & Submit</p>
                                        </div>
                                        <ChevronRight size={18} className="text-white/50 ml-auto" />
                                    </div>

                                    {/* Recent Activity Label */}
                                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-2 px-1">Recent Activity</p>

                                    {/* Status Cards */}
                                    <div className="space-y-2.5 flex-1">
                                        <div className="bg-slate-800/60 backdrop-blur-sm p-3 rounded-xl flex items-center gap-3 border border-slate-700/50">
                                            <div className="bg-green-500/20 p-2 rounded-lg shrink-0">
                                                <CheckCircle size={16} className="text-green-400" />
                                            </div>
                                            <div className="text-left min-w-0 flex-1">
                                                <p className="text-white text-xs font-semibold truncate">Pothole Fixed</p>
                                                <p className="text-slate-400 text-[10px] truncate">MG Road</p>
                                            </div>
                                            <span className="text-green-400 text-[9px] font-bold bg-green-500/10 px-2 py-1 rounded-full shrink-0">DONE</span>
                                        </div>

                                        <div className="bg-slate-800/60 backdrop-blur-sm p-3 rounded-xl flex items-center gap-3 border border-slate-700/50">
                                            <div className="bg-amber-500/20 p-2 rounded-lg shrink-0">
                                                <Zap size={16} className="text-amber-400" />
                                            </div>
                                            <div className="text-left min-w-0 flex-1">
                                                <p className="text-white text-xs font-semibold truncate">Street Light</p>
                                                <p className="text-slate-400 text-[10px] truncate">Sector 7</p>
                                            </div>
                                            <span className="text-amber-400 text-[9px] font-bold bg-amber-500/10 px-2 py-1 rounded-full shrink-0">ACTIVE</span>
                                        </div>

                                        <div className="bg-slate-800/60 backdrop-blur-sm p-3 rounded-xl flex items-center gap-3 border border-slate-700/50">
                                            <div className="bg-blue-500/20 p-2 rounded-lg shrink-0">
                                                <MapPin size={16} className="text-blue-400" />
                                            </div>
                                            <div className="text-left min-w-0 flex-1">
                                                <p className="text-white text-xs font-semibold truncate">Garbage Dump</p>
                                                <p className="text-slate-400 text-[10px] truncate">Park Lane</p>
                                            </div>
                                            <span className="text-blue-400 text-[9px] font-bold bg-blue-500/10 px-2 py-1 rounded-full shrink-0">NEW</span>
                                        </div>
                                    </div>

                                    {/* Bottom Nav Bar */}
                                    <div className="mt-4 bg-slate-800/80 backdrop-blur rounded-2xl p-3 flex items-center justify-around">
                                        <div className="flex flex-col items-center gap-1">
                                            <Activity size={18} className="text-indigo-400" />
                                            <span className="text-[8px] text-indigo-400 font-medium">Home</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <Map size={18} className="text-slate-500" />
                                            <span className="text-[8px] text-slate-500">Map</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <Trophy size={18} className="text-slate-500" />
                                            <span className="text-[8px] text-slate-500">Rank</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                            Ready to make a difference?
                        </h2>
                        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                            Join thousands of citizens using Urban Eye to create cleaner, safer, and smarter cities.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <NavLink
                                to="/signup"
                                className="group flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
                            >
                                Get Started Free
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </NavLink>
                            <NavLink
                                to="/analyze"
                                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold text-lg border-2 border-white/20 hover:bg-white/20 transition-all"
                            >
                                <Sparkles size={18} />
                                Try AI Demo
                            </NavLink>
                        </div>
                    </motion.div>
                </div>
            </section >

            {/* About Section */}
            <section className="py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-6"
                        >
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                            <span className="text-indigo-400 font-bold text-sm uppercase tracking-wider">About Us</span>
                        </motion.div>
                        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-4 sm:mb-6">
                            Team <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Absolute</span>
                        </h2>
                        <p className="text-lg sm:text-2xl text-slate-300">
                            From <span className="font-bold text-white">MITS Gwalior</span>
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-slate-700/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-slate-600/30 text-center max-w-4xl mx-auto"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
                            <Eye size={40} className="text-white" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Our Mission</h3>
                        <p className="text-lg md:text-xl text-slate-300 leading-relaxed italic">
                            "To innovate technology for society — <span className="text-indigo-400 font-semibold">for the society, by the society</span>."
                        </p>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { title: "AI-Powered", subtitle: "Civic Solutions", color: "text-indigo-400" },
                                { title: "Community", subtitle: "Driven Impact", color: "text-purple-400" },
                                { title: "Smart Cities", subtitle: "Future Ready", color: "text-pink-400" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-slate-700/50 px-6 py-4 rounded-xl border border-slate-600/30 hover:border-slate-500/50 hover:bg-slate-700/70 transition-all duration-300 cursor-pointer"
                                >
                                    <p className={`${item.color} font-bold text-2xl`}>{item.title}</p>
                                    <p className="text-slate-400 text-sm">{item.subtitle}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Eye size={22} className="text-white" />
                            </div>
                            <span className="text-xl font-black text-white">
                                Urban<span className="text-indigo-400">Eye</span>
                            </span>
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-slate-400 text-sm">
                                © 2026 UrbanEye by Team Solaris, MITS Gwalior
                            </p>

                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy</a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Terms</a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default Home;
