import { useState, useEffect } from 'react';
import { Zap, AlertTriangle, TrendingDown, Activity, Gauge, MapPin, ChevronRight, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import SmartCitySidebar from '../components/SmartCitySidebar';

const meters = [
    { id: 'SM-1042', zone: 'Andheri East – Block C', supplied: 1240, billed: 890, status: 'anomaly', consumption: 78, lastSync: '2 min ago' },
    { id: 'SM-2187', zone: 'Dharavi Industrial', supplied: 4800, billed: 4610, status: 'normal', consumption: 96, lastSync: '1 min ago' },
    { id: 'SM-3391', zone: 'Bandra West Residential', supplied: 620, billed: 402, status: 'theft_risk', consumption: 65, lastSync: '45 sec ago' },
    { id: 'SM-4056', zone: 'Kurla Market', supplied: 2100, billed: 1980, status: 'normal', consumption: 94, lastSync: '3 min ago' },
    { id: 'SM-5209', zone: 'Goregaon Link Road', supplied: 880, billed: 540, status: 'anomaly', consumption: 61, lastSync: '5 min ago' },
    { id: 'SM-6773', zone: 'Powai IT Park', supplied: 6400, billed: 6320, status: 'normal', consumption: 99, lastSync: '30 sec ago' },
];

const statusConfig = {
    normal: { label: 'Normal', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' },
    anomaly: { label: 'Anomaly', color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
    theft_risk: { label: 'Theft Risk', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' },
};

const SmartMeterDashboard = () => {
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [pulseIds, setPulseIds] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const randomId = meters[Math.floor(Math.random() * meters.length)].id;
            setPulseIds(prev => [...prev, randomId]);
            setTimeout(() => setPulseIds(prev => prev.filter(id => id !== randomId)), 900);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const filtered = filter === 'all' ? meters : meters.filter(m => m.status === filter);
    const anomalyCount = meters.filter(m => m.status === 'anomaly').length;
    const theftCount = meters.filter(m => m.status === 'theft_risk').length;

    return (
        <SmartCitySidebar>
            <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <div style={{ borderBottom: '1px solid #f1f5f9', background: '#fff', position: 'sticky', top: 0, zIndex: 40 }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, background: '#8b5cf6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gauge size={20} color="#fff" /></div>
                            <div>
                                <h1 style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', margin: 0 }}>Smart Meter Dashboard</h1>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Energy Anomaly Detection & Monitoring</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1400); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />Sync All
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#f0fdf4', color: '#16a34a', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #bbf7d0' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />{meters.length} Meters Active
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        {[
                            { label: 'Total Meters', value: meters.length, icon: Gauge, color: '#3b82f6', sub: '6 zones covered' },
                            { label: 'Anomaly Alerts', value: anomalyCount, icon: AlertTriangle, color: '#f59e0b', sub: 'Needs review' },
                            { label: 'Theft Risk Flags', value: theftCount, icon: TrendingDown, color: '#ef4444', sub: 'Dispatch required' },
                            { label: 'Avg Efficiency', value: '82%', icon: Activity, color: '#10b981', sub: 'Supply vs. billed' },
                        ].map(({ label, value, icon: Icon, color, sub }) => (
                            <div key={label} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <div style={{ width: 36, height: 36, background: `${color}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={color} /></div>
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{value}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 4 }}>{label}</div>
                                <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
                                <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: 0 }}>Distribution Points</h2>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {['all', 'normal', 'anomaly', 'theft_risk'].map(f => (
                                        <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: filter === f ? '#6366f1' : '#f1f5f9', color: filter === f ? '#fff' : '#64748b', transition: 'all .15s' }}>
                                            {f === 'all' ? 'All' : f === 'theft_risk' ? 'Theft Risk' : f.charAt(0).toUpperCase() + f.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {filtered.map(meter => {
                                    const cfg = statusConfig[meter.status];
                                    const gap = meter.supplied - meter.billed;
                                    const gapPct = ((gap / meter.supplied) * 100).toFixed(1);
                                    return (
                                        <div key={meter.id} onClick={() => setSelected(selected === meter.id ? null : meter.id)}
                                            style={{ background: '#fff', borderRadius: 12, border: `1px solid ${selected === meter.id ? '#c7d2fe' : '#f1f5f9'}`, cursor: 'pointer', transition: 'border-color .15s' }}>
                                            <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                                            <Zap size={18} color={cfg.color} />
                                                        </div>
                                                        <span style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderRadius: '50%', background: cfg.dot, border: '2px solid #fff' }} />
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{meter.id}</span>
                                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontWeight: 600 }}>{cfg.label}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8', marginTop: 2 }}><MapPin size={10} />{meter.zone}</div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 16 }}>{meter.consumption}%</div>
                                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>efficiency</div>
                                                    {meter.status !== 'normal' && <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginTop: 2 }}>-{gapPct}% gap</div>}
                                                </div>
                                            </div>
                                            {selected === meter.id && (
                                                <div style={{ borderTop: '1px solid #f1f5f9', padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 11, color: '#94a3b8' }}>Supplied</div><div style={{ fontWeight: 700, color: '#0f172a' }}>{meter.supplied} kWh</div></div>
                                                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 11, color: '#94a3b8' }}>Billed</div><div style={{ fontWeight: 700, color: '#0f172a' }}>{meter.billed} kWh</div></div>
                                                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 11, color: '#94a3b8' }}>Last Synced</div><div style={{ fontWeight: 700, color: '#3b82f6', fontSize: 13 }}>{meter.lastSync}</div></div>
                                                    <div style={{ gridColumn: 'span 3' }}>
                                                        <div style={{ width: '100%', background: '#f1f5f9', borderRadius: 20, height: 6 }}>
                                                            <div style={{ height: 6, borderRadius: 20, background: meter.status === 'normal' ? '#22c55e' : meter.status === 'anomaly' ? '#f59e0b' : '#ef4444', width: `${meter.consumption}%`, transition: 'width .3s' }} />
                                                        </div>
                                                    </div>
                                                    {meter.status !== 'normal' && (
                                                        <div style={{ gridColumn: 'span 3', display: 'flex', gap: 8 }}>
                                                            <button style={{ flex: 1, padding: '10px 0', background: '#ef4444', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Flag for Investigation</button>
                                                            <button style={{ flex: 1, padding: '10px 0', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Dispatch Inspector</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={15} color="#ef4444" />Alert Log</h3>
                                {[
                                    { meter: 'SM-3391', event: 'Supply–billing gap exceeded 35% threshold', time: '3 min ago', level: 'red' },
                                    { meter: 'SM-1042', event: 'Unusual off-peak consumption spike detected', time: '18 min ago', level: 'amber' },
                                    { meter: 'SM-5209', event: 'Meter tamper flag from field sensor', time: '42 min ago', level: 'red' },
                                    { meter: 'SM-2187', event: 'Routine sync completed successfully', time: '1h ago', level: 'green' },
                                ].map((alert, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: alert.level === 'red' ? '#ef4444' : alert.level === 'amber' ? '#f59e0b' : '#22c55e' }} />
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{alert.meter}</div>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>{alert.event}</div>
                                            <div style={{ fontSize: 11, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Clock size={9} />{alert.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={15} color="#10b981" />System Health</h3>
                                {[
                                    { label: 'API Sync Status', status: 'Connected', ok: true },
                                    { label: 'Meter Firmware', status: 'v3.2.1 (Current)', ok: true },
                                    { label: 'Alert Engine', status: 'Running', ok: true },
                                    { label: 'SM-5209 Signal', status: 'Weak (−78dBm)', ok: false },
                                ].map(({ label, status, ok }) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: ok ? '#16a34a' : '#d97706' }}>{status}</span>
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

export default SmartMeterDashboard;
