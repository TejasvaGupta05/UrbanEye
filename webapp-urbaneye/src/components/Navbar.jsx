import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, Activity, Shield, Home, Sparkles, LayoutDashboard, ChevronRight, Eye } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const getRoleBadge = (role) => {
        switch (role) {
            case 'super_admin': return { label: 'Super Admin', color: 'bg-purple-500' };
            case 'gov_admin': return { label: 'Gov Admin', color: 'bg-blue-500' };
            case 'dept_head': return { label: 'Dept Head', color: 'bg-indigo-500' };
            case 'field_officer': return { label: 'Officer', color: 'bg-green-500' };
            case 'gig_worker': return { label: 'Gig Pro', color: 'bg-amber-500' };
            case 'social_worker': return { label: 'NGO', color: 'bg-pink-500' };
            default: return { label: 'Citizen', color: 'bg-slate-500' };
        }
    };

    const getDashboardPath = (role) => {
        switch (role) {
            case 'super_admin': return '/super-admin-dashboard';
            case 'gov_admin': return '/gov-admin-dashboard';
            case 'dept_head': return '/dept-head-dashboard';
            case 'field_officer': return '/field-officer-dashboard';
            default: return '/dashboard';
        }
    };

    const dashboardPath = getDashboardPath(user?.role);
    const roleBadge = getRoleBadge(user?.role);

    return (
        <>
            <nav className={`
                fixed top-[44px] left-0 right-0 z-50 transition-all duration-300
                ${isScrolled
                    ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/20 border-b border-slate-100'
                    : 'bg-transparent'}
            `}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <NavLink to="/" className="flex items-center gap-3 group">
                            <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110
                                ${isScrolled ? 'bg-indigo-100' : 'bg-white/10 backdrop-blur-sm'}
                            `}>
                                <Eye className={`${isScrolled ? 'text-indigo-600' : 'text-indigo-600'}`} size={22} />
                            </div>
                            <span className={`text-xl font-black tracking-tight ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                                Urban<span className="text-indigo-600">Eye</span>
                            </span>
                        </NavLink>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            <NavLink
                                to="/"
                                className={({ isActive }) => `
                                    px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2
                                    ${isActive
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : `${isScrolled ? 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50' : 'text-slate-700 hover:text-indigo-600 hover:bg-white/50'}`}
                                `}
                            >
                                <Home size={16} />
                                Home
                            </NavLink>
                            <NavLink
                                to="/analyze"
                                className={({ isActive }) => `
                                    px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2
                                    ${isActive
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : `${isScrolled ? 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50' : 'text-slate-700 hover:text-indigo-600 hover:bg-white/50'}`}
                                `}
                            >
                                <Sparkles size={16} />
                                AI Analysis
                            </NavLink>

                            {isAuthenticated() && user?.role !== 'civilian' && (
                                <NavLink
                                    to={dashboardPath}
                                    className={({ isActive }) => `
                                        px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2
                                        ${isActive
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : `${isScrolled ? 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50' : 'text-slate-700 hover:text-indigo-600 hover:bg-white/50'}`}
                                    `}
                                >
                                    <LayoutDashboard size={16} />
                                    Dashboard
                                </NavLink>
                            )}
                        </div>

                        {/* Desktop Auth Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <LanguageSwitcher isScrolled={isScrolled} />
                            {isAuthenticated() ? (
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        flex items-center gap-3 px-4 py-2 rounded-2xl
                                        ${isScrolled ? 'bg-slate-50' : 'bg-white/80 backdrop-blur-sm'}
                                    `}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full ${roleBadge.color} flex items-center justify-center`}>
                                                {user?.role === 'civilian' ? <User size={14} className="text-white" /> : <Shield size={14} className="text-white" />}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name?.split(' ')[0]}</p>
                                                <p className="text-xs text-slate-400 font-medium">{roleBadge.label}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="p-2 hover:bg-red-50 rounded-xl transition-colors group"
                                            title="Logout"
                                        >
                                            <LogOut size={18} className="text-slate-400 group-hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <NavLink
                                        to="/login"
                                        className={`
                                            px-5 py-2 rounded-xl font-semibold text-sm transition-all
                                            ${isScrolled ? 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50' : 'text-slate-700 hover:text-indigo-600 hover:bg-white/50'}
                                        `}
                                    >
                                        Log In
                                    </NavLink>
                                    <NavLink
                                        to="/signup"
                                        className="px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5"
                                    >
                                        Get Started
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
                            onClick={toggleMobileMenu}
                        >
                            {isMobileMenuOpen ? <X size={24} className="text-slate-600" /> : <Menu size={24} className="text-slate-600" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`
                fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden
                ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `} onClick={() => setIsMobileMenuOpen(false)} />

            {/* Mobile Menu Panel */}
            <div className={`
                fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl transition-transform duration-300 ease-out md:hidden
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="p-6">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <Eye className="text-indigo-600" size={22} />
                            </div>
                            <span className="text-xl font-black text-slate-900">
                                Urban<span className="text-indigo-600">Eye</span>
                            </span>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>

                    {/* Mobile Nav Links */}
                    <div className="space-y-2">
                        <NavLink
                            to="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => `
                                flex items-center justify-between p-4 rounded-2xl transition-all
                                ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Home size={20} />
                                <span className="font-semibold">Home</span>
                            </div>
                            <ChevronRight size={18} className="text-slate-300" />
                        </NavLink>
                        <NavLink
                            to="/analyze"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => `
                                flex items-center justify-between p-4 rounded-2xl transition-all
                                ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles size={20} />
                                <span className="font-semibold">AI Analysis</span>
                            </div>
                            <ChevronRight size={18} className="text-slate-300" />
                        </NavLink>
                        {isAuthenticated() && user?.role !== 'civilian' && (
                            <NavLink
                                to={dashboardPath}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center justify-between p-4 rounded-2xl transition-all
                                    ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <LayoutDashboard size={20} />
                                    <span className="font-semibold">Dashboard</span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </NavLink>
                        )}
                    </div>

                    {/* Mobile Language Switcher */}
                    <div className="mt-4 px-4">
                        <LanguageSwitcher isScrolled={true} />
                    </div>

                    {/* Mobile User Section */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100 bg-white">
                        {isAuthenticated() ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                                    <div className={`w-12 h-12 rounded-xl ${roleBadge.color} flex items-center justify-center`}>
                                        {user?.role === 'civilian' ? <User size={20} className="text-white" /> : <Shield size={20} className="text-white" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{user?.name}</p>
                                        <p className="text-sm text-slate-400">{roleBadge.label}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3.5 px-4 rounded-2xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <NavLink
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block w-full py-3.5 px-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-center"
                                >
                                    Log In
                                </NavLink>
                                <NavLink
                                    to="/signup"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block w-full py-3.5 px-4 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors text-center shadow-lg shadow-indigo-200"
                                >
                                    Get Started
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
