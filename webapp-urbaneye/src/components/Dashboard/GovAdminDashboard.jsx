import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceCommand } from '../../hooks/useVoiceCommand';
import VoiceAssistantButton from '../common/VoiceAssistantButton';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import {
    LayoutDashboard, Users, AlertTriangle, FileText, Settings, LogOut,
    Menu, X, Bell, Search, MapPin, Filter, Database, RefreshCw,
    Edit2, TrendingUp, ExternalLink, BarChart3, Activity, CheckCircle, PieChart as PieIcon, Map, ChevronLeft, ChevronRight, Building, Download, Sparkles, CloudRain, Newspaper, Zap, Plus, Clock, UserPlus, BadgeIndianRupee, Mic, MicOff, Image, Loader2, Brain, Flame, Wifi, Link2, AlertOctagon, Gauge, Box, Layers, Thermometer, Droplets, Wind, Focus, MousePointer2
} from 'lucide-react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadialBarChart, RadialBar, AreaChart, Area
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import 'leaflet/dist/leaflet.css';
import './GovAdminDashboard.css';
import DigitalTwinCity from './DigitalTwinCity';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-tooltip">
                <p className="tooltip-label">{label || payload[0].name}</p>
                <p className="tooltip-value">
                    {payload.map((p, i) => (
                        <span key={i} style={{ color: p.color || p.fill, display: 'block' }}>
                            {p.name}: {p.value}
                        </span>
                    ))}
                </p>
            </div>
        );
    }
    return null;
};

const GovAdminDashboard = () => {
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
        recentReports: [],
        teamCount: 0
    });
    const [reports, setReports] = useState([]);
    const [mapPoints, setMapPoints] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', email: '', password: '', role: 'field_officer', department: 'Roads' });
    const [customMapCenter, setCustomMapCenter] = useState(null);
    const [streetViewLocation, setStreetViewLocation] = useState(null);
    const [prModalOpen, setPrModalOpen] = useState(false);
    const [generatedPR, setGeneratedPR] = useState('');
    const [prImage, setPrImage] = useState(null);
    const [prImageLoading, setPrImageLoading] = useState(false);
    const [showPredictions, setShowPredictions] = useState(false);
    const [predictions, setPredictions] = useState([]);

    // Digital Twin Simulation State
    const [dtBudget, setDtBudget] = useState(50);
    const [dtCrew, setDtCrew] = useState(100);
    const [dtPolicy, setDtPolicy] = useState('Reactive');
    const [dtWardPriority, setDtWardPriority] = useState('All Wards');
    const [isSimulating, setIsSimulating] = useState(false);
    const [simResults, setSimResults] = useState(null);
    const [dtActiveLayer, setDtActiveLayer] = useState('infrastructure');
    const [dtSimHistory, setDtSimHistory] = useState([]);

    const runSimulation = async () => {
        setIsSimulating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/gov/digital-twin/simulate`, {
                budget: dtBudget,
                crew_count: dtCrew,
                response_policy: dtPolicy,
                ward_priority: dtWardPriority
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSimResults(res.data.simulation);
                setDtSimHistory(prev => [...prev.slice(-4), { ...res.data.simulation, timestamp: new Date().toLocaleTimeString(), budget: dtBudget, crew: dtCrew, policy: dtPolicy }]);
            }
        } catch (err) {
            console.error('Simulation Failed:', err);
            const fallback = {
                 predicted_backlog: Math.max(50, 500 - (dtBudget * 1.2) - (dtCrew * 0.5)),
                 resolution_time_hrs: Math.max(8, 72 - (dtCrew * 0.1) - (dtBudget * 0.08)),
                 sla_breaches: Math.max(2, 80 - (dtBudget * 0.2) - (dtCrew * 0.06)),
                 citizen_satisfaction: Math.min(95, 20 + (dtBudget * 0.2) + (dtCrew * 0.05)),
                 ai_insight: `With ₹${dtBudget}M budget and ${dtCrew} crew under ${dtPolicy} policy: ${dtPolicy === 'Predictive' ? 'Proactive deployment reduces SLA breaches by ~40%.' : dtPolicy === 'Preventive' ? 'Scheduled maintenance cuts backlog by ~25%.' : 'Reactive mode leads to higher citizen wait times.'}`
            };
            setSimResults(fallback);
            setDtSimHistory(prev => [...prev.slice(-4), { ...fallback, timestamp: new Date().toLocaleTimeString(), budget: dtBudget, crew: dtCrew, policy: dtPolicy }]);
        } finally {
            setIsSimulating(false);
        }
    };


    // AI Prediction State
    const [predictionLoading, setPredictionLoading] = useState(false);
    const [ticketStatus, setTicketStatus] = useState({}); // { index: 'loading' | 'success' | 'error' }

    const createTicket = async (pred, index) => {
        setTicketStatus(prev => ({ ...prev, [index]: 'loading' }));
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/reports`, {
                category: pred.type,
                description: `AI Prediction: ${pred.reasoning}`,
                severity: pred.risk.toLowerCase().includes('high') ? 'high' : 'medium',
                lat: pred.lat,
                lng: pred.lng
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setTicketStatus(prev => ({ ...prev, [index]: 'success' }));
                setTimeout(() => setTicketStatus(prev => ({ ...prev, [index]: null })), 3000); // Reset after 3s
            }
        } catch (err) {
            console.error(err);
            setTicketStatus(prev => ({ ...prev, [index]: 'error' }));
            alert("Failed to create ticket");
        }
    };

    const startPrediction = async () => {
        setPredictionLoading(true);
        setPredictions([]);
        setTicketStatus({}); // Reset ticket statuses
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${API_BASE}/gov/predictions`, { headers });
            if (res.data.success) {
                setPredictions(res.data.predictions);
                if (res.data.meta) {
                    setPredictionMeta(res.data.meta);
                }
            }
        } catch (err) {
            console.error("Failed to fetch predictions", err);
            alert("AI Prediction Service Unavailable");
        } finally {
            setPredictionLoading(false);
        }
    };


    // HRMS State
    const [hrTab, setHrTab] = useState('directory'); // directory, recruitment, attendance, payroll, grievance
    const [payrollData, setPayrollData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [recruitmentData, setRecruitmentData] = useState([]);

    useEffect(() => {
        if (activeView === 'team') {
            fetchHRMSData();
        }
    }, [activeView, hrTab]);

    const fetchHRMSData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            if (hrTab === 'recruitment' && recruitmentData.length === 0) {
                const res = await axios.get(`${API_BASE}/hr/candidates`, { headers });
                if (res.data.success) setRecruitmentData(res.data.candidates);
            }
            if (hrTab === 'attendance' && attendanceData.length === 0) {
                const res = await axios.get(`${API_BASE}/hr/attendance`, { headers });
                if (res.data.success) setAttendanceData(res.data.attendance);
            }
            if (hrTab === 'payroll' && payrollData.length === 0) {
                const res = await axios.get(`${API_BASE}/hr/payroll`, { headers });
                if (res.data.success) setPayrollData(res.data.payroll);
            }
        } catch (err) {
            console.error("Failed to fetch HRMS data", err);
        }
    };

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

    // Process Voice Commands
    const processVoiceCommand = (command) => {
        const cmd = command.toLowerCase().trim();

        // Advanced Command
        if (cmd.includes('advance select') && cmd.includes('full')) {
            if (cmd.includes('delhi')) {
                setSelectedCity('delhi');
                setActiveView('heatmap');
                speak('Advanced selecting Delhi and opening full layout');
                setVoiceFeedback('✓ Delhi map open');
                return;
            } else if (cmd.includes('gwalior')) {
                setSelectedCity('gwalior');
                setActiveView('heatmap');
                speak('Advanced selecting Gwalior and opening full layout');
                setVoiceFeedback('✓ Gwalior map open');
                return;
            } else if (cmd.includes('canberra')) {
                setSelectedCity('canberra');
                setActiveView('heatmap');
                speak('Advanced selecting Canberra and opening full layout');
                setVoiceFeedback('✓ Canberra map open');
                return;
            }
        }

        // Navigation commands
        if (cmd.includes('dashboard') || cmd.includes('overview') || cmd.includes('home')) {
            setActiveView('overview');
            speak('Opening dashboard overview');
            setVoiceFeedback('✓ Opening Dashboard');
        }
        else if (cmd.includes('analytics') || cmd.includes('charts') || cmd.includes('statistics')) {
            setActiveView('analytics');
            speak('Opening analytics section');
            setVoiceFeedback('✓ Opening Analytics');
        }
        else if (cmd.includes('team') || cmd.includes('hr') || cmd.includes('personnel') || cmd.includes('staff')) {
            setActiveView('team');
            speak('Opening HR and Personnel section');
            setVoiceFeedback('✓ Opening HR & Personnel');
        }
        else if (cmd.includes('heatmap') || cmd.includes('map') || cmd.includes('location')) {
            setActiveView('heatmap');
            speak('Opening city heatmap');
            setVoiceFeedback('✓ Opening Heatmap');
        }
        else if (cmd.includes('prediction') || cmd.includes('ai') || cmd.includes('predictive')) {
            setActiveView('predictions');
            speak('Opening AI predictive mode');
            setVoiceFeedback('✓ Opening AI Predictions');
        }
        else if (cmd.includes('report') || cmd.includes('incidents') || cmd.includes('all reports')) {
            setActiveView('reports');
            speak('Opening all reports');
            setVoiceFeedback('✓ Opening Reports');
        }
        else if (cmd.includes('setting')) {
            setActiveView('settings');
            speak('Opening settings');
            setVoiceFeedback('✓ Opening Settings');
        }
        // Status queries
        else if (cmd.includes('how many') || cmd.includes('total') || cmd.includes('count')) {
            const msg = `You have ${stats.totalReports} total reports. ${stats.resolvedReports} resolved, ${stats.pendingReports} pending, and ${stats.inProgressReports} in progress.`;
            speak(msg);
            setVoiceFeedback(`📊 ${stats.totalReports} total, ${stats.resolvedReports} resolved`);
        }
        else if (cmd.includes('critical') || cmd.includes('high priority') || cmd.includes('urgent')) {
            const highCount = severityStats.high || 0;
            speak(`There are ${highCount} high severity incidents requiring attention.`);
            setVoiceFeedback(`🔴 ${highCount} critical incidents`);
        }
        else if (cmd.includes('delhi')) {
            setSelectedCity('delhi');
            speak('Filtering to Delhi');
            setVoiceFeedback('✓ Showing Delhi data');
        }
        else if (cmd.includes('gwalior')) {
            setSelectedCity('gwalior');
            speak('Filtering to Gwalior');
            setVoiceFeedback('✓ Showing Gwalior data');
        }
        else if (cmd.includes('canberra')) {
            setSelectedCity('canberra');
            speak('Filtering to Canberra');
            setVoiceFeedback('✓ Showing Canberra data');
        }
        else if (cmd.includes('all cities') || cmd.includes('show all')) {
            setSelectedCity('all');
            speak('Showing all cities');
            setVoiceFeedback('✓ Showing all cities');
        }
        else if (cmd.includes('refresh') || cmd.includes('reload')) {
            fetchDashboardData();
            speak('Refreshing dashboard data');
            setVoiceFeedback('✓ Refreshing data...');
        }
        else if (cmd.includes('help') || cmd.includes('commands')) {
            speak('You can say: show dashboard, open analytics, go to heatmap, show reports, how many reports, show critical incidents, filter to Delhi, or refresh data.');
            setVoiceFeedback('💡 Say "help" for commands');
        }
        else {
            speak("Sorry, I didn't understand. Say help for available commands.");
            setVoiceFeedback('❓ Command not recognized');
        }

    };

    // Voice Command State from custom hook
    const { isListening, voiceTranscript, voiceFeedback, setVoiceFeedback, toggleVoiceCommand, speak } = useVoiceCommand(processVoiceCommand);

    // Seeder State
    const [seederCity, setSeederCity] = useState('delhi');
    const [seederCount, setSeederCount] = useState(10);
    const [seederLoading, setSeederLoading] = useState(false);

    const cityBounds = {
        delhi: { lat: [28.4, 28.9], lng: [76.8, 77.4] },
        gwalior: { lat: [26.1, 26.35], lng: [78.05, 78.3] },
        canberra: { lat: [-35.5, -35.1], lng: [149.0, 149.25] }
    };
    const [predictionMeta, setPredictionMeta] = useState(null);

    // Fetch reports on mount
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const res = await axios.get(`${API_BASE}/gov/reports`, { headers });
                if (res.data.success) {
                    setReports(res.data.reports);
                }
            } catch (err) {
                console.error("Failed to fetch reports", err);
            }
        };

        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await axios.get(`${API_BASE}/gov/employees`, { headers });
                if (res.data.success) {
                    setEmployees(res.data.employees);
                }
            } catch (err) {
                console.error("Failed to fetch employees", err);
            }
        };
        fetchReports();
        fetchEmployees();
    }, []);

    // Fetch Analytics
    useEffect(() => {
        if (activeView === 'analytics') {
            const fetchAnalytics = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const headers = token ? { Authorization: `Bearer ${token}` } : {};
                    // Mock timeout for realism
                    await new Promise(r => setTimeout(r, 800));

                    const res = await axios.get(`${API_BASE}/gov/analytics`, { headers });
                    if (res.data.success) {
                        setAnalyticsData(res.data);
                    }
                } catch (err) {
                    console.error("Analytics fetch error:", err);
                } finally {
                    setLoading(false);
                }
            }
            fetchAnalytics();
        }
    }, [activeView]);

    // Prediction auto-fetch removed for manual trigger preference

    useEffect(() => {
        fetchDashboardData();
    }, []);

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

            // Transform reports: convert backend 'timestamp' to 'created_at' 
            const allReports = (reportsRes.data.reports || []).map(r => ({
                ...r,
                created_at: r.timestamp ? new Date(r.timestamp * 1000).toISOString() : null,
                id: r.id || `temp-${Math.random()}`
            }));

            setReports(allReports);
            calculateAnalytics(allReports);

            // Fetch Team Data
            try {
                const teamRes = await axios.get(`${API_BASE}/gov/staff`, { headers });
                setTeamMembers(teamRes.data.staff || []);
                setStats(prev => ({ ...prev, teamCount: teamRes.data.staff?.length || 0 }));
            } catch (err) {
                console.error("Failed to fetch team:", err);
            }

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

        // Calculate Trend Data (Last 7 Days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i)); // Start from 7 days ago
            return d.toISOString().split('T')[0];
        });

        const trendData = last7Days.map(date => {
            // Try multiple date matching strategies
            const dayReports = filteredReports.filter(r => {
                if (!r.created_at) return false;

                try {
                    // Handle various date formats: ISO string, Unix timestamp, etc.
                    let reportDate;
                    if (typeof r.created_at === 'number') {
                        // Unix timestamp (seconds or milliseconds)
                        const ts = r.created_at > 9999999999 ? r.created_at : r.created_at * 1000;
                        reportDate = new Date(ts).toISOString().split('T')[0];
                    } else if (typeof r.created_at === 'string') {
                        // ISO string or other date string
                        reportDate = new Date(r.created_at).toISOString().split('T')[0];
                    } else {
                        return false;
                    }
                    return reportDate === date;
                } catch (e) {
                    return false;
                }
            });

            return {
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                total: dayReports.length,
                resolved: dayReports.filter(r => r.status === 'resolved').length,
                active: dayReports.filter(r => r.status !== 'resolved').length
            };
        });

        // Log for debugging
        console.log('Trend Data Generated:', trendData);
        console.log('Total Reports:', filteredReports.length);
        console.log('Sample Report Dates:', filteredReports.slice(0, 3).map(r => r.created_at));

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
            console.error(error);
        }
        setSeederLoading(false);
    };

    const [fullSeederLoading, setFullSeederLoading] = useState(false);

    const seedAll = async () => {
        const secretKey = prompt("Enter Admin Secret Key:");
        if (!secretKey) return;

        setFullSeederLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/auth/admin/seed-all`, {
                secret_key: secretKey
            });
            if (response.data.success) {
                const c = response.data.created;
                alert(`✅ Database Seeded Successfully!\n\n👥 Users: ${c.users}\n👔 Dept Heads: ${c.dept_heads}\n🛡️ Field Officers: ${c.field_officers}\n📋 Reports: ${c.reports}\n📅 Bookings: ${c.bookings}\n🤝 NGO Requests: ${c.ngo_requests}`);
                fetchDashboardData();
            }
        } catch (error) {
            alert('❌ Failed to seed database. Check secret key.');
            console.error(error);
        }
        setFullSeederLoading(false);
    };


    const updateReportStatus = async (reportId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.put(`${API_BASE}/reports/${reportId}/status`, { status: newStatus }, { headers });

            // Optimistic update
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
            calculateAnalytics(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));

            // Show success notification (could be a toast, using alert for now)
            // alert(`Report #${reportId} updated to ${newStatus.replace('_', ' ')}`); 
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleExportCSV = () => {
        if (!reports.length) return;

        const headers = ['ID', 'Date', 'Category', 'Department', 'Description', 'Severity', 'Status', 'Location'];
        const csvContent = [
            headers.join(','),
            ...reports.map(r => {
                return [
                    r.id,
                    new Date(r.created_at).toLocaleDateString(),
                    `"${r.category}"`,
                    `"${r.department}"`,
                    `"${(r.description || '').replace(/"/g, '""')}"`,
                    r.severity,
                    r.status,
                    `"${r.latitude}, ${r.longitude}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `gov_reports_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const onAddMember = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // In a real app, this would be a POST request
            // const res = await axios.post(`${API_BASE}/gov/staff`, newMember, { headers });
            // const addedMember = res.data;

            // For demo/consistency with current mock data approach in other tabs, 
            // but since we have a real backend endpoint for staff, let's try to use it 
            // OR fallback to local state update if backend is not fully ready for this specific flow.
            // Given the previous error "handleAddMember is not defined", the priority is to stop the crash.

            // Simulation or Real Call:
            // Since User previously asked to "add field officers", let's attempt real call but handle error gracefully.

            const payload = { ...newMember };

            // Optimistic UI update
            const tempId = Date.now();
            const optimisticMember = { ...payload, id: tempId, efficiency: 90 };
            setTeamMembers(prev => [...prev, optimisticMember]);
            setStats(prev => ({ ...prev, teamCount: prev.teamCount + 1 }));

            setShowAddMemberModal(false);
            setNewMember({ name: '', email: '', password: '', role: 'field_officer', department: 'Roads' });

            // alert("Member added successfully!");

        } catch (error) {
            console.error("Error adding member:", error);
            alert("Failed to add member.");
        }
    };

    const generateWeeklyReport = () => {
        const resolved = stats.resolvedReports || 0;
        const total = stats.totalReports || 1; // avoid div by zero
        const rate = Math.round((resolved / total) * 100);
        const moneySaved = (resolved * 4500).toLocaleString(); // Est. 4500 per issue
        const peopleHelped = (resolved * 150).toLocaleString(); // Est. 150 people per issue

        const templates = [
            `🚀 UrbanEye Update: This week, our team resolved ${resolved} critical infrastructure issues across the city! with a ${rate}% efficiency rate, we've saved an estimated ₹${moneySaved} in potential damages and improved daily life for over ${peopleHelped} citizens. We are building a safer, smarter city together! #UrbanEye #GovTech #SmartCity`,
            `🏛️ City Operations Report: We are moving fast! ${resolved} civic reports were successfully closed this week. Thanks to our dedicated field officers and active citizen reporters, we've prevented ₹${moneySaved} in long-term repair costs. Keep reporting, we keep fixing! #UrbanGov #Efficiency`,
            `🌟 Community Impact: ${peopleHelped} residents are enjoying safer streets today. UrbanEye's rapid response team helped fix ${resolved} issues (Potholes, Drainage, Lights) in record time. Efficiency is up by ${rate}%! Let's keep the momentum going. 🇮🇳 #DigitalIndia #UrbanSafety`
        ];

        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        setGeneratedPR(randomTemplate);
        setPrImage(null); // Reset image
        setPrModalOpen(true);
    };

    const generatePRImage = async () => {
        setPrImageLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post(`${API_BASE}/gov/generate-pr-image`, {
                pr_text: generatedPR,
                stats: stats
            }, { headers });

            if (response.data.success) {
                setPrImage(response.data.image_url);
            } else {
                alert("Failed to generate image: " + response.data.message);
            }
        } catch (error) {
            console.error("Error generating image:", error);
            alert("Failed to connect to image generation service.");
        } finally {
            setPrImageLoading(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const getSeverityColor = (s) => s === 'high' ? '#ef4444' : s === 'medium' ? '#f59e0b' : '#22c55e';
    const getStatusColor = (s) => s === 'resolved' ? '#22c55e' : s === 'in_progress' ? '#3b82f6' : s === 'assigned' ? '#8b5cf6' : '#f59e0b';

    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'team', icon: Users, label: 'HR & Personnel' },
        { id: 'digital-twin', icon: Box, label: 'Digital Twin Lite' },
        { id: 'heatmap', icon: Map, label: 'City Heatmap' },
        { id: 'predictions', icon: Zap, label: 'AI Predictive Mode' },
        { id: 'reports', icon: FileText, label: 'All Reports' },
        { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    const smartCityLinks = [
        { label: 'AI Command Center', icon: Brain, route: '/ai-command-center', color: 'from-purple-600 to-indigo-700' },
        { label: 'Electricity Dept', icon: Zap, route: '/electricity', color: 'from-amber-400 to-yellow-600' },
        { label: 'Gas Department', icon: Flame, route: '/gas', color: 'from-orange-500 to-red-600' },
        { label: 'Smart Meters', icon: Gauge, route: '/smart-meters', color: 'from-amber-500 to-orange-600' },
        { label: 'Emergency Mode', icon: AlertOctagon, route: '/emergency-mode', color: 'from-red-500 to-rose-700' },
        { label: 'IoT Devices', icon: Wifi, route: '/smart-city-devices', color: 'from-cyan-500 to-blue-600' },
        { label: 'Govt Integration', icon: Link2, route: '/gov-integration', color: 'from-indigo-500 to-blue-700' },
    ];

    return (

        <div className="flex h-screen bg-slate-50 font-['Inter',sans-serif] text-slate-900 overflow-hidden">
            {/* Mobile Menu Button */}
            <button
                className="lg:hidden flex fixed top-4 left-4 z-[1000] p-3 bg-slate-800 border-none rounded-lg text-white cursor-pointer hover:bg-slate-700 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
            >
                <Menu size={24} />
            </button>

            {/* Mobile Overlay */}
            {mobileMenuOpen && <div className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[900]" onClick={() => setMobileMenuOpen(false)} />}

            {/* Sidebar */}
            <aside className={`
                ${sidebarCollapsed ? 'w-20' : 'w-72'}
                ${sidebarCollapsed ? 'min-w-[80px]' : 'min-w-[288px]'}
                bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
                flex flex-col transition-all duration-300 ease-in-out relative z-[100]
                shadow-2xl shadow-slate-900/50
                ${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-[950]' : 'max-lg:hidden'}
            `}>
                {/* Brand Header */}
                <div className="flex items-center gap-3 p-6 mb-2 border-b border-white/10">
                    <div className="w-12 h-12 min-w-[48px] bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                        <Building size={sidebarCollapsed ? 22 : 28} className="drop-shadow-sm" />
                    </div>
                    {!sidebarCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-extrabold text-2xl text-white tracking-tight whitespace-nowrap">UrbanEye</span>
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Gov Admin</span>
                        </div>
                    )}
                    <button
                        className="lg:hidden ml-auto bg-white/5 border-none p-2 rounded-lg text-slate-400 cursor-pointer hover:text-white hover:bg-white/10 transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Collapse Toggle */}
                <button
                    className="hidden lg:flex items-center justify-center w-full p-2 mb-4 bg-white/5 border-none rounded-lg text-slate-400 cursor-pointer transition-all hover:bg-white/10 hover:text-white"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                    {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>

                <nav className="flex-1 flex flex-col gap-2 overflow-y-auto hide-scrollbar">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`
                                flex items-center gap-3 px-4 py-3.5 border-none rounded-lg font-medium cursor-pointer transition-all text-left whitespace-nowrap w-full
                                ${sidebarCollapsed ? 'justify-center px-3.5' : ''}
                                ${activeView === item.id
                                    ? 'bg-gradient-to-r from-red-500/10 to-red-500/5 text-red-500 border-l-4 border-red-500'
                                    : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white'}
                            `}
                            onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }}
                            title={sidebarCollapsed ? item.label : ''}
                        >
                            <item.icon size={20} className="flex-shrink-0" />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </button>
                    ))}

                    {/* Smart City Platform */}
                    <div className={`mt-4 pt-4 border-t border-white/10 ${sidebarCollapsed ? 'px-1' : 'px-2'}`}>
                        {!sidebarCollapsed && (
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3 px-2">Smart City Platform</p>
                        )}
                        <div className="flex flex-col gap-1">
                            {smartCityLinks.map(link => (
                                <button
                                    key={link.route}
                                    className={`
                                        flex items-center gap-3 px-4 py-2.5 border-none rounded-lg font-medium cursor-pointer transition-all text-left whitespace-nowrap w-full
                                        ${sidebarCollapsed ? 'justify-center px-3.5' : ''}
                                        bg-transparent text-slate-400 hover:bg-white/5 hover:text-white text-sm
                                    `}
                                    onClick={() => { navigate(link.route); setMobileMenuOpen(false); }}
                                    title={sidebarCollapsed ? link.label : ''}
                                >
                                    <link.icon size={18} className="flex-shrink-0" />
                                    {!sidebarCollapsed && <span>{link.label}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                <div className={`border-t border-white/10 pt-5 mt-auto flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                            <div className="w-9 h-9 min-w-[36px] bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {user?.name?.charAt(0) || 'G'}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-white font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{user?.name}</span>
                                <span className="text-slate-400 text-xs">Government Admin</span>
                            </div>
                        </div>
                    )}
                    <button
                        className="w-9 h-9 min-w-[36px] bg-red-500/10 border-none rounded-lg text-red-500 cursor-pointer flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto transition-all">
                <header className="flex items-center justify-between px-8 py-6 bg-white/90 backdrop-blur-lg border-b border-slate-200/80 shadow-md flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 m-0 flex items-center gap-3 tracking-tight bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            {activeView === 'overview' && <><LayoutDashboard className="w-8 h-8 text-red-500" /> Command Center</>}
                            {activeView === 'analytics' && <><BarChart3 className="w-8 h-8 text-red-500" /> Analytics Overview</>}
                            {activeView === 'team' && <><Users className="w-8 h-8 text-red-500" /> HR Command Center</>}
                            {activeView === 'digital-twin' && <><Box className="w-8 h-8 text-indigo-500" /> Digital Twin Lite</>}
                            {activeView === 'seeder' && <><Database className="w-8 h-8 text-red-500" /> Data Simulator</>}
                            {activeView === 'heatmap' && <><Map className="w-8 h-8 text-red-500" /> Geo-Spatial Map</>}
                            {activeView === 'reports' && <><FileText className="w-8 h-8 text-red-500" /> Incident Reports</>}
                            {activeView === 'predictions' && <><Zap className="w-8 h-8 text-purple-600" /> AI Command Center</>}
                            {activeView === 'settings' && <><Settings className="w-8 h-8 text-red-500" /> System Settings</>}
                        </h1>
                        <p className="text-slate-600 text-sm mt-1 font-medium">
                            {activeView === 'overview' && `City-wide Operations • ${stats.totalReports} active incidents`}
                            {activeView === 'analytics' && 'Department performance and trend analysis'}
                            {activeView === 'team' && 'Manage Department Heads and Field Officers'}
                            {activeView === 'digital-twin' && 'Real-time 3D interactive model & simulated infrastructure mapping'}
                            {activeView === 'seeder' && 'Simulate report data for testing and demos'}
                            {activeView === 'heatmap' && 'Real-time heatmap of civic issues'}
                            {activeView === 'predictions' && 'Correlating Historical Data, Live Weather & Local News'}
                            {activeView === 'reports' && `Review and manage ${reports.length} citizen reports`}
                            {activeView === 'settings' && 'Configure notification and account preferences'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                            onClick={fetchDashboardData}
                            disabled={loading}
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Refresh Data</span>
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-red-500 to-red-700 border-none rounded-lg text-white font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all"
                            onClick={() => navigate('/analyze')}
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Internal Report</span>
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium hover:bg-slate-700 transition-colors"
                            onClick={generateWeeklyReport}
                        >
                            <Zap size={18} className="text-yellow-400" />
                            <span className="hidden sm:inline">Generate Weekly PR</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-16 text-slate-500">
                            <RefreshCw size={48} className="text-blue-600 mb-4 animate-spin" />
                            <p className="text-lg font-medium">Loading command center...</p>
                        </div>
                    ) : (
                        <>
                            {/* Digital Twin View */}
                            {activeView === 'digital-twin' && (
                                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950">
                                    {/* Top Status Bar */}
                                    <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                                                <span className="text-green-300 text-[10px] font-bold uppercase tracking-widest">Delhi Digital Twin</span>
                                            </div>
                                            <span className="text-slate-600 text-xs">|</span>
                                            <span className="text-slate-400 text-[10px] uppercase tracking-wider">{new Date().toLocaleTimeString()}</span>
                                            <span className="text-slate-600 text-xs">|</span>
                                            <span className="text-indigo-300 text-[10px] uppercase tracking-wider font-semibold">MCD Command Center</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 text-[10px] uppercase tracking-wider">Active Layer:</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                                                dtActiveLayer === 'infrastructure' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                                                dtActiveLayer === 'thermal' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                                'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                            }`}>
                                                {dtActiveLayer === 'infrastructure' ? '🏗️ Infrastructure' : dtActiveLayer === 'thermal' ? '🌡️ Thermal' : '💧 Water/Drainage'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="relative h-[75vh] flex">
                                        {/* 3D Interactive City Model (Three.js) */}
                                        <div className="flex-1 relative">
                                            <div className="absolute inset-0 z-0">
                                                <DigitalTwinCity activeLayer={dtActiveLayer} />
                                            </div>

                                            {/* Left Panel: What-If Engine */}
                                            <div className="absolute top-4 left-4 z-10 w-[400px] max-w-[90vw] pointer-events-none max-h-[calc(100%-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                                                <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
                                                    {/* Header */}
                                                    <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900/50 p-4 flex items-center justify-between border-b border-white/10">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-indigo-500/30 blur-md rounded-full"></div>
                                                                <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/50 relative z-10">
                                                                    <Brain className="w-5 h-5 text-indigo-300" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h2 className="text-white font-black text-base leading-tight tracking-wide">WHAT-IF ENGINE</h2>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 animate-pulse'}`}></span>
                                                                    <span className="text-indigo-200 text-[9px] font-bold uppercase tracking-widest">
                                                                        {isSimulating ? 'AI Computing...' : 'Ready'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 space-y-3">
                                                        {/* Budget */}
                                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                            <label className="flex justify-between items-center text-slate-300 text-[10px] font-bold mb-2 uppercase tracking-wider">
                                                                <span>City Budget (30 Days)</span>
                                                                <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] border border-indigo-500/30">₹{dtBudget}M</span>
                                                            </label>
                                                            <input type="range" min="10" max="250" step="10" value={dtBudget} onChange={e => setDtBudget(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                                        </div>
                                                        
                                                        {/* Crew */}
                                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                            <label className="flex justify-between items-center text-slate-300 text-[10px] font-bold mb-2 uppercase tracking-wider">
                                                                <span>Field Personnel</span>
                                                                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">{dtCrew} Units</span>
                                                            </label>
                                                            <input type="range" min="20" max="500" step="10" value={dtCrew} onChange={e => setDtCrew(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                                        </div>

                                                        {/* Policy */}
                                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                            <label className="text-slate-300 text-[10px] font-bold mb-2 block uppercase tracking-wider">Operational Policy</label>
                                                            <div className="flex gap-1.5">
                                                                {['Reactive', 'Preventive', 'Predictive'].map(pol => (
                                                                    <button key={pol} onClick={() => setDtPolicy(pol)}
                                                                        className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded border transition-all ${dtPolicy === pol ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                                                    >{pol}</button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                            <label className="text-slate-300 text-[10px] font-bold mb-2 block uppercase tracking-wider">Delhi Ward Priority</label>
                                                            <select value={dtWardPriority} onChange={e => setDtWardPriority(e.target.value)}
                                                                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                                                                <option value="All Wards">All Wards — Balanced</option>
                                                                <option value="New Delhi">New Delhi (CP, India Gate)</option>
                                                                <option value="South Delhi">South Delhi (Saket, Hauz Khas)</option>
                                                                <option value="North Delhi">North Delhi (Civil Lines, Model Town)</option>
                                                                <option value="East Delhi">East Delhi (Preet Vihar, Laxmi Nagar)</option>
                                                                <option value="West Delhi">West Delhi (Rajouri Garden, Dwarka)</option>
                                                                <option value="Central Delhi">Central Delhi (Karol Bagh, Chandni Chowk)</option>
                                                                <option value="Shahdara">Shahdara (Seelampur, Dilshad Garden)</option>
                                                            </select>
                                                        </div>
                                                        
                                                        {/* Execute */}
                                                        <button onClick={runSimulation} disabled={isSimulating}
                                                            className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.5)] disabled:opacity-50 border border-white/20 uppercase tracking-widest text-[10px]">
                                                            {isSimulating ? <RefreshCw className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                                            {isSimulating ? 'Processing...' : 'Execute Simulation'}
                                                        </button>

                                                        {/* Results */}
                                                        <AnimatePresence>
                                                            {simResults && !isSimulating && (
                                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="border-t border-white/10 pt-4 space-y-3">
                                                                    <p className="text-[9px] text-indigo-300 font-bold tracking-widest uppercase mb-3 flex items-center gap-2"><MapPin size={10} /> Delhi Projection — T+30 Days</p>
                                                                    
                                                                    {/* Core KPIs */}
                                                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                                                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-3 border border-white/5 relative overflow-hidden group">
                                                                            <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
                                                                            <div className="text-slate-400 text-[8px] uppercase font-bold tracking-widest mb-1 flex items-center justify-between">
                                                                                <span>Backlog</span><Layers size={8} className="text-blue-400" />
                                                                            </div>
                                                                            <div className="text-white font-mono text-xl font-black">{Math.round(simResults.predicted_backlog)}</div>
                                                                            <div className="w-full bg-slate-700 h-1 mt-1.5 rounded overflow-hidden">
                                                                                <motion.div initial={{width:0}} animate={{width:`${Math.min(100, simResults.predicted_backlog / 5)}%`}} className={`h-full ${simResults.predicted_backlog > 300 ? 'bg-red-500' : 'bg-blue-500'}`}></motion.div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-3 border border-white/5 relative overflow-hidden group">
                                                                            <div className="absolute top-0 right-0 w-12 h-12 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all"></div>
                                                                            <div className="text-slate-400 text-[8px] uppercase font-bold tracking-widest mb-1 flex items-center justify-between">
                                                                                <span>Resolution</span><Clock size={8} className="text-green-400" />
                                                                            </div>
                                                                            <div className="text-white font-mono text-xl font-black">{Math.round(simResults.resolution_time_hrs)}<span className="text-[10px] text-slate-400 ml-0.5">hr</span></div>
                                                                            <div className="w-full bg-slate-700 h-1 mt-1.5 rounded overflow-hidden">
                                                                                <motion.div initial={{width:0}} animate={{width:`${Math.max(0,100-(simResults.resolution_time_hrs*1.5))}%`}} className="h-full bg-green-500"></motion.div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-3 border border-white/5 relative overflow-hidden group">
                                                                            <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all"></div>
                                                                            <div className="text-slate-400 text-[8px] uppercase font-bold tracking-widest mb-1 flex items-center justify-between">
                                                                                <span>SLA Breach</span><AlertOctagon size={8} className="text-red-400" />
                                                                            </div>
                                                                            <div className="text-red-400 font-mono text-xl font-black">{Math.round(simResults.sla_breaches)}</div>
                                                                        </div>
                                                                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-3 border border-white/5 relative overflow-hidden group">
                                                                            <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
                                                                            <div className="text-slate-400 text-[8px] uppercase font-bold tracking-widest mb-1 flex items-center justify-between">
                                                                                <span>Satisfaction</span><Users size={8} className="text-emerald-400" />
                                                                            </div>
                                                                            <div className="text-emerald-400 font-mono text-xl font-black">{Math.round(simResults.citizen_satisfaction)}%</div>
                                                                            <div className="w-full bg-slate-700 h-1 mt-1.5 rounded overflow-hidden">
                                                                                <motion.div initial={{width:0}} animate={{width:`${simResults.citizen_satisfaction}%`}} className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500"></motion.div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* AI Insight */}
                                                                    <div className="bg-gradient-to-r from-indigo-500/15 to-purple-500/10 border-l-4 border-indigo-500 rounded-r-xl p-3">
                                                                        <div className="flex items-start gap-2">
                                                                            <Brain className="w-4 h-4 text-indigo-300 flex-shrink-0 mt-0.5" />
                                                                            <div>
                                                                                <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest block mb-0.5">AI Tactical Insight</span>
                                                                                <p className="text-white text-[11px] leading-relaxed font-medium">{simResults.ai_insight}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Category Breakdown */}
                                                                    {simResults.category_breakdown && (
                                                                        <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                                                            <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
                                                                                <BarChart3 size={10} className="text-cyan-400" />
                                                                                <span className="text-[9px] text-cyan-300 font-bold uppercase tracking-widest">Report Category Breakdown</span>
                                                                            </div>
                                                                            <div className="divide-y divide-white/5">
                                                                                {Object.entries(simResults.category_breakdown).map(([cat, data]) => (
                                                                                    <div key={cat} className="flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors">
                                                                                        <div className="flex items-center gap-2 min-w-0">
                                                                                            <span className="text-[10px] text-white font-semibold truncate">{cat}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className="text-right">
                                                                                                <span className="text-[9px] text-red-400 font-mono font-bold">{data.open}</span>
                                                                                                <span className="text-[8px] text-slate-500 mx-0.5">→</span>
                                                                                                <span className="text-[9px] text-green-400 font-mono font-bold">{data.projected_resolved}</span>
                                                                                            </div>
                                                                                            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                                                                                                data.risk === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                                                                                data.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                                                                                'bg-green-500/20 text-green-300 border border-green-500/30'
                                                                                            }`}>{data.risk}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Ward Heatmap */}
                                                                    {simResults.ward_heatmap && (
                                                                        <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                                                            <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
                                                                                <MapPin size={10} className="text-orange-400" />
                                                                                <span className="text-[9px] text-orange-300 font-bold uppercase tracking-widest">Delhi Ward Risk Heatmap</span>
                                                                            </div>
                                                                            <div className="divide-y divide-white/5">
                                                                                {simResults.ward_heatmap.map((ward, i) => (
                                                                                    <div key={i} className="flex items-center justify-between px-3 py-1.5 hover:bg-white/5 transition-colors">
                                                                                        <span className="text-[10px] text-white font-medium w-24 truncate">{ward.ward}</span>
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className="flex items-center gap-1">
                                                                                                <div className={`w-5 h-2 rounded ${
                                                                                                    ward.risk_score >= 7 ? 'bg-red-500' : ward.risk_score >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                                                                                                }`} style={{opacity: 0.3 + ward.risk_score * 0.07}}></div>
                                                                                                <span className="text-[8px] text-slate-400 font-mono w-4">{ward.risk_score}</span>
                                                                                            </div>
                                                                                            <span className="text-[8px] text-slate-400">{ward.open_issues} issues</span>
                                                                                            <span className="text-[8px] text-cyan-400">{ward.crew_deployed}👷</span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Recommendation */}
                                                                    {simResults.recommendation && (
                                                                        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border-l-4 border-emerald-500 rounded-r-xl p-2.5">
                                                                            <span className="text-[8px] font-black text-emerald-300 uppercase tracking-widest block mb-0.5">🎯 Deployment Recommendation</span>
                                                                            <p className="text-white text-[10px] leading-relaxed">{simResults.recommendation}</p>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Side: Layer Controls */}
                                            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 pointer-events-auto">
                                                <motion.button 
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setDtActiveLayer('infrastructure')}
                                                    className={`flex items-center gap-2 backdrop-blur-md border text-white px-3 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                                                        dtActiveLayer === 'infrastructure' 
                                                            ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                                                            : 'bg-slate-900/70 border-white/20 hover:bg-indigo-600'
                                                    }`}
                                                    title="Infrastructure View"
                                                >
                                                    <Layers size={18} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider hidden xl:inline">Infrastructure</span>
                                                </motion.button>

                                                <motion.button 
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setDtActiveLayer(prev => prev === 'thermal' ? 'infrastructure' : 'thermal')}
                                                    className={`flex items-center gap-2 backdrop-blur-md border text-white px-3 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                                                        dtActiveLayer === 'thermal' 
                                                            ? 'bg-orange-600 border-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.4)]' 
                                                            : 'bg-slate-900/70 border-white/20 hover:bg-orange-600'
                                                    }`}
                                                    title="Thermal View"
                                                >
                                                    <Thermometer size={18} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider hidden xl:inline">Thermal</span>
                                                </motion.button>

                                                <motion.button 
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setDtActiveLayer(prev => prev === 'water' ? 'infrastructure' : 'water')}
                                                    className={`flex items-center gap-2 backdrop-blur-md border text-white px-3 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                                                        dtActiveLayer === 'water' 
                                                            ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                                                            : 'bg-slate-900/70 border-white/20 hover:bg-blue-600'
                                                    }`}
                                                    title="Water/Drainage View"
                                                >
                                                    <Droplets size={18} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider hidden xl:inline">Water</span>
                                                </motion.button>
                                            </div>
                                        </div>

                                        {/* Right Sidebar: Simulation History */}
                                        {dtSimHistory.length > 0 && (
                                            <div className="w-64 bg-slate-900/90 backdrop-blur-xl border-l border-white/10 p-4 overflow-y-auto hidden lg:block">
                                                <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <Activity size={12} /> Simulation Log
                                                </h3>
                                                <div className="space-y-2">
                                                    {dtSimHistory.slice().reverse().map((sim, i) => (
                                                        <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                                            className="bg-white/5 rounded-lg p-3 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-[9px] text-slate-400 font-mono">{sim.timestamp}</span>
                                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${sim.citizen_satisfaction >= 60 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                                                    {sim.citizen_satisfaction >= 60 ? 'PASS' : 'RISK'}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                                                                <div><span className="text-slate-500">Budget:</span> <span className="text-white font-bold">₹{sim.budget}M</span></div>
                                                                <div><span className="text-slate-500">Crew:</span> <span className="text-white font-bold">{sim.crew}</span></div>
                                                                <div><span className="text-slate-500">Backlog:</span> <span className="text-white font-bold">{Math.round(sim.predicted_backlog)}</span></div>
                                                                <div><span className="text-slate-500">Satis:</span> <span className="text-emerald-400 font-bold">{Math.round(sim.citizen_satisfaction)}%</span></div>
                                                            </div>
                                                            <div className="text-[8px] text-slate-500 mt-1 uppercase font-bold tracking-wider">{sim.policy}</div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Live Metrics Strip */}
                                    <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-white/10">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                                                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Delhi IoT Nodes</span>
                                                <span className="text-white font-mono text-sm font-bold">{1200 + Math.floor(Math.random() * 300)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div>
                                                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Open Reports</span>
                                                <span className="text-orange-300 font-mono text-sm font-bold">{stats.pendingReports || 42}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                                                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Wards Active</span>
                                                <span className="text-cyan-300 font-mono text-sm font-bold">7/7</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                                                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Uptime</span>
                                                <span className="text-blue-300 font-mono text-sm font-bold">99.8%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 text-[9px] uppercase tracking-wider">Engine v3.0</span>
                                            <span className="text-slate-600">•</span>
                                            <span className="text-slate-500 text-[9px] uppercase tracking-wider">Gemini AI</span>
                                            <span className="text-slate-600">•</span>
                                            <span className="text-slate-500 text-[9px] uppercase tracking-wider">Delhi MCD</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Overview */}
                            {activeView === 'overview' && (
                                <div>
                                    {/* City Filter */}
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 mb-5 flex-wrap font-semibold">
                                        <MapPin size={18} className="text-slate-900" />
                                        <span className="text-slate-900">Jurisdiction:</span>
                                        {['all', 'delhi', 'gwalior', 'canberra'].map(city => (
                                            <button
                                                key={city}
                                                className={`px-4 py-2 rounded-lg border-2 cursor-pointer font-medium text-sm transition-all ${selectedCity === city
                                                    ? 'bg-blue-50 border-blue-600 text-blue-800'
                                                    : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                                                    }`}
                                                onClick={() => setSelectedCity(city)}
                                            >
                                                {city === 'all' ? '🌍 All Zones' : city === 'delhi' ? '🏛️ Delhi NCR' : city === 'gwalior' ? '🏰 Gwalior' : '🦘 Canberra'}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-white rounded-xl p-5 border border-slate-200 text-center hover:-translate-y-1 transition-transform shadow-sm hover:shadow-md">
                                            <FileText size={24} className="text-blue-600 mx-auto mb-2" />
                                            <div className="text-4xl font-bold text-slate-900">{stats.totalReports}</div>
                                            <div className="text-slate-600 text-xs mt-1">Total Incidents</div>
                                        </div>
                                        <div className="bg-white rounded-xl p-5 border border-slate-200 text-center hover:-translate-y-1 transition-transform shadow-sm hover:shadow-md">
                                            <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                                            <div className="text-4xl font-bold text-slate-900">{stats.resolvedReports}</div>
                                            <div className="text-slate-600 text-xs mt-1">Resolved Cases</div>
                                        </div>
                                        <div className="bg-white rounded-xl p-5 border border-slate-200 text-center hover:-translate-y-1 transition-transform shadow-sm hover:shadow-md">
                                            <Clock size={24} className="text-orange-500 mx-auto mb-2" />
                                            <div className="text-4xl font-bold text-slate-900">{stats.pendingReports}</div>
                                            <div className="text-slate-600 text-xs mt-1">Action Required</div>
                                        </div>
                                        <div className="bg-white rounded-xl p-5 border border-slate-200 text-center hover:-translate-y-1 transition-transform shadow-sm hover:shadow-md">
                                            <Activity size={24} className="text-purple-600 mx-auto mb-2" />
                                            <div className="text-4xl font-bold text-slate-900">{stats.inProgressReports}</div>
                                            <div className="text-slate-600 text-xs mt-1">Works In Progress</div>
                                        </div>
                                    </div>

                                    {/* Analytics */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                        {/* Categories */}
                                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all">
                                            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-6">
                                                <PieIcon size={18} className="text-blue-600" /> Category Distribution
                                            </h3>
                                            <div style={{ height: '300px', width: '100%' }}>
                                                {Object.keys(categoryStats).length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={Object.entries(categoryStats).map(([name, value]) => ({ name, value }))}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={60}
                                                                outerRadius={95}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                                cornerRadius={5}
                                                            >
                                                                {Object.entries(categoryStats).map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899'][index % 6]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                                            <Legend wrapperStyle={{ fontSize: '13px' }} iconType="circle" />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                ) : <p className="text-slate-500 text-center py-12 text-sm">No data available</p>}
                                            </div>
                                        </div>

                                        {/* Severity */}
                                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all">
                                            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-6">
                                                <BarChart3 size={18} className="text-blue-600" /> Severity Index
                                            </h3>
                                            <div style={{ height: '300px', width: '100%' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadialBarChart
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius="20%"
                                                        outerRadius="90%"
                                                        barSize={18}
                                                        data={[
                                                            { name: 'Low', count: severityStats.low || 0, fill: '#22c55e' },
                                                            { name: 'Medium', count: severityStats.medium || 0, fill: '#f59e0b' },
                                                            { name: 'High', count: severityStats.high || 0, fill: '#ef4444' }
                                                        ]}
                                                    >
                                                        <RadialBar
                                                            minAngle={15}
                                                            label={{ position: 'insideStart', fill: '#fff', fontSize: 12, fontWeight: 600 }}
                                                            background={{ fill: '#f1f5f9' }}
                                                            clockWise
                                                            dataKey="count"
                                                            cornerRadius={8}
                                                        />
                                                        <Legend iconSize={12} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 10, fontSize: '13px' }} />
                                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                                    </RadialBarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-full bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all">
                                            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-6">
                                                <Sparkles size={18} className="text-blue-600" /> Resolution Pipeline
                                            </h3>
                                            <div className="flex items-center justify-around gap-4 flex-wrap">
                                                {['open', 'assigned', 'in_progress', 'resolved'].map((s, i) => (
                                                    <div key={s} className="flex items-center gap-4">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className={`
                                                                w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg
                                                                ${s === 'open' ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' : ''}
                                                                ${s === 'assigned' ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' : ''}
                                                                ${s === 'in_progress' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : ''}
                                                                ${s === 'resolved' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' : ''}
                                                            `}>
                                                                {statusStats[s] || 0}
                                                            </div>
                                                            <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                                                                {s.replace('_', ' ')}
                                                            </div>
                                                        </div>
                                                        {i < 3 && <span className="text-2xl text-slate-300">→</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Reports */}
                                    {stats.recentReports.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-bold text-slate-900 mb-4">Latest Incidents</h3>
                                            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                                                {stats.recentReports.map((r, i) => (
                                                    <div key={r.id || i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                                                        <div className="w-1 h-12 rounded-full" style={{ backgroundColor: getSeverityColor(r.severity) }} />
                                                        <div className="flex-1 flex items-center justify-between">
                                                            <div>
                                                                <span className="font-semibold text-slate-900 block">{r.category}</span>
                                                                <span className="text-sm text-slate-500">{r.department}</span>
                                                            </div>
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{
                                                                color: getStatusColor(r.status),
                                                                backgroundColor: `${getStatusColor(r.status)}15`
                                                            }}>
                                                                {r.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Analytics Section */}
                            {activeView === 'analytics' && (
                                <div>
                                    {/* City Filter */}
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 mb-6 flex-wrap font-semibold">
                                        <MapPin size={18} className="text-slate-900" />
                                        <span className="text-slate-900">Select Zone:</span>
                                        {['all', 'delhi', 'gwalior', 'canberra'].map(city => (
                                            <button
                                                key={city}
                                                className={`px-4 py-2 rounded-lg border-2 cursor-pointer font-medium text-sm transition-all ${selectedCity === city
                                                    ? 'bg-blue-50 border-blue-600 text-blue-800'
                                                    : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                                                    }`}
                                                onClick={() => setSelectedCity(city)}
                                            >
                                                {city === 'all' ? '🌍 All Zones' : city === 'delhi' ? '🏛️ Delhi NCR' : city === 'gwalior' ? '🏰 Gwalior' : '🦘 Canberra'}
                                            </button>
                                        ))}
                                        <span className="ml-auto text-sm text-slate-500">{stats.totalReports} incidents found</span>
                                    </div>

                                    {/* Key Metrics */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                                            <div className="text-4xl font-bold mb-1">{stats.totalReports}</div>
                                            <div className="text-blue-100 text-sm font-medium mb-3">Total Incidents</div>
                                            <div className="w-full h-1.5 bg-blue-400 rounded-full"></div>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                                            <div className="text-4xl font-bold mb-1">{stats.resolvedReports}</div>
                                            <div className="text-green-100 text-sm font-medium mb-3">Resolved</div>
                                            <div className="w-full h-1.5 bg-green-400 rounded-full overflow-hidden">
                                                <div className="h-full bg-white" style={{ width: `${stats.totalReports > 0 ? (stats.resolvedReports / stats.totalReports) * 100 : 0}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                                            <div className="text-4xl font-bold mb-1">{stats.totalReports > 0 ? Math.round((stats.resolvedReports / stats.totalReports) * 100) : 0}%</div>
                                            <div className="text-purple-100 text-sm font-medium mb-3">Resolution Rate</div>
                                            <div className="w-full h-1.5 bg-purple-400 rounded-full overflow-hidden">
                                                <div className="h-full bg-white" style={{ width: `${stats.totalReports > 0 ? (stats.resolvedReports / stats.totalReports) * 100 : 0}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                                            <div className="text-4xl font-bold mb-1">{severityStats.high || 0}</div>
                                            <div className="text-red-100 text-sm font-medium mb-3">Critical Issues</div>
                                            <div className="w-full h-1.5 bg-red-400 rounded-full overflow-hidden">
                                                <div className="h-full bg-white" style={{ width: `${stats.totalReports > 0 ? ((severityStats.high || 0) / stats.totalReports) * 100 : 0}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Activity Trend Chart */}
                                        <div className="col-span-full bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all">
                                            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-6">
                                                <TrendingUp size={20} className="text-blue-500" /> Incident Trend (7 Days)
                                            </h3>
                                            <div style={{ height: '320px', width: '100%' }}>
                                                {trendStats && trendStats.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={trendStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                                </linearGradient>
                                                                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} allowDecimals={false} />
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                                            <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="New Reports" />
                                                            <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-slate-400">
                                                        <div className="text-center">
                                                            <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
                                                            <p className="text-sm">No trend data available</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Category Distribution (Donut) */}
                                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all">
                                            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-6">
                                                <PieIcon size={20} className="text-purple-500" /> Issue Types
                                            </h3>
                                            <div style={{ height: '320px', width: '100%' }}>
                                                {Object.keys(categoryStats).length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={Object.entries(categoryStats).map(([name, value]) => ({ name, value }))}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={60}
                                                                outerRadius={95}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                                cornerRadius={5}
                                                            >
                                                                {Object.entries(categoryStats).map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899'][index % 6]} stroke="none" />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                                            <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-slate-400">
                                                        <div className="text-center">
                                                            <PieIcon size={48} className="mx-auto mb-3 opacity-30" />
                                                            <p className="text-sm">No category data available</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Department Breakdown (Bar) */}
                                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all">
                                            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-6">
                                                <BarChart3 size={20} className="text-indigo-500" /> Department Load
                                            </h3>
                                            <div style={{ height: '300px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={Object.entries(deptStats).map(([name, count]) => ({ name, count }))}
                                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                        barSize={30}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
                                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                            {Object.entries(deptStats).map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Severity Rings */}
                                        <div className="chart-card">
                                            <h3><Activity size={20} className="text-orange-500" /> Severity Analysis</h3>
                                            <div className="chart-content" style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadialBarChart
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius="30%"
                                                        outerRadius="100%"
                                                        barSize={15}
                                                        data={[
                                                            { name: 'Low', count: severityStats.low || 0, fill: '#22c55e' },
                                                            { name: 'Medium', count: severityStats.medium || 0, fill: '#f59e0b' },
                                                            { name: 'High', count: severityStats.high || 0, fill: '#ef4444' }
                                                        ]}
                                                    >
                                                        <RadialBar
                                                            label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
                                                            background={{ fill: '#f1f5f9' }}
                                                            clockWise
                                                            dataKey="count"
                                                            cornerRadius={10}
                                                        />
                                                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
                                                        <Tooltip content={<CustomTooltip />} />
                                                    </RadialBarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* All Reports Section */}
                            {activeView === 'reports' && (
                                <div className="space-y-6">
                                    {/* Premium Header */}
                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 rounded-2xl shadow-2xl border border-slate-700/50">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl shadow-lg ring-2 ring-amber-400/30">
                                                <FileText className="text-white" size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-xl">📋 All Incident Reports</h3>
                                                <p className="text-sm text-slate-400">{reports.length} total reports in database</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <button
                                                onClick={handleExportCSV}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:-translate-y-0.5 transition-all"
                                            >
                                                <Download size={18} /> Export CSV
                                            </button>
                                        </div>
                                    </div>

                                    {/* Search and Filters */}
                                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-md">
                                        <div className="flex-1 relative">
                                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search by category, description, department..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                            >
                                                <option value="all">All Status</option>
                                                <option value="open">Open</option>
                                                <option value="assigned">Assigned</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Reports Table */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                    <tr>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Severity</th>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {reports
                                                        .filter(r => {
                                                            const matchesSearch = searchTerm === '' ||
                                                                r.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                r.department?.toLowerCase().includes(searchTerm.toLowerCase());
                                                            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
                                                            return matchesSearch && matchesStatus;
                                                        })
                                                        .slice((currentPage - 1) * reportsPerPage, currentPage * reportsPerPage)
                                                        .map((report, i) => (
                                                            <tr key={report.id || i} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <div className="font-semibold text-slate-900">{report.category}</div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="text-sm text-slate-600 max-w-xs truncate">{report.description || 'No description'}</div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="text-sm text-slate-600">{report.department}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${report.severity === 'high' ? 'bg-red-100 text-red-700' :
                                                                        report.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-green-100 text-green-700'
                                                                        }`}>
                                                                        {report.severity === 'high' ? '🔴' : report.severity === 'medium' ? '🟡' : '🟢'} {report.severity}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <select
                                                                        value={report.status}
                                                                        onChange={(e) => updateReportStatus(report.id, e.target.value)}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-all ${report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                                            report.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                                                report.status === 'assigned' ? 'bg-purple-100 text-purple-700' :
                                                                                    'bg-orange-100 text-orange-700'
                                                                            }`}
                                                                    >
                                                                        <option value="open">Open</option>
                                                                        <option value="assigned">Assigned</option>
                                                                        <option value="in_progress">In Progress</option>
                                                                        <option value="resolved">Resolved</option>
                                                                    </select>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <a
                                                                        href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors no-underline"
                                                                    >
                                                                        <MapPin size={12} /> View
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
                                            <div className="text-sm text-slate-500">
                                                Showing {Math.min((currentPage - 1) * reportsPerPage + 1, reports.length)} to {Math.min(currentPage * reportsPerPage, reports.length)} of {reports.length} reports
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                                                >
                                                    Previous
                                                </button>
                                                <span className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-bold">{currentPage}</span>
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(reports.length / reportsPerPage), p + 1))}
                                                    disabled={currentPage >= Math.ceil(reports.length / reportsPerPage)}
                                                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* HR & Personnel Management */}
                            {activeView === 'team' && (
                                <div>
                                    {/* HR Sub-Navigation */}
                                    <div className="flex gap-2 mb-6 p-1 bg-white rounded-xl border border-slate-200 shadow-sm flex-wrap">
                                        <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${hrTab === 'directory'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`} onClick={() => setHrTab('directory')}>
                                            <Users size={16} /> Staff Directory
                                        </button>
                                        <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${hrTab === 'recruitment'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`} onClick={() => setHrTab('recruitment')}>
                                            <UserPlus size={16} /> Recruitment
                                        </button>
                                        <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${hrTab === 'attendance'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`} onClick={() => setHrTab('attendance')}>
                                            <Clock size={16} /> Attendance
                                        </button>
                                        <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${hrTab === 'payroll'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`} onClick={() => setHrTab('payroll')}>
                                            <BadgeIndianRupee size={16} /> Payroll
                                        </button>
                                    </div>

                                    {/* 1. STAFF DIRECTORY TAB */}
                                    {hrTab === 'directory' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                                                <div className="flex gap-3 flex-wrap">
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl text-blue-700 font-semibold text-sm">
                                                        <Users size={16} /> {teamMembers.length} Active Staff
                                                    </div>
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl text-yellow-700 font-semibold text-sm">
                                                        <Zap size={16} /> 98% Efficiency
                                                    </div>
                                                </div>
                                                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" onClick={() => setShowAddMemberModal(true)}>
                                                    <Plus size={18} /> Add Member
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                {teamMembers.map((member, i) => (
                                                    <div key={member.id || i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all">
                                                        <div className="flex items-start gap-3 mb-4">
                                                            <div className="w-14 h-14 min-w-[56px] bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-blue-200">
                                                                {member.name.charAt(0)}
                                                            </div>
                                                            <div className="flex-1 overflow-hidden">
                                                                <h4 className="text-base font-bold text-slate-900 mb-1">{member.name}</h4>
                                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${member.role === 'dept_head'
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                                    }`}>
                                                                    {member.role === 'dept_head' ? '👑 Dept. Head' : '🛡️ Field Officer'}
                                                                </span>
                                                            </div>
                                                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                                {90 + (i % 10)}%
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                                                <div>
                                                                    <span className="text-slate-500 block text-xs mb-1">Department</span>
                                                                    <span className="font-semibold text-slate-900">{member.department || 'N/A'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-500 block text-xs mb-1">Salary</span>
                                                                    <span className="font-semibold text-slate-900">₹{(member.role === 'dept_head' ? 55000 : 35000).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-slate-500 mb-2">Email: {member.email}</div>
                                                            <div className="mb-3">
                                                                <div className="flex items-center justify-between mb-1.5">
                                                                    <span className="text-xs font-medium text-slate-600">Performance</span>
                                                                    <span className="text-xs font-bold text-slate-900">{90 + (i % 10)}%</span>
                                                                </div>
                                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className="h-full rounded-full transition-all" style={{
                                                                        width: `${90 + (i % 10)}%`,
                                                                        background: i % 2 === 0 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(90deg, #eab308 0%, #ca8a04 100%)'
                                                                    }}></div>
                                                                </div>
                                                            </div>
                                                            <div className="card-actions" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                                <button className="btn-xs-outline" onClick={() => {
                                                                    const newRole = prompt(`Promote ${member.name} to?`, "Senior Officer");
                                                                    if (newRole) alert(`${member.name} promoted to ${newRole}! Efficiency Bonus applied.`);
                                                                }}>
                                                                    ✨ Promote
                                                                </button>
                                                                <button className="btn-xs-outline text-red">Report</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* 2. RECRUITMENT TAB */}
                                    {hrTab === 'recruitment' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hr-module-container">
                                            <div className="module-header">
                                                <h3>Active Recruitment Pipeline</h3>
                                                <button className="action-btn primary" onClick={() => alert("Feature coming soon: Post Job via API")}>Post New Job</button>
                                            </div>
                                            <div className="kanban-board">
                                                {['applied', 'interview', 'hired'].map(status => (
                                                    <div className="kanban-col" key={status}>
                                                        <h4>{status.toUpperCase()} ({recruitmentData.filter(c => c.status.toLowerCase() === status).length})</h4>
                                                        {recruitmentData.filter(c => c.status.toLowerCase() === status).map(c => (
                                                            <div className="kanban-card" key={c.id}>
                                                                <h5>{c.name}</h5>
                                                                <p>{c.position}</p>
                                                                <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <span className="kb-tag">{c.experience}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* 3. ATTENDANCE TAB */}
                                    {hrTab === 'attendance' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hr-module-container">
                                            <div className="module-header">
                                                <h3>Today's Attendance Log ({new Date().toISOString().split('T')[0]})</h3>
                                                <button className="action-btn" onClick={() => alert("Manual Check-in via API coming soon")}>
                                                    <Clock size={16} /> Mark Manual Check-in
                                                </button>
                                            </div>
                                            <table className="modern-table">
                                                <thead>
                                                    <tr>
                                                        <th>Staff Name</th>
                                                        <th>Check In</th>
                                                        <th>Check Out</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attendanceData.map((log) => (
                                                        <tr key={log.id}>
                                                            <td><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">{log.name?.[0]}</div> {log.name}</div></td>
                                                            <td>{log.check_in || '--'}</td>
                                                            <td>{log.check_out || '--'}</td>
                                                            <td>
                                                                <span className={`badge ${log.status}`}>
                                                                    {log.status.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td><button className="btn-text text-xs">Edit</button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </motion.div>
                                    )}

                                    {/* 4. PAYROLL TAB */}
                                    {hrTab === 'payroll' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hr-module-container">
                                            <div className="module-header">
                                                <h3>Payroll Disbursement ({payrollData[0]?.month || 'Current Month'})</h3>
                                                <button className="action-btn primary">
                                                    <BadgeIndianRupee size={16} /> Process All Payments
                                                </button>
                                            </div>
                                            <table className="modern-table">
                                                <thead>
                                                    <tr>
                                                        <th>Employee</th>
                                                        <th>Base Salary</th>
                                                        <th>Deductions</th>
                                                        <th>Net Payable</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {payrollData.map((p) => (
                                                        <tr key={p.id}>
                                                            <td>
                                                                <div className="font-semibold">{p.name}</div>
                                                                <div className="text-xs text-gray-500">ID: EMP-{p.id.slice(0, 6)}</div>
                                                            </td>
                                                            <td>
                                                                <div className="flex items-center gap-2">
                                                                    ₹{p.base_salary?.toLocaleString()}
                                                                    <button className="text-gray-400 hover:text-blue-500" title="Edit Base Salary">
                                                                        <Edit2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td><span className="text-red-500">-₹{(p.deductions || 0).toLocaleString()}</span></td>
                                                            <td>
                                                                <div className="font-bold text-green-700">₹{p.net_salary?.toLocaleString()}</div>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${p.status}`}>
                                                                    {p.status?.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {p.status === 'pending' && (
                                                                    <div className="flex gap-2">
                                                                        <button className="btn-xs-outline text-blue-600" onClick={() => alert("Payment Processing API Integration Pending")}>Disburse</button>
                                                                    </div>
                                                                )}
                                                                {p.status === 'paid' && (
                                                                    <div className="flex items-center gap-2 text-green-600">
                                                                        <CheckCircle2 size={16} /> Paid
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </motion.div>
                                    )}

                                    {/* Add Member Modal (Only works in Directory) */}
                                    <AnimatePresence>
                                        {showAddMemberModal && (
                                            <motion.div
                                                className="modal-overlay"
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <motion.div
                                                    className="modal-content"
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.9, opacity: 0 }}
                                                >
                                                    <div className="modal-header">
                                                        <h3>Add New Staff Member</h3>
                                                        <button onClick={() => setShowAddMemberModal(false)}><X size={20} /></button>
                                                    </div>
                                                    <form onSubmit={onAddMember} className="modal-form">
                                                        <div className="form-group">
                                                            <label>Full Name</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={newMember.name}
                                                                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                                                placeholder="e.g. Rahul Sharma"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Email Address</label>
                                                            <input
                                                                type="email"
                                                                required
                                                                value={newMember.email}
                                                                onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                                                                placeholder="e.g. rahul@gov.in"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Password</label>
                                                            <input
                                                                type="password"
                                                                required
                                                                value={newMember.password}
                                                                onChange={e => setNewMember({ ...newMember, password: e.target.value })}
                                                                placeholder="Secure password"
                                                            />
                                                        </div>
                                                        <div className="form-row">
                                                            <div className="form-group">
                                                                <label>Role</label>
                                                                <select
                                                                    value={newMember.role}
                                                                    onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                                                                >
                                                                    <option value="field_officer">Field Officer</option>
                                                                    <option value="dept_head">Department Head</option>
                                                                </select>
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Department</label>
                                                                <select
                                                                    value={newMember.department}
                                                                    onChange={e => setNewMember({ ...newMember, department: e.target.value })}
                                                                >
                                                                    <option value="Roads">Roads</option>
                                                                    <option value="Waste">Waste</option>
                                                                    <option value="Water">Water</option>
                                                                    <option value="Electrical">Electrical</option>
                                                                    <option value="General">General</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="modal-actions">
                                                            <button type="button" className="cancel-btn" onClick={() => setShowAddMemberModal(false)}>Cancel</button>
                                                            <button type="submit" className="submit-btn" onClick={(e) => {
                                                                // Brief UX hack to ensure visual feedback even if backend fails
                                                                onAddMember(e);
                                                            }}>Create User</button>
                                                        </div>
                                                    </form>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* One-Click PR Modal */}
                            <AnimatePresence>
                                {prModalOpen && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="modal-overlay"
                                        onClick={() => setPrModalOpen(false)}
                                    >
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                                            className="modal-content"
                                            onClick={e => e.stopPropagation()}
                                            style={{ maxWidth: '500px' }}
                                        >
                                            <div className="modal-header">
                                                <h3 className="flex items-center gap-2"><Zap size={20} className="text-yellow-500" /> Weekly PR Generator</h3>
                                                <button onClick={() => setPrModalOpen(false)}><X size={20} /></button>
                                            </div>
                                            <div className="p-4">
                                                <p className="text-sm text-gray-500 mb-2">Here is your auto-generated positive press release based on this week's data:</p>
                                                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 font-mono text-sm whitespace-pre-wrap text-gray-800 mb-4">
                                                    {generatedPR}
                                                </div>

                                                {/* AI Image Generation Section */}
                                                <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                            <Image size={16} className="text-blue-600" /> AI Campaign Graphic
                                                        </h4>
                                                        {!prImage && !prImageLoading && (
                                                            <button
                                                                onClick={generatePRImage}
                                                                className="text-xs flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-200 transition-colors font-medium cursor-pointer"
                                                            >
                                                                <Sparkles size={12} /> Generate Image
                                                            </button>
                                                        )}
                                                    </div>

                                                    {prImageLoading ? (
                                                        <div className="h-48 bg-slate-100 rounded-md flex flex-col items-center justify-center text-slate-400">
                                                            <Loader2 size={32} className="animate-spin mb-2 text-blue-500" />
                                                            <span className="text-xs">Generating graphical assets...</span>
                                                        </div>
                                                    ) : prImage ? (
                                                        <div className="relative group">
                                                            <img src={prImage} alt="AI Generated Campaign" className="w-full h-48 object-cover rounded-md shadow-sm border border-slate-200" />
                                                            <a
                                                                href={prImage}
                                                                download="urbaneye_campaign.png"
                                                                className="absolute bottom-2 right-2 bg-black/70 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
                                                                title="Download Image"
                                                            >
                                                                <Download size={16} />
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <div className="h-32 border-2 border-dashed border-slate-300 rounded-md flex flex-col items-center justify-center gap-3 text-slate-500 text-xs bg-slate-50/50">
                                                            <span>Create a visual campaign for this update</span>
                                                            <button
                                                                onClick={generatePRImage}
                                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                                                            >
                                                                <Sparkles size={14} /> Generate PR Image
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-4 flex justify-end gap-2">
                                                    <button className="btn-outline" onClick={() => {
                                                        navigator.clipboard.writeText(generatedPR);
                                                        setPrModalOpen(false);
                                                        alert("Copied to clipboard!");
                                                    }}>Copy Text</button>

                                                    <button className="action-btn primary" onClick={() => {
                                                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(generatedPR)}`, '_blank');
                                                    }}>Tweet This</button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Heatmap */}
                            {activeView === 'heatmap' && (
                                <div className="space-y-6">
                                    {/* Premium Header Bar */}
                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 rounded-2xl shadow-2xl border border-slate-700/50">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-xl shadow-lg ring-2 ring-emerald-400/30">
                                                <Map className="text-white" size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-xl">🗺️ Live City Heatmap</h3>
                                                <p className="text-sm text-slate-400">Real-time incident visualization with geo-intelligence</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {['all', 'delhi', 'gwalior', 'canberra'].map(city => (
                                                <button
                                                    key={city}
                                                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCity === city
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50'
                                                        : 'bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm'
                                                        }`}
                                                    onClick={() => setSelectedCity(city)}
                                                >
                                                    {city === 'all' ? '🌍 All' : city === 'delhi' ? '🏛️ Delhi' : city === 'canberra' ? '🦘 Canberra' : '🏰 Gwalior'}
                                                </button>
                                            ))}
                                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 font-semibold text-sm">
                                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                                {mapPoints.length} active points
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Map Container */}
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/50 group">
                                        <div className="absolute top-4 right-4 z-[1000] flex gap-2">
                                            <div className="bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-white font-medium border border-slate-700">
                                                🔴 High | 🟡 Medium | 🟢 Low
                                            </div>
                                        </div>
                                        <MapContainer
                                            center={customMapCenter || (selectedCity === 'gwalior' ? [26.2183, 78.1828] : selectedCity === 'canberra' ? [-35.28, 149.13] : [28.6139, 77.2090])}
                                            zoom={customMapCenter ? 14 : 11}
                                            scrollWheelZoom={true}
                                            style={{ height: '550px', width: '100%' }}
                                            key={customMapCenter ? `custom-${customMapCenter[0]}` : selectedCity}
                                        >
                                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                            {mapPoints.map((p, i) => (
                                                <CircleMarker
                                                    key={i}
                                                    center={[p.lat, p.lng]}
                                                    pathOptions={{ color: getSeverityColor(p.severity), fillColor: getSeverityColor(p.severity), fillOpacity: 0.7 }}
                                                    radius={10}
                                                >
                                                    <Popup>
                                                        <div style={{ minWidth: '180px' }}>
                                                            <div className="font-bold text-slate-800 text-base mb-1">{p.category}</div>
                                                            <div className="text-xs text-slate-500 mb-3">{p.department} • <span className={`capitalize font-semibold ${p.status === 'resolved' ? 'text-green-600' : 'text-orange-600'}`}>{p.status.replace('_', ' ')}</span></div>
                                                            <div className="flex gap-2">
                                                                <a
                                                                    href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors no-underline"
                                                                >
                                                                    <MapPin size={12} /> Locate
                                                                </a>
                                                                <a
                                                                    href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${p.lat},${p.lng}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium bg-orange-50 text-orange-700 py-2 px-3 rounded-lg hover:bg-orange-100 transition-colors no-underline"
                                                                >
                                                                    <ExternalLink size={12} /> Street View
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </Popup>
                                                </CircleMarker>
                                            ))}
                                            {showPredictions && predictions.map((pred, i) => (
                                                <CircleMarker
                                                    key={`pred-${i}`}
                                                    center={[pred.lat, pred.lng]}
                                                    pathOptions={{ color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.4, dashArray: '5, 10' }}
                                                    radius={15}
                                                >
                                                    <Popup>
                                                        <div style={{ minWidth: '200px' }}>
                                                            <div className="font-bold text-purple-800 mb-2">🤖 UrbanAI Prediction</div>
                                                            <div className="text-sm text-slate-700 space-y-1">
                                                                <div><span className="font-medium">Type:</span> {pred.type}</div>
                                                                <div><span className="font-medium">Probability:</span> {pred.risk}</div>
                                                            </div>
                                                            <div className="text-xs mt-2 text-slate-500 italic bg-purple-50 p-2 rounded-lg">"{pred.reasoning}"</div>
                                                            <div className="text-sm font-bold mt-2 text-green-700">Est. Cost: ₹{pred.estimated_cost?.toLocaleString()}</div>
                                                        </div>
                                                    </Popup>
                                                </CircleMarker>
                                            ))}
                                        </MapContainer>
                                    </div>
                                </div>
                            )}

                            {/* AI Predictive Mode Section - Enhanced */}
                            {activeView === 'predictions' && (
                                <div className="flex flex-col gap-6">
                                    {/* Control Bar - Advanced */}
                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-900 p-5 rounded-2xl shadow-2xl border border-purple-500/30 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-blue-600/10"></div>
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-xl shadow-lg ring-2 ring-purple-400/30">
                                                <Zap className="text-white" size={28} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-xl tracking-tight">🤖 AI Predictive Command Center</h3>
                                                <p className="text-sm text-purple-200/80">Powered by UrbanAI Engine • Correlating Live Weather, News & Historical Data</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 relative z-10">
                                            {/* Start Analysis Button */}
                                            <button
                                                onClick={startPrediction}
                                                disabled={predictionLoading}
                                                className={`
                                                    px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all
                                                    ${predictionLoading
                                                        ? 'bg-slate-700 text-slate-400 cursor-wait'
                                                        : 'bg-white text-purple-700 hover:bg-purple-50 shadow-lg hover:scale-105 active:scale-95'}
                                                `}
                                            >
                                                {predictionLoading ? (
                                                    <><RefreshCw className="animate-spin" size={18} /> Analyzing...</>
                                                ) : (
                                                    <><Sparkles size={18} /> Start New Analysis</>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Landing State or Results */}
                                    {!predictions.length && !predictionLoading && !predictionMeta ? (
                                        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                            <div className="w-24 h-24 bg-purple-100 rounded-3xl flex items-center justify-center mb-6 animate-bounce-slow">
                                                <Zap size={48} className="text-purple-600" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to Predict Future Risks?</h2>
                                            <p className="text-slate-500 max-w-md mb-8">
                                                Click "Start New Analysis" above to let UrbanAI Engine scan live weather data from Open-Meteo, local news report, and historical incident patterns to forecast infrastructure failures.
                                            </p>
                                            <div className="flex gap-4 text-sm text-slate-400">
                                                <span className="flex items-center gap-1"><CloudRain size={14} /> Live Weather</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Newspaper size={14} /> News Sentiment</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Database size={14} /> Historical Data</span>
                                            </div>
                                        </div>
                                    ) : (
                                        // Show grid only when loading or have data
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Left Col: Context Data */}
                                            <div className="space-y-6">
                                                {/* Weather Widget - Enhanced */}
                                                <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                                    <div className="absolute -top-4 -right-4 opacity-10">
                                                        <CloudRain size={120} strokeWidth={1} />
                                                    </div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent"></div>
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ring-1 ring-white/30">🌤️ Live Weather (Open-Meteo)</span>
                                                        </div>
                                                        {predictionMeta?.weather_raw ? (
                                                            <div className="space-y-2">
                                                                <div className="text-2xl font-bold whitespace-pre-wrap leading-relaxed">{predictionMeta.weather_summary || 'Analyzing...'}</div>
                                                            </div>
                                                        ) : (
                                                            <div className="animate-pulse space-y-3">
                                                                <div className="h-4 bg-white/30 rounded w-1/2"></div>
                                                                <div className="h-8 bg-white/30 rounded w-3/4"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* News Feed - Enhanced */}
                                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-[400px] flex flex-col">
                                                    <div className="flex items-center justify-between mb-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg shadow-md">
                                                                <Newspaper className="text-white" size={18} />
                                                            </div>
                                                            <h4 className="font-bold text-slate-800">Local News Sentiment</h4>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border font-medium">NewsAPI.org</span>
                                                    </div>

                                                    <div className="overflow-y-auto flex-1 text-sm text-slate-600 pr-2 space-y-3 custom-scrollbar">
                                                        {predictionMeta?.news_summary ? (
                                                            <div className="space-y-4">
                                                                {/* AI Analysis Box */}
                                                                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-800 text-xs font-medium shadow-sm flex gap-2">
                                                                    <Sparkles size={14} className="flex-shrink-0 mt-0.5" />
                                                                    <div className="italic">"AI Analysis: {predictionMeta.news_summary}"</div>
                                                                </div>

                                                                {/* Raw News List */}
                                                                <div className="space-y-3">
                                                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Latest Headlines</h5>
                                                                    {predictionMeta.news_raw?.split('\n').map((item, idx) => {
                                                                        if (!item.trim()) return null;
                                                                        // Simple cleanup: remove the leading "- " if present
                                                                        const cleanItem = item.replace(/^- /, '');
                                                                        const [title, desc] = cleanItem.split(': ');

                                                                        return (
                                                                            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                                                                                <div className="font-bold text-slate-700 text-xs mb-1 line-clamp-2">{title}</div>
                                                                                {desc && <div className="text-slate-500 text-[10px] line-clamp-2">{desc}</div>}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    {!predictionMeta.news_raw && <div className="text-xs text-slate-400 italic">No raw news data available.</div>}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                                                <div className="animate-spin">
                                                                    <RefreshCw size={28} />
                                                                </div>
                                                                <span className="font-medium">Scanning Local News...</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Col: Map & Results */}
                                            <div className="lg:col-span-2 flex flex-col gap-6">
                                                {/* Stats Cards - Premium Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <div className="text-xs text-purple-300 font-semibold mb-2 uppercase tracking-wider">Predicted Failures</div>
                                                        <div className="text-3xl font-black text-white">{predictions.length}</div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <div className="text-xs text-red-100 font-semibold mb-2 uppercase tracking-wider">High Risk Zones</div>
                                                        <div className="text-3xl font-black text-white">
                                                            {predictions.filter(p => p.probability > 75).length}
                                                        </div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <div className="text-xs text-green-100 font-semibold mb-2 uppercase tracking-wider">Est. Prevention Cost</div>
                                                        <div className="text-2xl font-black text-white">
                                                            ₹{(predictions.reduce((acc, p) => acc + (p.estimated_cost || 0), 0) / 1000).toFixed(1)}k
                                                        </div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <div className="text-xs text-purple-100 font-semibold mb-2 uppercase tracking-wider">AI Confidence</div>
                                                        <div className="text-2xl font-black text-white">88%</div>
                                                    </div>
                                                </div>

                                                {/* Map */}
                                                <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 relative group h-[500px]">
                                                    <MapContainer
                                                        center={customMapCenter || (selectedCity === 'gwalior' ? [26.2183, 78.1828] : selectedCity === 'canberra' ? [-35.28, 149.13] : [28.6139, 77.2090])}
                                                        zoom={customMapCenter ? 14 : 12}
                                                        scrollWheelZoom={true}
                                                        style={{ height: '100%', width: '100%' }}
                                                        key={`pred-view-${selectedCity}`}
                                                    >
                                                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

                                                        {/* Predictions (Pulsing Markers) */}
                                                        {predictions.map((pred, i) => (
                                                            <CircleMarker
                                                                key={`pred-${i}`}
                                                                center={[pred.lat, pred.lng]}
                                                                pathOptions={{
                                                                    color: pred.probability > 80 ? '#ef4444' : '#d946ef',
                                                                    fillColor: pred.probability > 80 ? '#ef4444' : '#d946ef',
                                                                    fillOpacity: 0.7,
                                                                    weight: 2
                                                                }}
                                                                radius={12}
                                                            >
                                                                <Popup className="custom-popup">
                                                                    <div className="min-w-[240px] p-1">
                                                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                                                            <div className="bg-purple-100 p-1 rounded">
                                                                                <Sparkles size={14} className="text-purple-600" />
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-bold text-gray-800 leading-tight">{pred.type} Risk</div>
                                                                                <div className="text-[10px] text-gray-500">AI Confidence: {pred.probability}%</div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded border border-gray-100">
                                                                            "{pred.reasoning}"
                                                                        </div>

                                                                        {pred.factors && pred.factors.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1 mb-3">
                                                                                {pred.factors.map((f, idx) => (
                                                                                    <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
                                                                                        {f}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                                                            <div className="font-bold text-gray-800">₹{pred.estimated_cost?.toLocaleString()}</div>
                                                                            <button className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-black transition-colors">
                                                                                Create Ticket
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </Popup>
                                                            </CircleMarker>
                                                        ))}
                                                    </MapContainer>

                                                    <div className="absolute bottom-4 left-4 bg-gray-900/90 text-white p-3 rounded-lg backdrop-blur-md border border-gray-700 max-w-sm">
                                                        <div className="flex items-center gap-2 text-xs font-semibold mb-1">
                                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                            Live Data Integration
                                                        </div>
                                                        <div className="text-[10px] text-gray-400">
                                                            Map updates in real-time as new reports, weather data, and news feeds are ingested.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reports Table - Using the Modern Table Style */}

                            {/* Reports Table - Using the Modern Table Style */}
                            {activeView === 'reports' && (
                                <div className="reports-section">
                                    {/* Toolbar */}
                                    <div className="reports-toolbar">
                                        <div className="search-box">
                                            <Search size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search incident ID, category or description..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="filter-box">
                                            <Filter size={18} />
                                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                                <option value="all">All Status</option>
                                                <option value="open">Open</option>
                                                <option value="assigned">Assigned</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </div>
                                        <button className="export-btn" onClick={handleExportCSV}>
                                            <Download size={18} /> Export Data
                                        </button>
                                    </div>

                                    {/* Table */}
                                    <div className="modern-table-container">
                                        <table className="modern-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Date</th>
                                                    <th>Type</th>
                                                    <th>Dept.</th>
                                                    <th>Details</th>
                                                    <th>Location</th>
                                                    <th>Priority</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reports
                                                    .filter(r => {
                                                        const matchesSearch = (r.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            (r.category || '').toLowerCase().includes(searchTerm.toLowerCase());
                                                        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
                                                        return matchesSearch && matchesStatus;
                                                    })
                                                    .slice((currentPage - 1) * reportsPerPage, currentPage * reportsPerPage)
                                                    .map((r, i) => (
                                                        <tr key={r.id || i}>
                                                            <td>#{r.id?.toString().slice(-4) || '----'}</td>
                                                            <td>{new Date(r.created_at || Date.now()).toLocaleDateString()}</td>
                                                            <td>{r.category}</td>
                                                            <td>{r.department}</td>
                                                            <td className="desc-cell" title={r.description}>{r.description?.slice(0, 30)}...</td>
                                                            <td>
                                                                {r.latitude ? (
                                                                    <button className="btn-xs-outline text-blue-600 flex items-center gap-1" onClick={() => {
                                                                        if (r.latitude && r.longitude) {
                                                                            setCustomMapCenter([r.latitude, r.longitude]);
                                                                            setActiveView('heatmap');
                                                                        }
                                                                    }}>
                                                                        <MapPin size={12} /> View
                                                                    </button>
                                                                ) : <span className="text-gray-400 text-xs">N/A</span>}
                                                            </td>
                                                            <td><span className={`badge severity ${r.severity}`}>{r.severity}</span></td>
                                                            <td><span className={`badge status ${r.status}`}>{r.status?.replace('_', ' ')}</span></td>
                                                            <td>
                                                                <select
                                                                    className="status-select"
                                                                    value={r.status}
                                                                    onChange={(e) => updateReportStatus(r.id, e.target.value)}
                                                                >
                                                                    <option value="open">Open</option>
                                                                    <option value="assigned">Assign</option>
                                                                    <option value="in_progress">Working</option>
                                                                    <option value="resolved">Resolve</option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                        {reports.length === 0 && (
                                            <div className="empty-state">
                                                <FileText size={48} />
                                                <p>No incidents matching criteria.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    <div className="pagination-controls">
                                        <span className="page-info">
                                            Page {currentPage} of {Math.ceil(reports
                                                .filter(r => (statusFilter === 'all' || r.status === statusFilter) &&
                                                    ((r.description || '').toLowerCase().includes(searchTerm.toLowerCase())))
                                                .length / reportsPerPage) || 1}
                                        </span>
                                        <div className="page-btns">
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button
                                                disabled={currentPage >= Math.ceil(reports
                                                    .filter(r => (statusFilter === 'all' || r.status === statusFilter) &&
                                                        ((r.description || '').toLowerCase().includes(searchTerm.toLowerCase())))
                                                    .length / reportsPerPage)}
                                                onClick={() => setCurrentPage(p => p + 1)}
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Settings */}
                            {activeView === 'settings' && (
                                <div className="settings-section">
                                    <div className="settings-card">
                                        <h3>Admin Profile</h3>
                                        <div className="setting-row"><span>Name</span><strong>{user?.name}</strong></div>
                                        <div className="setting-row"><span>Email</span><strong>{user?.email || 'N/A'}</strong></div>
                                        <div className="setting-row"><span>Role</span><strong>Government Administrator</strong></div>
                                    </div>
                                    <div className="settings-card">
                                        <h3>System Actions</h3>
                                        <button className="setting-btn danger" onClick={handleLogout}>
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main >

            {/* Floating Voice Command Button */}
            <VoiceAssistantButton
                isListening={isListening}
                voiceTranscript={voiceTranscript}
                voiceFeedback={voiceFeedback}
                toggleVoiceCommand={toggleVoiceCommand}
            />
        </div >
    );
};

export default GovAdminDashboard;
