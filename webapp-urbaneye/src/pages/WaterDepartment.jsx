import { useState, useEffect } from 'react';
import { Droplets, AlertOctagon, MapPin, Clock, RefreshCw, CheckCircle, Activity, Eye, Phone, Shield, AlertTriangle } from 'lucide-react';
import SmartCitySidebar from '../components/SmartCitySidebar';

const delhiWaterNodes = [
    { id: 'DJB-N-04', node: 'Haiderpur WTP', area: 'Rohini, Pitampura, North Delhi', pressure: 4.8, pressureNormal: [4.5, 5.2], status: 'normal', leakRisk: 12, complaints: 1, prediction: 'No risk detected — flow stable', predConf: 97 },
    { id: 'DJB-S-11', node: 'Okhla WTP', area: 'Lajpat Nagar, South Delhi', pressure: 3.9, pressureNormal: [4.0, 5.0], status: 'warning', leakRisk: 41, complaints: 5, prediction: 'Supply below threshold — inspect pump S-11', predConf: 82 },
    { id: 'DJB-E-07', node: 'Bhagirathi WTP', area: 'Mayur Vihar, East Delhi', pressure: 5.3, pressureNormal: [4.5, 5.2], status: 'overpressure', leakRisk: 67, complaints: 8, prediction: 'High flow — pressure relief valve engaged', predConf: 91 },
    { id: 'DJB-W-02', node: 'Dwarka WTP', area: 'Dwarka, Palam, West Delhi', pressure: 4.7, pressureNormal: [4.5, 5.2], status: 'normal', leakRisk: 8, complaints: 0, prediction: 'Stable — post-maintenance checks clear', predConf: 99 },
    { id: 'DJB-C-01', node: 'Chandrawal WTP', area: 'Connaught Place, Central Delhi', pressure: 4.1, pressureNormal: [4.0, 5.0], status: 'warning', leakRisk: 34, complaints: 4, prediction: 'Minor pressure drop near distribution point', predConf: 76 },
];

const incidents = [
    { id: 'WD-2241', area: 'Mayur Vihar Ph-1', type: 'Pipe Burst', status: 'On Scene', responders: 3, time: '5 min ago', critical: true },
    { id: 'WD-2238', area: 'Lajpat Nagar Market', type: 'Low Supply Pressure', status: 'En Route', responders: 2, time: '18 min ago', critical: false },
    { id: 'WD-2235', area: 'Karol Bagh Residential', type: 'Contamination Report', status: 'Dispatched', responders: 4, time: '31 min ago', critical: true },
    { id: 'WD-2230', area: 'Dwarka Sec 12', type: 'Routine Quality Check', status: 'Resolved', responders: 1, time: '1h ago', critical: false },
];

const statusCfg = {
    normal: { label: 'Normal', dot: '#22c55e', badge: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' } },
    warning: { label: 'Low Supply', dot: '#f59e0b', badge: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' } },
    overpressure: { label: 'High Pressure', dot: '#ef4444', badge: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' } },
};
const incidentStatus = { 'On Scene': '#7c3aed', 'En Route': '#3b82f6', Dispatched: '#d97706', Resolved: '#16a34a' };

const WaterDepartment = () => {
    const [loading, setLoading] = useState(true);
    const [loadingStep, setLoadingStep] = useState(0);
    const [selected, setSelected] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [livePressures, setLivePressures] = useState(delhiWaterNodes.map(p => p.pressure));

    const steps = ['Connecting to DJB SCADA system…', 'Polling water flow sensors…', 'Analysing leak probability models…', 'Generating Delhi water supply report…'];

    useEffect(() => {
        let step = 0;
        const si = setInterval(() => { step++; setLoadingStep(step); if (step >= steps.length - 1) clearInterval(si); }, 650);
        const done = setTimeout(() => setLoading(false), 2800);
        return () => { clearInterval(si); clearTimeout(done); };
    }, [steps.length]);

    useEffect(() => {
        if (loading) return;
        const interval = setInterval(() => { setLivePressures(prev => prev.map(p => parseFloat(Math.max(3.5, Math.min(5.8, p + (Math.random() - 0.5) * 0.2)).toFixed(2)))); }, 2500);
        return () => clearInterval(interval);
    }, [loading]);

    const handleRefresh = () => { setRefreshing(true); setTimeout(() => { setRefreshing(false); setLastRefresh(new Date()); }, 1600); };

    if (loading) {
        return (
            <SmartCitySidebar>
                <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', maxWidth: 360 }}>
                        <div style={{ width: 56, height: 56, border: '3px solid #bfdbfe', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }} />
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Water Supply Command</div>
                        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>DJB Water Network — Delhi NCR</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
                            {steps.map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i <= loadingStep ? 1 : 0.25, transition: 'opacity .4s' }}>
                                    {i < loadingStep ? <CheckCircle size={14} color="#16a34a" /> : i === loadingStep ? <div style={{ width: 14, height: 14, border: '2px solid #bfdbfe', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #cbd5e1' }} />}
                                    <span style={{ fontSize: 13, color: i <= loadingStep ? '#475569' : '#94a3b8' }}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SmartCitySidebar>
        );
    }

    return (
        <SmartCitySidebar>
            <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                {delhiWaterNodes.some(p => p.status === 'overpressure') && (
                    <div style={{ background: '#ef4444', padding: '10px 24px', color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AlertOctagon size={15} /> <strong>CRITICAL:</strong> High Pressure detected on DJB-E-07 (Bhagirathi). Auto relief valve activated.
                        <span style={{ marginLeft: 'auto', opacity: 0.8 }}>● LIVE</span>
                    </div>
                )}

                <div style={{ borderBottom: '1px solid #f1f5f9', background: '#fff', position: 'sticky', top: 0, zIndex: 40 }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, background: '#3b82f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Droplets size={20} color="#fff" /></div>
                            <div>
                                <h1 style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', margin: 0 }}>Water Department</h1>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />DJB Water Network — Delhi NCR</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} />Updated: {lastRefresh.toLocaleTimeString()}</span>
                            <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />Refresh
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #bfdbfe' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />SCADA Live
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        {[
                            { label: 'Water Zones', value: delhiWaterNodes.length, sub: 'Delhi monitored', color: '#3b82f6', icon: Activity },
                            { label: 'Supply Alerts', value: delhiWaterNodes.filter(p => p.status !== 'normal').length, sub: 'Needs attention', color: '#ef4444', icon: AlertOctagon },
                            { label: 'Active Incidents', value: incidents.filter(i => i.status !== 'Resolved').length, sub: 'Responders deployed', color: '#f59e0b', icon: Phone },
                            { label: 'Network Safety', value: `${Math.round(delhiWaterNodes.filter(p => p.status === 'normal').length / delhiWaterNodes.length * 100)}%`, sub: 'Zones optimal', color: '#10b981', icon: Shield },
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}><Activity size={16} color="#3b82f6" />Water Zone Monitoring — Live Pressure</h2>
                            {delhiWaterNodes.map((zone, i) => {
                                const cfg = statusCfg[zone.status];
                                const liveP = livePressures[i];
                                const [lo, hi] = zone.pressureNormal;
                                const outOfRange = liveP < lo || liveP > hi;
                                const pPct = Math.min(100, Math.max(0, ((liveP - 3.0) / (6.0 - 3.0)) * 100));
                                return (
                                    <div key={zone.id} onClick={() => setSelected(selected === zone.id ? null : zone.id)}
                                        style={{ background: '#fff', borderRadius: 12, border: `1px solid ${selected === zone.id ? '#bfdbfe' : '#f1f5f9'}`, cursor: 'pointer', transition: 'border-color .15s' }}>
                                        <div style={{ padding: 20 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot }} />
                                                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{zone.node}</span>
                                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: cfg.badge.bg, color: cfg.badge.color, border: `1px solid ${cfg.badge.border}`, fontWeight: 600 }}>{cfg.label}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8' }}><MapPin size={9} />{zone.area}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: 24, fontWeight: 800, color: outOfRange ? '#ef4444' : '#0f172a' }}>{liveP} bar</div>
                                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>flow pressure</div>
                                                </div>
                                            </div>
                                            <div style={{ position: 'relative', marginBottom: 10 }}>
                                                <div style={{ width: '100%', background: '#f1f5f9', borderRadius: 20, height: 6 }}>
                                                    <div style={{ height: 6, borderRadius: 20, background: zone.status === 'normal' ? '#22c55e' : zone.status === 'warning' ? '#f59e0b' : '#ef4444', width: `${pPct}%`, transition: 'width .7s' }} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1', marginTop: 4 }}>
                                                    <span>3.0 bar</span><span>Normal: {lo}–{hi}</span><span>6.0 bar</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <span style={{ fontSize: 12, color: '#94a3b8' }}>Leak risk score</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 80, background: '#f1f5f9', borderRadius: 20, height: 4 }}>
                                                        <div style={{ height: 4, borderRadius: 20, background: zone.leakRisk > 50 ? '#ef4444' : zone.leakRisk > 25 ? '#f59e0b' : '#22c55e', width: `${zone.leakRisk}%` }} />
                                                    </div>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: zone.leakRisk > 50 ? '#ef4444' : zone.leakRisk > 25 ? '#d97706' : '#16a34a' }}>{zone.leakRisk}%</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
                                                <Eye size={12} color="#6366f1" />
                                                <span style={{ fontSize: 12, color: '#475569', flex: 1 }}>{zone.prediction}</span>
                                                <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 700 }}>{zone.predConf}%</span>
                                            </div>
                                            {selected === zone.id && (
                                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                                                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 11, color: '#94a3b8' }}>Node ID</div><div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', fontFamily: 'monospace' }}>{zone.id}</div></div>
                                                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 11, color: '#94a3b8' }}>Complaints</div><div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{zone.complaints}</div></div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#3b82f6', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Dispatch Inspector</button>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#ef4444', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Isolate Main Valve</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px' }}><Droplets size={15} color="#3b82f6" />Active Incidents</h3>
                                {incidents.map(inc => (
                                    <div key={inc.id} style={{ borderRadius: 8, padding: 12, border: `1px solid ${inc.critical ? '#fecaca' : '#f1f5f9'}`, background: inc.critical ? '#fef2f2' : '#fff', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{inc.id}</span>
                                                    {inc.critical && <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>● CRITICAL</span>}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{inc.type}</div>
                                                <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><MapPin size={9} />{inc.area} · {inc.time}</div>
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: incidentStatus[inc.status] }}>{inc.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px' }}><Shield size={15} color="#10b981" />Water Quality Systems</h3>
                                {[
                                    { label: 'SCADA Connectivity', ok: true },
                                    { label: 'Auto Pressure Relief Valves', ok: true },
                                    { label: 'Contamination Sensors', ok: true },
                                    { label: 'Leak Detection Network', ok: true },
                                    { label: 'DJB-E-07 Relief Valve', ok: false, note: 'Triggered — active' },
                                ].map(({ label, ok, note }) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: ok && !note ? '#16a34a' : '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {ok && !note ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}{note || (ok ? 'OK' : 'Issue')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #bfdbfe', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#2563eb', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}><Phone size={15} />Emergency Contacts</h3>
                                {[
                                    { role: 'DJB Control Room', num: '1916' },
                                    { role: 'Delhi Jal Board HQ', num: '011-23527679' },
                                    { role: 'Field Supervisor', num: '+91-98100-XXXXX' },
                                ].map(({ role, num }) => (
                                    <div key={role} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ fontSize: 13, color: '#64748b' }}>{role}</span>
                                        <span style={{ fontSize: 13, color: '#2563eb', fontFamily: 'monospace', fontWeight: 700 }}>{num}</span>
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

export default WaterDepartment;
