import { useState, useEffect } from 'react';
import { Wifi, Server, MapPin, Activity, Sun, Wind, Trash2, Camera, Radio, CheckCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import SmartCitySidebar from '../components/SmartCitySidebar';

const devices = [
    { id: 'SCN-001', name: 'Smart Streetlight', zone: 'MG Road – Pole #14', protocol: 'MQTT', status: 'online', battery: 92, signal: -62, type: 'streetlight', lastPing: '12s ago' },
    { id: 'SCN-002', name: 'Air Quality Sensor', zone: 'ITO Junction', protocol: 'NB-IoT', status: 'online', battery: 78, signal: -71, type: 'env', lastPing: '45s ago' },
    { id: 'SCN-003', name: 'Smart Waste Bin', zone: 'Karol Bagh Market', protocol: 'LoRaWAN', status: 'online', battery: 54, signal: -89, type: 'waste', lastPing: '2m ago' },
    { id: 'SCN-004', name: 'CCTV – AI-enabled', zone: 'Rajiv Chowk Metro', protocol: 'REST/HTTP', status: 'online', battery: 100, signal: -48, type: 'camera', lastPing: '1s ago' },
    { id: 'SCN-005', name: 'Flood Level Sensor', zone: 'Yamuna Barrage', protocol: 'NB-IoT', status: 'warning', battery: 23, signal: -94, type: 'env', lastPing: '5m ago' },
    { id: 'SCN-006', name: 'Smart Parking', zone: 'Connaught Place – Lot B', protocol: 'LoRaWAN', status: 'online', battery: 88, signal: -66, type: 'parking', lastPing: '30s ago' },
    { id: 'SCN-007', name: 'Weather Station', zone: 'Palam Observatory', protocol: 'MQTT', status: 'online', battery: 97, signal: -55, type: 'env', lastPing: '10s ago' },
    { id: 'SCN-008', name: 'Traffic Sensor', zone: 'NH-48 Entry Toll', protocol: 'CoAP', status: 'offline', battery: 0, signal: 0, type: 'traffic', lastPing: '2h ago' },
];

const statusCfg = {
    online: { label: 'Online', dot: '#22c55e', badge: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' } },
    warning: { label: 'Warning', dot: '#f59e0b', badge: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' } },
    offline: { label: 'Offline', dot: '#ef4444', badge: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' } },
};

const protocolColors = {
    MQTT: '#6366f1', 'NB-IoT': '#3b82f6', LoRaWAN: '#8b5cf6', 'REST/HTTP': '#10b981', CoAP: '#f59e0b',
};

const typeIcons = { streetlight: Sun, env: Wind, waste: Trash2, camera: Camera, parking: Server, traffic: Radio };

const SmartCityDevices = () => {
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [selected, setSelected] = useState(null);

    const filtered = filter === 'all' ? devices : devices.filter(d => d.status === filter);
    const online = devices.filter(d => d.status === 'online').length;

    return (
        <SmartCitySidebar>
            <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <div style={{ borderBottom: '1px solid #f1f5f9', background: '#fff', position: 'sticky', top: 0, zIndex: 40 }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, background: '#06b6d4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wifi size={20} color="#fff" /></div>
                            <div>
                                <h1 style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', margin: 0 }}>IoT Device Manager</h1>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Smart City Sensor & Device Network</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1400); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />Ping All
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#f0fdf4', color: '#16a34a', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #bbf7d0' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />{online}/{devices.length} Online
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        {[
                            { label: 'Total Devices', value: devices.length, color: '#06b6d4', icon: Wifi, sub: 'Across Delhi zones' },
                            { label: 'Online', value: online, color: '#22c55e', icon: CheckCircle, sub: 'Active & reporting' },
                            { label: 'Warnings', value: devices.filter(d => d.status === 'warning').length, color: '#f59e0b', icon: AlertTriangle, sub: 'Low battery/signal' },
                            { label: 'Offline', value: devices.filter(d => d.status === 'offline').length, color: '#ef4444', icon: Activity, sub: 'Needs attention' },
                        ].map(({ label, value, color, icon: Icon, sub }) => (
                            <div key={label} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f1f5f9' }}>
                                <div style={{ width: 36, height: 36, background: `${color}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon size={17} color={color} /></div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{value}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 4 }}>{label}</div>
                                <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: 0 }}>Device Registry</h2>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['all', 'online', 'warning', 'offline'].map(f => (
                                <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: filter === f ? '#06b6d4' : '#f1f5f9', color: filter === f ? '#fff' : '#64748b', transition: 'all .15s' }}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
                        {filtered.map(device => {
                            const cfg = statusCfg[device.status];
                            const TypeIcon = typeIcons[device.type] || Wifi;
                            return (
                                <div key={device.id} onClick={() => setSelected(selected === device.id ? null : device.id)}
                                    style={{ background: '#fff', borderRadius: 12, border: `1px solid ${selected === device.id ? '#a5f3fc' : '#f1f5f9'}`, cursor: 'pointer', transition: 'border-color .15s' }}>
                                    <div style={{ padding: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.badge.bg, border: `1px solid ${cfg.badge.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <TypeIcon size={16} color={cfg.badge.color} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{device.name}</div>
                                                    <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={9} />{device.zone}</div>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: cfg.badge.bg, color: cfg.badge.color, border: `1px solid ${cfg.badge.border}`, fontWeight: 600, height: 'fit-content', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />{cfg.label}
                                            </span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12 }}>
                                            <div><span style={{ color: '#94a3b8' }}>Protocol</span><div style={{ fontWeight: 700, color: protocolColors[device.protocol] }}>{device.protocol}</div></div>
                                            <div><span style={{ color: '#94a3b8' }}>Battery</span><div style={{ fontWeight: 700, color: device.battery < 30 ? '#ef4444' : '#0f172a' }}>{device.battery}%</div></div>
                                            <div><span style={{ color: '#94a3b8' }}>Signal</span><div style={{ fontWeight: 700, color: device.signal < -85 ? '#d97706' : '#0f172a' }}>{device.signal} dBm</div></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: '#cbd5e1' }}>
                                            <span style={{ fontFamily: 'monospace' }}>{device.id}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={9} />{device.lastPing}</span>
                                        </div>
                                        {selected === device.id && (
                                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 }}>
                                                <button style={{ flex: 1, padding: '9px 0', background: '#06b6d4', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Ping Device</button>
                                                <button style={{ flex: 1, padding: '9px 0', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>View Logs</button>
                                                {device.status === 'offline' && <button style={{ flex: 1, padding: '9px 0', background: '#ef4444', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Reset</button>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Protocol breakdown */}
                    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20 }}>
                        <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: '0 0 14px' }}>Protocol Distribution</h3>
                        <div style={{ display: 'flex', gap: 16 }}>
                            {Object.entries(protocolColors).map(([proto, color]) => {
                                const count = devices.filter(d => d.protocol === proto).length;
                                return (
                                    <div key={proto} style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                            <Radio size={16} color={color} />
                                        </div>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{count}</div>
                                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{proto}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </SmartCitySidebar>
    );
};

export default SmartCityDevices;
