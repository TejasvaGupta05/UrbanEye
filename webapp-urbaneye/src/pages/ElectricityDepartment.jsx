import { useState, useEffect } from 'react';
import { Zap, AlertTriangle, TrendingUp, Activity, MapPin, Clock, RefreshCw, CheckCircle, Phone, Gauge, Eye, ChevronRight } from 'lucide-react';
import SmartCitySidebar from '../components/SmartCitySidebar';

const delhiZones = [
    { id: 'DEL-N-01', feeder: 'Rohini Sub-Station', area: 'Rohini Sector 3–7, North Delhi', load: 94, status: 'overload', voltage: '198V', complaints: 14, prediction: 'Fault likely in 2–3hrs', predConf: 89 },
    { id: 'DEL-S-04', feeder: 'Okhla Industrial', area: 'Okhla Phase I & II, South Delhi', load: 78, status: 'normal', voltage: '228V', complaints: 2, prediction: 'Stable — no action needed', predConf: 96 },
    { id: 'DEL-E-09', feeder: 'Shahdara Grid', area: 'Shahdara, Preet Vihar, East Delhi', load: 87, status: 'warning', voltage: '211V', complaints: 7, prediction: 'Voltage sag probable at peak hour', predConf: 74 },
    { id: 'DEL-W-12', feeder: 'Janakpuri 220kV', area: 'Janakpuri, West Delhi', load: 62, status: 'normal', voltage: '233V', complaints: 1, prediction: 'Stable — no action needed', predConf: 98 },
    { id: 'DEL-C-02', feeder: 'Rajiv Chowk Distribution', area: 'Connaught Place, Central Delhi', load: 91, status: 'warning', voltage: '205V', complaints: 9, prediction: 'Transformer overload risk by evening', predConf: 81 },
];

const recentComplaints = [
    { id: 'EL-9820', area: 'Rohini Sec 5', type: 'Power Outage', status: 'Assigned', officer: 'R. Sharma', time: '8 min ago' },
    { id: 'EL-9817', area: 'Preet Vihar', type: 'Voltage Fluctuation', status: 'Resolved', officer: 'P. Kumar', time: '22 min ago' },
    { id: 'EL-9815', area: 'Connaught Place', type: 'Street Light Fault', status: 'En Route', officer: 'S. Verma', time: '35 min ago' },
    { id: 'EL-9810', area: 'Okhla Phase II', type: 'Exposed Wiring', status: 'On Scene', officer: 'K. Singh', time: '51 min ago' },
];

const peakHourData = [
    { hour: '6am', load: 48 }, { hour: '8am', load: 71 }, { hour: '10am', load: 83 },
    { hour: '12pm', load: 79 }, { hour: '2pm', load: 76 }, { hour: '4pm', load: 85 },
    { hour: '6pm', load: 94 }, { hour: '8pm', load: 91 }, { hour: '10pm', load: 67 },
];

const statusCfg = {
    normal: { label: 'Normal', dot: '#22c55e', badge: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }, bar: '#22c55e' },
    warning: { label: 'Warning', dot: '#f59e0b', badge: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' }, bar: '#f59e0b' },
    overload: { label: 'Overload', dot: '#ef4444', badge: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' }, bar: '#ef4444' },
};
const complaintStatus = { Assigned: '#d97706', Resolved: '#16a34a', 'En Route': '#3b82f6', 'On Scene': '#7c3aed' };

const ElectricityDepartment = () => {
    const [loading, setLoading] = useState(true);
    const [loadingStep, setLoadingStep] = useState(0);
    const [selected, setSelected] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [liveLoads, setLiveLoads] = useState(delhiZones.map(z => z.load));

    const steps = ['Connecting to BSES/TPDDL grid APIs…', 'Loading feeder-level telemetry…', 'Running predictive fault models…', 'Generating Delhi zone report…'];

    useEffect(() => {
        let step = 0;
        const stepInterval = setInterval(() => { step++; setLoadingStep(step); if (step >= steps.length - 1) clearInterval(stepInterval); }, 600);
        const doneTimer = setTimeout(() => setLoading(false), 2600);
        return () => { clearInterval(stepInterval); clearTimeout(doneTimer); };
    }, []);

    useEffect(() => {
        if (loading) return;
        const interval = setInterval(() => {
            setLiveLoads(prev => prev.map(l => Math.min(100, Math.max(50, l + (Math.random() - 0.48) * 3))));
        }, 2000);
        return () => clearInterval(interval);
    }, [loading]);

    const handleRefresh = () => { setRefreshing(true); setTimeout(() => { setRefreshing(false); setLastRefresh(new Date()); }, 1600); };

    if (loading) {
        return (
            <SmartCitySidebar>
                <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', maxWidth: 360 }}>
                        <div style={{ width: 56, height: 56, border: '3px solid #fef3c7', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }} />
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Electricity Command</div>
                        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Delhi NCR Grid — UrbanAI Engine</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
                            {steps.map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i <= loadingStep ? 1 : 0.25, transition: 'opacity .4s' }}>
                                    {i < loadingStep ? <CheckCircle size={14} color="#16a34a" /> : i === loadingStep ? <div style={{ width: 14, height: 14, border: '2px solid #fde68a', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #cbd5e1' }} />}
                                    <span style={{ fontSize: 13, color: i <= loadingStep ? '#475569' : '#94a3b8' }}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SmartCitySidebar>
        );
    }

    const maxLoad = Math.max(...peakHourData.map(d => d.load));

    return (
        <SmartCitySidebar>
            <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                {/* Header */}
                <div style={{ borderBottom: '1px solid #f1f5f9', background: '#fff', position: 'sticky', top: 0, zIndex: 40 }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, background: '#f59e0b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Zap size={20} color="#fff" />
                            </div>
                            <div>
                                <h1 style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', margin: 0 }}>Electricity Department</h1>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />Delhi NCR — BSES Rajdhani & TPDDL Grid</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} />Updated: {lastRefresh.toLocaleTimeString()}</span>
                            <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />Refresh
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#fffbeb', color: '#d97706', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #fde68a' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />Live Grid
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        {[
                            { label: 'Active Feeders', value: '5', sub: 'Delhi zones', color: '#f59e0b', icon: Zap },
                            { label: 'Overload Alerts', value: delhiZones.filter(z => z.status === 'overload').length, sub: 'Needs dispatch', color: '#ef4444', icon: AlertTriangle },
                            { label: 'Active Complaints', value: recentComplaints.filter(c => c.status !== 'Resolved').length, sub: 'Being handled', color: '#3b82f6', icon: Phone },
                            { label: 'Avg Grid Load', value: `${Math.round(liveLoads.reduce((a, b) => a + b, 0) / liveLoads.length)}%`, sub: 'Real-time', color: '#7c3aed', icon: Gauge },
                        ].map(({ label, value, sub, color, icon: Icon }) => (
                            <div key={label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <div style={{ width: 36, height: 36, background: `${color}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon size={17} color={color} /></div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{value}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 4 }}>{label}</div>
                                <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                        {/* Feeder Zones */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}><Activity size={16} color="#f59e0b" />Delhi Feeder Zones — Live Status</h2>
                            {delhiZones.map((zone, i) => {
                                const cfg = statusCfg[zone.status];
                                const liveLoad = Math.round(liveLoads[i]);
                                return (
                                    <div key={zone.id} onClick={() => setSelected(selected === zone.id ? null : zone.id)}
                                        style={{ background: '#fff', borderRadius: 12, border: `1px solid ${selected === zone.id ? '#fde68a' : '#f1f5f9'}`, cursor: 'pointer', transition: 'border-color .15s' }}>
                                        <div style={{ padding: 20 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot }} />
                                                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{zone.feeder}</span>
                                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: cfg.badge.bg, color: cfg.badge.color, border: `1px solid ${cfg.badge.border}`, fontWeight: 600 }}>{cfg.label}</span>
                                                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{zone.id}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8' }}><MapPin size={9} />{zone.area}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{liveLoad}%</div>
                                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>grid load</div>
                                                </div>
                                            </div>
                                            <div style={{ width: '100%', background: '#f1f5f9', borderRadius: 20, height: 6, marginBottom: 10 }}>
                                                <div style={{ height: 6, borderRadius: 20, background: cfg.bar, width: `${liveLoad}%`, transition: 'width .7s' }} />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
                                                <Eye size={12} color="#6366f1" />
                                                <span style={{ fontSize: 12, color: '#475569', flex: 1 }}>{zone.prediction}</span>
                                                <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 700 }}>{zone.predConf}%</span>
                                            </div>
                                            {selected === zone.id && (
                                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Voltage</div>
                                                        <div style={{ fontWeight: 700, fontSize: 14, color: parseFloat(zone.voltage) < 210 ? '#d97706' : '#16a34a' }}>{zone.voltage}</div>
                                                    </div>
                                                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Complaints</div>
                                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{zone.complaints}</div>
                                                    </div>
                                                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>AI Confidence</div>
                                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#6366f1' }}>{zone.predConf}%</div>
                                                    </div>
                                                    <div style={{ gridColumn: 'span 3', display: 'flex', gap: 8 }}>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#f59e0b', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Dispatch Team</button>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#3b82f6', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>View Complaints</button>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Map View</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right side */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Peak Load */}
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px' }}><TrendingUp size={15} color="#f59e0b" />Today's Load Profile</h3>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90 }}>
                                    {peakHourData.map(({ hour, load }) => (
                                        <div key={hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                            <div style={{ width: '100%', background: load >= 90 ? '#ef4444' : load >= 80 ? '#f59e0b' : '#22c55e', borderRadius: '3px 3px 0 0', height: `${(load / maxLoad) * 70}px`, transition: 'height .3s' }} />
                                            <div style={{ fontSize: 9, color: '#94a3b8' }}>{hour}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />Normal</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d97706' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />Warning</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#dc2626' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />Overload</span>
                                </div>
                            </div>

                            {/* Complaints */}
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px' }}><Phone size={15} color="#3b82f6" />Recent Complaints</h3>
                                {recentComplaints.map(c => (
                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{c.id} · {c.type}</div>
                                            <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><MapPin size={9} />{c.area}</div>
                                            <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 2 }}>{c.officer} · {c.time}</div>
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: complaintStatus[c.status], whiteSpace: 'nowrap' }}>{c.status}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Theft */}
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #fde68a', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#d97706', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}><AlertTriangle size={15} />Theft Monitor</h3>
                                {[
                                    { area: 'Shahdara DP-7', gap: '31%', risk: 'High' },
                                    { area: 'Rohini Sec 11 DP-3', gap: '18%', risk: 'Medium' },
                                ].map(({ area, gap, risk }) => (
                                    <div key={area} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{area}</div>
                                            <div style={{ fontSize: 12, color: '#94a3b8' }}>Supply–billing gap: {gap}</div>
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: risk === 'High' ? '#ef4444' : '#d97706' }}>{risk}</span>
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

export default ElectricityDepartment;
