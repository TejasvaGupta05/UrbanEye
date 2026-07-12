import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Building, Users, ClipboardList, Activity, MapIcon, FileText, Settings, Briefcase, Heart, Plus, Map, Trophy, Bell, TrendingUp } from 'lucide-react';
import TaskList from '../components/Dashboard/TaskList';
import CivilianDashboard from '../components/Dashboard/CivilianDashboard';
import SuperAdminDashboard from '../components/Dashboard/SuperAdminDashboard';
import GigWorkerDashboard from '../components/Dashboard/GigWorkerDashboard';
import SocialWorkerDashboard from '../components/Dashboard/SocialWorkerDashboard';
import 'leaflet/dist/leaflet.css';
import '../components/Dashboard/TaskList.css';
import '../styles/Dashboard.css';


// Comprehensive mock data for Delhi map - realistic distribution
const MOCK_POINTS = [
    // Central Delhi Cluster
    { lat: 28.6139, lng: 77.2090, intensity: 1.0, count: 8, dept: 'roads', category: 'Pothole', area: 'Connaught Place' },
    { lat: 28.6280, lng: 77.2189, intensity: 0.9, count: 6, dept: 'roads', category: 'Pothole', area: 'Karol Bagh' },
    { lat: 28.6353, lng: 77.2250, intensity: 0.7, count: 4, dept: 'water', category: 'Waterlogging', area: 'Rajendra Place' },

    // South Delhi
    { lat: 28.5355, lng: 77.2600, intensity: 0.8, count: 5, dept: 'roads', category: 'Streetlight', area: 'Saket' },
    { lat: 28.5500, lng: 77.2167, intensity: 0.6, count: 3, dept: 'waste', category: 'Garbage', area: 'Hauz Khas' },
    { lat: 28.5244, lng: 77.2066, intensity: 0.9, count: 7, dept: 'roads', category: 'Pothole', area: 'Malviya Nagar' },
    { lat: 28.5125, lng: 77.2310, intensity: 0.5, count: 2, dept: 'water', category: 'Sewage', area: 'Sarita Vihar' },

    // East Delhi
    { lat: 28.6280, lng: 77.2950, intensity: 0.95, count: 9, dept: 'waste', category: 'Garbage', area: 'Preet Vihar' },
    { lat: 28.6500, lng: 77.3150, intensity: 0.8, count: 5, dept: 'roads', category: 'Pothole', area: 'Laxmi Nagar' },
    { lat: 28.5921, lng: 77.3200, intensity: 0.7, count: 4, dept: 'water', category: 'Leakage', area: 'Mayur Vihar' },

    // North Delhi
    { lat: 28.7041, lng: 77.1025, intensity: 0.8, count: 6, dept: 'roads', category: 'Streetlight', area: 'Rohini' },
    { lat: 28.7200, lng: 77.1500, intensity: 0.6, count: 3, dept: 'waste', category: 'Garbage', area: 'Pitampura' },
    { lat: 28.6850, lng: 77.2100, intensity: 0.9, count: 7, dept: 'roads', category: 'Pothole', area: 'Model Town' },
    { lat: 28.6950, lng: 77.1890, intensity: 0.4, count: 2, dept: 'general', category: 'Encroachment', area: 'Azadpur' },

    // West Delhi
    { lat: 28.6304, lng: 77.0830, intensity: 0.85, count: 6, dept: 'roads', category: 'Pothole', area: 'Janakpuri' },
    { lat: 28.6450, lng: 77.0650, intensity: 0.7, count: 4, dept: 'water', category: 'Waterlogging', area: 'Dwarka' },
    { lat: 28.6200, lng: 77.1100, intensity: 0.5, count: 3, dept: 'waste', category: 'Garbage', area: 'Tilak Nagar' },

    // Noida (NCR)
    { lat: 28.5355, lng: 77.3910, intensity: 0.6, count: 4, dept: 'waste', category: 'Garbage', area: 'Noida Sec 18' },
    { lat: 28.5700, lng: 77.3650, intensity: 0.75, count: 5, dept: 'roads', category: 'Pothole', area: 'Noida Sec 62' },

    // Gurgaon (NCR)
    { lat: 28.4595, lng: 77.0266, intensity: 0.8, count: 6, dept: 'roads', category: 'Pothole', area: 'Cyber City' },
    { lat: 28.4231, lng: 77.0420, intensity: 0.65, count: 4, dept: 'water', category: 'Sewage', area: 'Golf Course Road' },

    // Additional hotspots
    { lat: 28.5830, lng: 77.2050, intensity: 1.0, count: 10, dept: 'roads', category: 'Pothole', area: 'AIIMS' },
    { lat: 28.6127, lng: 77.2295, intensity: 0.9, count: 7, dept: 'roads', category: 'Traffic Signal', area: 'ITO' },
    { lat: 28.6520, lng: 77.2310, intensity: 0.55, count: 3, dept: 'general', category: 'Stray Animals', area: 'Civil Lines' },
    { lat: 28.5690, lng: 77.1855, intensity: 0.75, count: 5, dept: 'water', category: 'Leakage', area: 'Vasant Kunj' },
    { lat: 28.6790, lng: 77.2180, intensity: 0.85, count: 6, dept: 'waste', category: 'Garbage', area: 'GTB Nagar' },
];

const LEADERBOARD = [
    { rank: 1, name: 'Rahul Sharma', reports: 45, resolved: 38, points: 1520 },
    { rank: 2, name: 'Priya Verma', reports: 32, resolved: 28, points: 1120 },
    { rank: 3, name: 'Amit Kumar', reports: 28, resolved: 25, points: 1000 },
    { rank: 4, name: 'Sneha Patel', reports: 22, resolved: 18, points: 720 },
    { rank: 5, name: 'You', reports: 0, resolved: 0, points: 0, isCurrentUser: true },
];

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('overview');

    useEffect(() => {
        console.log("Dashboard Loaded. Current User:", user);
        console.log("User Role:", user?.role);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Maps View for Civilians
    const MapsView = () => (
        <div className="maps-section">
            <div className="section-header">
                <Map size={24} className="text-primary" />
                <div>
                    <h2>Issue Heatmap</h2>
                    <p className="text-muted">See reported issues near you</p>
                </div>
            </div>
            <div className="map-wrapper glass-panel">
                <MapContainer
                    center={[28.6139, 77.2090]}
                    zoom={12}
                    scrollWheelZoom={true}
                    style={{ height: '500px', width: '100%', borderRadius: '16px' }}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {MOCK_POINTS.map((point, idx) => (
                        <CircleMarker
                            key={idx}
                            center={[point.lat, point.lng]}
                            pathOptions={{
                                color: point.intensity > 0.7 ? '#ef4444' : point.intensity > 0.4 ? '#f59e0b' : '#22c55e',
                                fillColor: point.intensity > 0.7 ? '#ef4444' : point.intensity > 0.4 ? '#f59e0b' : '#22c55e',
                                fillOpacity: 0.7
                            }}
                            radius={12 + point.count * 2}
                        >
                            <Popup>
                                <div style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif', minWidth: '140px' }}>
                                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>📍 {point.area}</strong><br />
                                    <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '600' }}>{point.category}</span><br />
                                    <span style={{ color: '#64748b', fontSize: '12px' }}>{point.count} reports</span><br />
                                    <span style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'capitalize' }}>Dept: {point.dept}</span>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>
            <div className="map-legend">
                <span className="legend-item"><span className="dot high"></span> High Priority</span>
                <span className="legend-item"><span className="dot medium"></span> Medium</span>
                <span className="legend-item"><span className="dot low"></span> Low/Resolved</span>
            </div>
        </div>
    );

    // Leaderboard View
    const LeaderboardView = () => (
        <div className="leaderboard-section">
            <div className="section-header">
                <Trophy size={24} className="text-primary" />
                <div>
                    <h2>Community Leaderboard</h2>
                    <p className="text-muted">Top civic contributors this month</p>
                </div>
            </div>
            <div className="leaderboard-table glass-panel">
                <div className="table-header">
                    <span>Rank</span>
                    <span>Name</span>
                    <span>Reports</span>
                    <span>Resolved</span>
                    <span>Points</span>
                </div>
                {LEADERBOARD.map((user, idx) => (
                    <div key={idx} className={`table-row ${user.isCurrentUser ? 'current-user' : ''}`}>
                        <span className={`rank rank-${user.rank}`}>
                            {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : `#${user.rank}`}
                        </span>
                        <span className="name">{user.name}</span>
                        <span>{user.reports}</span>
                        <span>{user.resolved}</span>
                        <span className="points">{user.points}</span>
                    </div>
                ))}
            </div>
            <div className="leaderboard-cta">
                <p>Report issues to climb the leaderboard and earn rewards!</p>
                <button className="btn btn-primary" onClick={() => navigate('/analyze')}>
                    <Plus size={18} /> Report an Issue
                </button>
            </div>
        </div>
    );

    // Book Services Section (Urban Company Style)
    const BookServicesSection = () => (
        <div className="feature-section">
            <div className="section-header">
                <Briefcase size={24} className="text-primary" />
                <div>
                    <h2>Book Services</h2>
                    <p className="text-muted">Get professional help for your reported issues</p>
                </div>
            </div>
            <div className="feature-cards">
                <div className="feature-card glass-panel">
                    <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        <Briefcase size={28} />
                    </div>
                    <h3>⚡ Express Service</h3>
                    <p>Book a verified civic worker for fast resolution</p>
                    <ul className="feature-list">
                        <li>✓ Verified & background-checked</li>
                        <li>✓ Same-day service available</li>
                        <li>✓ Real-time tracking</li>
                        <li>✓ Secure payment</li>
                    </ul>
                    <div className="price-tag">Starting ₹299</div>
                    <button className="btn btn-primary w-full" onClick={() => navigate('/book')}>
                        <Plus size={18} /> Book Now
                    </button>
                </div>
                <div className="feature-card glass-panel">
                    <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <Heart size={28} />
                    </div>
                    <h3>🤝 NGO Assistance</h3>
                    <p>Free help from verified NGO partners</p>
                    <ul className="feature-list">
                        <li>✓ Community volunteers</li>
                        <li>✓ Large-scale issues</li>
                        <li>✓ Social impact support</li>
                        <li>✓ No charges</li>
                    </ul>
                    <div className="price-tag free">FREE</div>
                    <button className="btn btn-ghost w-full" onClick={() => navigate('/ngo-help')}>
                        <Heart size={18} /> Request Assistance
                    </button>
                </div>
            </div>
            <div className="help-info glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '0' }}>
                    💡 <strong>Tip:</strong> You can book a worker directly from "My Reports" by clicking "Fast Track" on any open issue!
                </p>
            </div>
        </div>
    );

    // Settings Section
    const SettingsSection = () => (
        <div className="feature-section">
            <div className="section-header">
                <Settings size={24} className="text-primary" />
                <div>
                    <h2>Account Settings</h2>
                    <p className="text-muted">Manage your profile and preferences</p>
                </div>
            </div>
            <div className="settings-grid">
                <div className="setting-card glass-panel">
                    <h4>Profile Information</h4>
                    <div className="setting-item">
                        <span>Name</span>
                        <strong>{user?.name}</strong>
                    </div>
                    <div className="setting-item">
                        <span>Email</span>
                        <strong>{user?.email || 'Not set'}</strong>
                    </div>
                    <div className="setting-item">
                        <span>Role</span>
                        <strong className="capitalize">{user?.role?.replace('_', ' ')}</strong>
                    </div>
                    <button className="btn btn-ghost btn-sm mt-4">Edit Profile</button>
                </div>
                <div className="setting-card glass-panel">
                    <h4>Notifications</h4>
                    <div className="setting-toggle">
                        <span>Report Updates</span>
                        <input type="checkbox" defaultChecked />
                    </div>
                    <div className="setting-toggle">
                        <span>Worker Assignments</span>
                        <input type="checkbox" defaultChecked />
                    </div>
                    <div className="setting-toggle">
                        <span>City Alerts</span>
                        <input type="checkbox" />
                    </div>
                    <div className="setting-toggle">
                        <span>Leaderboard Updates</span>
                        <input type="checkbox" defaultChecked />
                    </div>
                </div>
            </div>
        </div>
    );

    // Role-based redirection using useEffect to avoid render-phase side effects
    useEffect(() => {
        if (!user) return;

        if (user.role === 'super_admin') {
            navigate('/super-admin-dashboard', { replace: true });
        } else if (user.role === 'gov_admin') {
            navigate('/gov-admin-dashboard', { replace: true });
        } else if (user.role === 'dept_head') {
            navigate('/dept-head-dashboard', { replace: true });
        } else if (user.role === 'field_officer') {
            navigate('/field-officer-dashboard', { replace: true });
        }
    }, [user, navigate]);

    // Return null while redirecting for these specific roles
    if (['super_admin', 'gov_admin', 'dept_head', 'field_officer'].includes(user?.role)) {
        return null; // Or a unified loading spinner
    }

    // Gig Worker Dashboard
    if (user?.role === 'gig_worker') {
        return <GigWorkerDashboard />;
    }

    // NGO / Social Worker Dashboard
    if (user?.role === 'social_worker') {
        return <SocialWorkerDashboard />;
    }

    // Civilian Dashboard Layout
    if (user?.role?.toLowerCase() === 'civilian') {
        return <CivilianDashboard user={user} />;
    }

    // Fallback: If no other role matched (and not redirected), default to Civilian Dashboard
    // This handles 'civilian' role and any potential edge cases where role might be missing or 'user'
    console.log("Dashboard: Defaulting to Civilian Dashboard for role:", user?.role);
    return <CivilianDashboard user={user} />;
};

export default Dashboard;
