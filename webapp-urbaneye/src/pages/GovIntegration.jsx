import { useState } from 'react';
import { Building2, Link2, ShieldCheck, Globe, CheckCircle, AlertTriangle, ArrowRight, Activity, Clock, RefreshCw, Database, Lock } from 'lucide-react';
import SmartCitySidebar from '../components/SmartCitySidebar';

const integrations = [
    { id: 'erp', name: 'Municipal ERP System', vendor: 'NIC MunSoft', status: 'connected', uptime: '99.8%', lastSync: '2 min ago', dataPoints: '14,820', icon: '🏛️', endpoint: '/api/erp/v2' },
    { id: 'gis', name: 'GIS Mapping Service', vendor: 'Survey of India', status: 'connected', uptime: '99.5%', lastSync: '5 min ago', dataPoints: '8,420', icon: '🗺️', endpoint: '/api/gis/v1' },
    { id: 'aadhar', name: 'Aadhaar Verification', vendor: 'UIDAI Gateway', status: 'connected', uptime: '99.9%', lastSync: '1 min ago', dataPoints: '52,100', icon: '🪪', endpoint: '/api/aadhaar/verify' },
    { id: 'digilocker', name: 'DigiLocker Access', vendor: 'NeSDA', status: 'degraded', uptime: '97.2%', lastSync: '12 min ago', dataPoints: '3,210', icon: '📁', endpoint: '/api/digilocker/v2' },
    { id: 'umang', name: 'UMANG Services', vendor: 'MEITY', status: 'connected', uptime: '98.7%', lastSync: '4 min ago', dataPoints: '6,700', icon: '📱', endpoint: '/api/umang/v1' },
    { id: 'parivahan', name: 'Parivahan (Transport)', vendor: 'MoRTH', status: 'maintenance', uptime: '95.1%', lastSync: '2h ago', dataPoints: '1,100', icon: '🚗', endpoint: '/api/parivahan/v1' },
];

const statusCfg = {
    connected: { label: 'Connected', dot: '#22c55e', badge: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' } },
    degraded: { label: 'Degraded', dot: '#f59e0b', badge: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' } },
    maintenance: { label: 'Maintenance', dot: '#94a3b8', badge: { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' } },
    disconnected: { label: 'Offline', dot: '#ef4444', badge: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' } },
};

const GovIntegration = () => {
    const [selected, setSelected] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const connected = integrations.filter(i => i.status === 'connected').length;

    return (
        <SmartCitySidebar>
            <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <div style={{ borderBottom: '1px solid #f1f5f9', background: '#fff', position: 'sticky', top: 0, zIndex: 40 }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, background: '#3b82f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Link2 size={20} color="#fff" /></div>
                            <div>
                                <h1 style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', margin: 0 }}>Government Integration Hub</h1>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Central & State API Gateway — Unified Access</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1400); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />Health Check
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#f0fdf4', color: '#16a34a', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #bbf7d0' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />{connected}/{integrations.length} Connected
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        {[
                            { label: 'Total Integrations', value: integrations.length, color: '#3b82f6', icon: Link2, sub: 'Govt APIs connected' },
                            { label: 'Active', value: connected, color: '#22c55e', icon: CheckCircle, sub: 'Healthy connections' },
                            { label: 'Data Points Synced', value: '86.3K', color: '#6366f1', icon: Database, sub: 'Across all systems' },
                            { label: 'Avg Uptime', value: '98.4%', color: '#10b981', icon: Activity, sub: 'Last 30 days' },
                        ].map(({ label, value, color, icon: Icon, sub }) => (
                            <div key={label} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f1f5f9' }}>
                                <div style={{ width: 36, height: 36, background: `${color}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon size={17} color={color} /></div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{value}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 4 }}>{label}</div>
                                <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                        {/* Integrations List */}
                        <div>
                            <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Globe size={16} color="#3b82f6" />API Connections</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {integrations.map(integ => {
                                    const cfg = statusCfg[integ.status];
                                    return (
                                        <div key={integ.id} onClick={() => setSelected(selected === integ.id ? null : integ.id)}
                                            style={{ background: '#fff', borderRadius: 12, border: `1px solid ${selected === integ.id ? '#bfdbfe' : '#f1f5f9'}`, cursor: 'pointer', transition: 'border-color .15s' }}>
                                            <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', gap: 14 }}>
                                                    <span style={{ fontSize: 28 }}>{integ.icon}</span>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{integ.name}</span>
                                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: cfg.badge.bg, color: cfg.badge.color, border: `1px solid ${cfg.badge.border}`, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />{cfg.label}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{integ.vendor}</div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{integ.uptime}</div>
                                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>uptime</div>
                                                </div>
                                            </div>
                                            {selected === integ.id && (
                                                <div style={{ borderTop: '1px solid #f1f5f9', padding: 16 }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                                                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 11, color: '#94a3b8' }}>Endpoint</div><div style={{ fontWeight: 600, fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>{integ.endpoint}</div></div>
                                                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 11, color: '#94a3b8' }}>Last Sync</div><div style={{ fontWeight: 600, fontSize: 13, color: '#3b82f6' }}>{integ.lastSync}</div></div>
                                                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 11, color: '#94a3b8' }}>Data Points</div><div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{integ.dataPoints}</div></div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#3b82f6', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Test Connection</button>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>View Logs</button>
                                                        <button style={{ flex: 1, padding: '10px 0', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Config</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Panel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={15} color="#10b981" />Security & Compliance</h3>
                                {[
                                    { label: 'API Auth Method', val: 'OAuth 2.0 + mTLS', ok: true },
                                    { label: 'Data Encryption', val: 'AES-256 / TLS 1.3', ok: true },
                                    { label: 'Audit Logging', val: 'Enabled', ok: true },
                                    { label: 'CERT-In Compliance', val: 'Verified', ok: true },
                                    { label: 'Token Rotation', val: 'Every 6h', ok: true },
                                ].map(({ label, val, ok }) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={11} color="#94a3b8" />{label}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: ok ? '#16a34a' : '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={11} />{val}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={15} color="#6366f1" />Sync Activity (Today)</h3>
                                {[
                                    { time: '10:42 AM', event: 'Aadhaar API — 1,200 verifications synced', ok: true },
                                    { time: '10:15 AM', event: 'DigiLocker — Connection timeout (retrying)', ok: false },
                                    { time: '09:58 AM', event: 'MunSoft ERP — 340 new records pulled', ok: true },
                                    { time: '09:30 AM', event: 'GIS — Map tile cache refreshed', ok: true },
                                    { time: '09:00 AM', event: 'Parivahan — Scheduled maintenance started', ok: false },
                                ].map(({ time, event, ok }, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: ok ? '#22c55e' : '#f59e0b' }} />
                                        <div>
                                            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{event}</p>
                                            <span style={{ fontSize: 11, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Clock size={9} />{time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #bfdbfe', padding: 20 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#1d4ed8', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Building2 size={15} />Upcoming Integrations</h3>
                                {[
                                    { name: 'e-Governance Portal', status: 'In Development', eta: 'Q2 2026' },
                                    { name: 'Jan Dhan API', status: 'Testing Phase', eta: 'Q1 2026' },
                                    { name: 'CoWIN Health Data', status: 'Proposed', eta: 'Q3 2026' },
                                ].map(({ name, status, eta }) => (
                                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{name}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{status}</div>
                                        </div>
                                        <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>{eta}</span>
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

export default GovIntegration;
