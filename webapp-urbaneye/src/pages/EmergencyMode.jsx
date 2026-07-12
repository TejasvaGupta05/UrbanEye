import { useState, useEffect } from 'react';
import { AlertOctagon, Zap, Droplets, Wind, MapPin, Clock, Users, CheckCircle, Phone, Shield, Radio, ChevronRight } from 'lucide-react';
import SmartCitySidebar from '../components/SmartCitySidebar';

const incidents = [
    { id: 'EM-001', type: 'Fallen Electrical Pole', zone: 'Andheri East, S.V. Road', status: 'dispatched', priority: 'critical', dept: 'Electricity', responders: 4, reported: '6 min ago', icon: '⚡' },
    { id: 'EM-002', type: 'Gas Leak Reported', zone: 'Bandra West, Carter Road', status: 'en_route', priority: 'critical', dept: 'Gas Authority', responders: 6, reported: '12 min ago', icon: '🔥' },
    { id: 'EM-003', type: 'Water Main Burst', zone: 'Dharavi, Transit Camp Road', status: 'on_scene', priority: 'high', dept: 'Water & Sanitation', responders: 3, reported: '28 min ago', icon: '🌊' },
    { id: 'EM-004', type: 'Road Cave-in', zone: 'Kurla LBS Marg', status: 'resolved', priority: 'medium', dept: 'Roads & Infra', responders: 5, reported: '1h ago', icon: '🚧' },
];

const cityStatus = [
    { label: 'Power Grid', val: 'Stable', ok: true },
    { label: 'Gas Network', val: '1 Active Alert', ok: false },
    { label: 'Water Supply', val: 'Disrupted — Dharavi', ok: false },
    { label: 'Road Network', val: 'Normal', ok: true },
    { label: 'Emergency Services', val: '4 units deployed', ok: true },
];

const statusLabel = { dispatched: 'Dispatched', en_route: 'En Route', on_scene: 'On Scene', resolved: 'Resolved' };
const statusColor = { dispatched: '#d97706', en_route: '#3b82f6', on_scene: '#7c3aed', resolved: '#16a34a' };
const priorityColor = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6' };

const EmergencyMode = () => {
    const [selected, setSelected] = useState(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setTick(p => p + 1), 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <SmartCitySidebar>
            <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                {/* Emergency banner */}
                <div style={{ background: '#ef4444', padding: '10px 24px', color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AlertOctagon size={16} />
                    <span><strong>EMERGENCY MODE ACTIVE</strong> — 2 critical incidents requiring immediate response</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Radio size={12} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />LIVE
                    </span>
                </div>

                {/* Header */}
                <div style={{ borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, background: '#ef4444', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertOctagon size={20} color="#fff" /></div>
                            <div>
                                <h1 style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', margin: 0 }}>Emergency Operations Center</h1>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Multi-Department Incident Command</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{Math.floor(tick / 3600).toString().padStart(2, '0')}:{Math.floor((tick % 3600) / 60).toString().padStart(2, '0')}:{(tick % 60).toString().padStart(2, '0')}</span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Active</span>
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Quick Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        {[
                            { label: 'Active Incidents', value: incidents.filter(i => i.status !== 'resolved').length, color: '#ef4444', icon: AlertOctagon },
                            { label: 'Responders Deployed', value: incidents.reduce((a, i) => a + (i.status !== 'resolved' ? i.responders : 0), 0), color: '#3b82f6', icon: Users },
                            { label: 'Departments Active', value: new Set(incidents.filter(i => i.status !== 'resolved').map(i => i.dept)).size, color: '#f59e0b', icon: Shield },
                            { label: 'Avg Response Time', value: '8.4 min', color: '#10b981', icon: Clock },
                        ].map(({ label, value, color, icon: Icon }) => (
                            <div key={label} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f1f5f9' }}>
                                <div style={{ width: 36, height: 36, background: `${color}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon size={17} color={color} /></div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{value}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 4 }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                        {/* Incidents */}
                        <div>
                            <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}><AlertOctagon size={16} color="#ef4444" />Active Incidents</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {incidents.map(inc => (
                                    <div key={inc.id} onClick={() => setSelected(selected === inc.id ? null : inc.id)}
                                        style={{ background: '#fff', borderRadius: 12, border: `1px solid ${inc.priority === 'critical' && inc.status !== 'resolved' ? '#fecaca' : '#f1f5f9'}`, cursor: 'pointer', transition: 'border-color .15s' }}>
                                        <div style={{ padding: 20 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', gap: 14 }}>
                                                    <span style={{ fontSize: 32 }}>{inc.icon}</span>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, color: '#fff', background: priorityColor[inc.priority] }}>{inc.priority.toUpperCase()}</span>
                                                            <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{inc.id}</span>
                                                        </div>
                                                        <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: 16, margin: 0 }}>{inc.type}</h3>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12, color: '#94a3b8' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />{inc.zone}</span>
                                                            <span>·</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} />{inc.reported}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: statusColor[inc.status] }}>{statusLabel[inc.status]}</span>
                                                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><Users size={12} />{inc.responders} responders</div>
                                                </div>
                                            </div>
                                            {selected === inc.id && inc.status !== 'resolved' && (
                                                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 11, color: '#94a3b8' }}>Department</div><div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{inc.dept}</div></div>
                                                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 11, color: '#94a3b8' }}>Responders</div><div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{inc.responders} field units</div></div>
                                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: 8 }}>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#ef4444', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Escalate</button>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#10b981', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Mark Resolved</button>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>View on Map</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={15} color="#3b82f6" />City Systems Status</h3>
                                {cityStatus.map(({ label, val, ok }) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: ok ? '#16a34a' : '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {ok ? <CheckCircle size={12} /> : <AlertOctagon size={12} />}{val}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #fecaca', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#dc2626', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={15} />Emergency Hotlines</h3>
                                {[
                                    { label: 'Fire Brigade', num: '101' },
                                    { label: 'Ambulance', num: '108' },
                                    { label: 'Police Control', num: '100' },
                                    { label: 'BSES Emergency', num: '19123' },
                                    { label: 'IGL Gas Leak', num: '1800-102-4305' },
                                    { label: 'Disaster Mgmt', num: '1077' },
                                ].map(({ label, num }) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
                                        <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#dc2626' }}>{num}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Radio size={15} color="#6366f1" />Live Communications</h3>
                                {[
                                    { msg: 'Team Alpha en route to Bandra gas leak — ETA 4 min', time: '2 min ago' },
                                    { msg: 'Dharavi water pressure restored to Section B', time: '8 min ago' },
                                    { msg: 'BSES crew on-site at Andheri — pole secured', time: '15 min ago' },
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{item.msg}</p>
                                        <span style={{ fontSize: 11, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}><Clock size={9} />{item.time}</span>
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

export default EmergencyMode;
