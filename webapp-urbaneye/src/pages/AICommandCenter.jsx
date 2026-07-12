import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CloudRain, Wind, Thermometer, Activity, Target, Zap, ChevronRight, RefreshCw, MapPin, Clock } from 'lucide-react';
import SmartCitySidebar from '../components/SmartCitySidebar';

const mockPredictions = [
    {
        id: 1, zone: 'Sector 12, Andheri East', type: 'Sewage Overflow',
        confidence: 87, severity: 'high', eta: '2–4 hours',
        reason: 'Heavy rainfall forecast (78mm) + 6 drainage complaints in 48h',
        department: 'Water & Sanitation', cost: '₹42,000',
        icon: '🌊', trend: '+34%'
    },
    {
        id: 2, zone: 'MG Road Corridor', type: 'Road Damage',
        confidence: 73, severity: 'medium', eta: '12–24 hours',
        reason: 'Sustained 42°C temperatures + surface cracks reported x3',
        department: 'Roads & Infrastructure', cost: '₹1,20,000',
        icon: '🚧', trend: '+18%'
    },
    {
        id: 3, zone: 'Dharavi Industrial Area', type: 'Power Fault Risk',
        confidence: 91, severity: 'high', eta: '30–60 mins',
        reason: 'Voltage fluctuation spikes detected, transformer load at 94%',
        department: 'Electricity', cost: '₹2,80,000',
        icon: '⚡', trend: '+61%'
    },
    {
        id: 4, zone: 'Bandra West Residential', type: 'Garbage Surge',
        confidence: 64, severity: 'low', eta: '24–48 hours',
        reason: 'Festival season + 12% increase in complaint volume',
        department: 'Solid Waste Management', cost: '₹18,500',
        icon: '🗑️', trend: '+12%'
    },
];

const weatherData = [
    { label: 'Temperature', value: '38°C', change: '+3°C', icon: Thermometer, color: '#f97316' },
    { label: 'Rainfall', value: '78mm', change: 'Forecast', icon: CloudRain, color: '#3b82f6' },
    { label: 'Wind Speed', value: '32 km/h', change: 'Gusting 48', icon: Wind, color: '#64748b' },
    { label: 'Humidity', value: '84%', change: '+12%', icon: Activity, color: '#6366f1' },
];

const historicalTrend = [
    { month: 'Sep', count: 142 }, { month: 'Oct', count: 198 },
    { month: 'Nov', count: 167 }, { month: 'Dec', count: 223 },
    { month: 'Jan', count: 189 }, { month: 'Feb', count: 241 },
];

const AICommandCenter = () => {
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [activeZone, setActiveZone] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1800);
        return () => clearTimeout(timer);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => { setRefreshing(false); setLastRefresh(new Date()); }, 1500);
    };

    const getSeverityStyle = (severity) => {
        if (severity === 'high') return { bg: '#fef2f2', border: '#fecaca', badge: '#ef4444', text: '#991b1b' };
        if (severity === 'medium') return { bg: '#fffbeb', border: '#fde68a', badge: '#f59e0b', text: '#92400e' };
        return { bg: '#f0fdf4', border: '#bbf7d0', badge: '#22c55e', text: '#166534' };
    };

    const maxCount = Math.max(...historicalTrend.map(d => d.count));

    if (loading) {
        return (
            <SmartCitySidebar>
                <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, border: '3px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }} />
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>UrbanAI Engine</div>
                        <div style={{ fontSize: 13, color: '#94a3b8' }}>Correlating weather patterns, historical data & live reports…</div>
                    </div>
                </div>
            </SmartCitySidebar>
        );
    }

    return (
        <SmartCitySidebar>
            <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                {/* Header */}
                <div style={{ borderBottom: '1px solid #f1f5f9', background: '#fff', position: 'sticky', top: 0, zIndex: 40 }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, background: '#6366f1', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Brain size={20} color="#fff" />
                            </div>
                            <div>
                                <h1 style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>AI Command Center</h1>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Predictive Infrastructure Intelligence</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                                <Clock size={12} /> Updated: {lastRefresh.toLocaleTimeString()}
                            </span>
                            <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#f0fdf4', color: '#16a34a', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #bbf7d0' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} /> Live
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        {[
                            { label: 'Active Predictions', value: '4', sub: '2 critical', color: '#ef4444' },
                            { label: 'Avg Confidence', value: '78.8%', sub: 'UrbanAI Engine', color: '#6366f1' },
                            { label: 'Prevention Cost', value: '₹4.6L', sub: 'estimated savings', color: '#10b981' },
                            { label: 'Zones Monitored', value: '142', sub: 'across 8 wards', color: '#f59e0b' },
                        ].map((stat, i) => (
                            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 4 }}>{stat.label}</div>
                                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{stat.sub}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                        {/* Predictions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                                    <Target size={16} color="#6366f1" /> Active Risk Predictions
                                </h2>
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>{mockPredictions.length} zones flagged</span>
                            </div>
                            {mockPredictions.map(pred => {
                                const s = getSeverityStyle(pred.severity);
                                return (
                                    <div key={pred.id} onClick={() => setActiveZone(activeZone === pred.id ? null : pred.id)}
                                        style={{ background: '#fff', borderRadius: 12, border: `1px solid ${activeZone === pred.id ? '#c7d2fe' : '#f1f5f9'}`, cursor: 'pointer', transition: 'border-color .15s' }}>
                                        <div style={{ padding: 20 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', gap: 14 }}>
                                                    <span style={{ fontSize: 28 }}>{pred.icon}</span>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', padding: '2px 8px', borderRadius: 20, background: s.badge }}>{pred.severity.toUpperCase()}</span>
                                                            <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />{pred.zone}</span>
                                                        </div>
                                                        <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: 16, margin: 0 }}>{pred.type}</h3>
                                                        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4, margin: '4px 0 0' }}>{pred.reason}</p>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{pred.confidence}%</div>
                                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>confidence</div>
                                                </div>
                                            </div>
                                            {activeZone === pred.id && (
                                                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Department</div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{pred.department}</div>
                                                    </div>
                                                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Est. ETA</div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{pred.eta}</div>
                                                    </div>
                                                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Prevention Cost</div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>{pred.cost}</div>
                                                    </div>
                                                    <div style={{ gridColumn: 'span 3', display: 'flex', gap: 8 }}>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#6366f1', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Dispatch Team</button>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>View on Map</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Panel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Weather */}
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px' }}>
                                    <CloudRain size={15} color="#3b82f6" /> Live Weather Feed
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                    {weatherData.map(({ label, value, change, icon: Icon, color }) => (
                                        <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Icon size={15} color={color} />
                                                <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{value}</div>
                                                <div style={{ fontSize: 11, color: '#94a3b8' }}>{change}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trend */}
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px' }}>
                                    <TrendingUp size={15} color="#10b981" /> Incident Trend (6mo)
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
                                    {historicalTrend.map(({ month, count }) => (
                                        <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                            <div style={{ fontSize: 10, color: '#94a3b8' }}>{count}</div>
                                            <div style={{ width: '100%', background: '#6366f1', borderRadius: '4px 4px 0 0', height: `${(count / maxCount) * 70}px`, opacity: 0.8, transition: 'height .3s' }} />
                                            <div style={{ fontSize: 10, color: '#94a3b8' }}>{month}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Context */}
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px' }}>
                                    <Zap size={15} color="#f59e0b" /> Local Context Feed
                                </h3>
                                {[
                                    { text: 'Heavy rainfall alert issued for Mumbai suburbs', time: '2h ago', tag: 'Weather' },
                                    { text: 'Ganesh festival procession expected through Andheri West', time: '5h ago', tag: 'Events' },
                                    { text: 'Construction work underway on SV Road stretch', time: '1d ago', tag: 'Infra' },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ fontSize: 11, background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap', height: 'fit-content' }}>{item.tag}</span>
                                        <div>
                                            <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
                                            <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SmartCitySidebar>
    );
};

export default AICommandCenter;
