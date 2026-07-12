import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Zap, Flame, Gauge, AlertOctagon, Wifi, Link2, ChevronLeft, ChevronRight, Home, LogOut, Menu, X, Building2, Droplets } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const links = [
    { label: 'AI Command Center', icon: Brain, route: '/ai-command-center', accent: '#6366f1' },
    { label: 'Electricity Dept', icon: Zap, route: '/electricity', accent: '#eab308' },
    { label: 'Gas Department', icon: Flame, route: '/gas', accent: '#f97316' },
    { label: 'Water Department', icon: Droplets, route: '/water', accent: '#3b82f6' },
    { label: 'Smart Meters', icon: Gauge, route: '/smart-meters', accent: '#8b5cf6' },
    { label: 'Emergency Mode', icon: AlertOctagon, route: '/emergency-mode', accent: '#ef4444' },
    { label: 'IoT Devices', icon: Wifi, route: '/smart-city-devices', accent: '#06b6d4' },
    { label: 'Govt Integration', icon: Link2, route: '/gov-integration', accent: '#3b82f6' },
];

const SmartCitySidebar = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarWidth = collapsed ? 72 : 260;

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(true)}
                style={{
                    display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 1100,
                    width: 44, height: 44, borderRadius: 10, border: '1px solid #e2e8f0',
                    background: '#fff', cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,.08)',
                }}
                className="smart-city-mobile-toggle"
            >
                <Menu size={20} color="#334155" />
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.2)', zIndex: 1050, backdropFilter: 'blur(2px)' }}
                    className="smart-city-overlay"
                />
            )}

            {/* Sidebar */}
            <nav
                style={{
                    width: sidebarWidth,
                    minWidth: sidebarWidth,
                    height: '100vh',
                    background: '#ffffff',
                    borderRight: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width .25s ease, min-width .25s ease',
                    position: mobileOpen ? 'fixed' : 'relative',
                    zIndex: mobileOpen ? 1060 : 10,
                    boxShadow: mobileOpen ? '4px 0 24px rgba(0,0,0,.08)' : 'none',
                }}
                className={mobileOpen ? '' : 'smart-city-sidebar-desktop'}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: collapsed ? '20px 16px' : '20px 20px',
                    borderBottom: '1px solid #f1f5f9',
                }}>
                    <div style={{
                        width: 36, height: 36, minWidth: 36, borderRadius: 10,
                        background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Building2 size={18} color="#fff" />
                    </div>
                    {!collapsed && (
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', letterSpacing: '-.02em', lineHeight: 1.2 }}>UrbanEye</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase' }}>Smart City</div>
                        </div>
                    )}
                    {mobileOpen && (
                        <button
                            onClick={() => setMobileOpen(false)}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8' }}
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Dashboard link */}
                <div style={{ padding: '12px 12px 4px' }}>
                    <button
                        onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                            padding: collapsed ? '10px 0' : '10px 12px',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                            fontWeight: 500, color: '#64748b', background: '#f8fafc',
                            transition: 'background .15s, color .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
                        title={collapsed ? 'Dashboard' : ''}
                    >
                        <Home size={18} />
                        {!collapsed && 'Dashboard'}
                    </button>
                </div>

                {/* Section label */}
                {!collapsed && (
                    <div style={{ padding: '14px 24px 6px', fontSize: 10, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                        Platform
                    </div>
                )}

                {/* Nav links */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {links.map(link => {
                        const isActive = location.pathname === link.route;
                        return (
                            <button
                                key={link.route}
                                onClick={() => { navigate(link.route); setMobileOpen(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: collapsed ? '10px 0' : '10px 12px',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                                    fontWeight: isActive ? 600 : 500, width: '100%', textAlign: 'left',
                                    color: isActive ? link.accent : '#64748b',
                                    background: isActive ? `${link.accent}0d` : 'transparent',
                                    borderLeft: isActive ? `3px solid ${link.accent}` : '3px solid transparent',
                                    transition: 'all .15s ease',
                                }}
                                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#334155'; } }}
                                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
                                title={collapsed ? link.label : ''}
                            >
                                <div style={{
                                    width: 32, height: 32, minWidth: 32, borderRadius: 8,
                                    background: isActive ? `${link.accent}18` : '#f8fafc',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background .15s',
                                }}>
                                    <link.icon size={16} color={isActive ? link.accent : '#94a3b8'} />
                                </div>
                                {!collapsed && (
                                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {link.label}
                                    </span>
                                )}
                                {isActive && !collapsed && (
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: link.accent, flexShrink: 0 }} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Collapse toggle — desktop only */}
                <div style={{ padding: '8px 12px', borderTop: '1px solid #f1f5f9' }} className="smart-city-sidebar-desktop-only">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            width: '100%', padding: '8px 0', border: 'none', borderRadius: 6,
                            cursor: 'pointer', fontSize: 12, fontWeight: 500,
                            color: '#94a3b8', background: '#f8fafc',
                            transition: 'background .15s, color .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                        {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> Collapse</>}
                    </button>
                </div>

                {/* User footer */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: collapsed ? '16px 12px' : '16px 16px',
                    borderTop: '1px solid #f1f5f9',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                    {!collapsed && (
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name || 'User'}
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>
                                {user?.role?.replace(/_/g, ' ') || 'Smart City'}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        style={{
                            width: 34, height: 34, minWidth: 34, borderRadius: 8, border: 'none',
                            background: '#fef2f2', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; }}
                        title="Logout"
                    >
                        <LogOut size={15} color="#ef4444" />
                    </button>
                </div>
            </nav>

            {/* Main content */}
            <main style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
                {children}
            </main>

            {/* Responsive CSS */}
            <style>{`
                @media (max-width: 1023px) {
                    .smart-city-sidebar-desktop { display: none !important; }
                    .smart-city-mobile-toggle { display: flex !important; }
                }
                @media (min-width: 1024px) {
                    .smart-city-sidebar-desktop-only { display: block; }
                    .smart-city-mobile-toggle { display: none !important; }
                }
                @media (max-width: 1023px) {
                    .smart-city-sidebar-desktop-only { display: none; }
                }
            `}</style>
        </div>
    );
};

export default SmartCitySidebar;
