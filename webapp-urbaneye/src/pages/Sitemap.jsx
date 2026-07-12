import React from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { Map, HelpCircle, UserCheck, ShieldAlert, Zap, Droplets, ArrowRight } from 'lucide-react';

const Sitemap = () => {
    const { contrastMode } = useAccessibility();

    const sections = [
        {
            title: 'Main Navigation',
            icon: <Map size={24} className="text-indigo-500" />,
            links: [
                { path: '/', label: 'Home Page' },
                { path: '/analyze', label: 'AI Issue Analysis' },
                { path: '/dashboard', label: 'User Dashboard (Requires Login)' },
            ]
        },
        {
            title: 'Authentication',
            icon: <UserCheck size={24} className="text-emerald-500" />,
            links: [
                { path: '/login', label: 'Citizen Login' },
                { path: '/signup', label: 'New Registration' },
                { path: '/secret-admin', label: 'Official Personnel Direct Login' }
            ]
        },
        {
            title: 'Public Services',
            icon: <HelpCircle size={24} className="text-blue-500" />,
            links: [
                { path: '/book', label: 'Book Municipal Service' },
                { path: '/ngo-help', label: 'Request NGO Assistance' }
            ]
        },
        {
            title: 'Smart City Infrastructure',
            icon: <Zap size={24} className="text-amber-500" />,
            links: [
                { path: '/ai-command-center', label: 'AI Command Center' },
                { path: '/smart-meters', label: 'Smart Meter Dashboard' },
                { path: '/smart-city-devices', label: 'IoT Devices Overview' },
                { path: '/gov-integration', label: 'Cross-Department Integration' }
            ]
        },
        {
            title: 'Emergency & Utilities',
            icon: <ShieldAlert size={24} className="text-red-500" />,
            links: [
                { path: '/emergency-mode', label: 'Emergency Response Mode' },
                { path: '/electricity', label: 'Electricity Department' },
                { path: '/gas', label: 'Gas Department' }
            ]
        },
        {
            title: 'Official Portals',
            icon: <Droplets size={24} className="text-purple-500" />,
            links: [
                { path: '/super-admin-dashboard', label: 'Super Administrator Portal' },
                { path: '/gov-admin-dashboard', label: 'Government Admin Portal' },
                { path: '/dept-head-dashboard', label: 'Department Head Portal' },
                { path: '/field-officer-dashboard', label: 'Field Officer Portal' }
            ]
        }
    ];

    return (
        <div className={`min-h-screen pt-32 pb-20 ${contrastMode === 'dark' ? 'bg-slate-900 text-white' : contrastMode === 'high-contrast' ? 'bg-black text-yellow-400' : 'bg-slate-50 text-slate-900'}`}>
            <div className="max-w-6xl mx-auto px-6">
                
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">
                        Website <span className="text-indigo-600">Sitemap</span>
                    </h1>
                    <p className={`text-lg ${contrastMode === 'high-contrast' ? 'text-white' : 'text-slate-600 dark:text-slate-400'} font-medium`}>
                        A complete overview of the UrbanEye platform architecture and available portals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sections.map((section, idx) => (
                        <div 
                            key={idx}
                            className={`
                                p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                                ${contrastMode === 'dark' 
                                    ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50 shadow-lg shadow-black/20' 
                                    : contrastMode === 'high-contrast'
                                    ? 'bg-black border-2 border-yellow-400'
                                    : 'bg-white border-slate-200 hover:border-indigo-200 shadow-xl shadow-slate-200/50'
                                }
                            `}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`
                                    w-12 h-12 rounded-2xl flex items-center justify-center
                                    ${contrastMode === 'high-contrast' ? 'bg-yellow-400/20' : 'bg-slate-100 dark:bg-slate-700'}
                                `}>
                                    {section.icon}
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
                            </div>

                            <ul className="space-y-4">
                                {section.links.map((link, linkIdx) => (
                                    <li key={linkIdx}>
                                        <Link 
                                            to={link.path}
                                            className="group flex flex-col focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 -m-1"
                                        >
                                            <span className={`
                                                font-medium text-[15px] flex items-center justify-between
                                                ${contrastMode === 'high-contrast' ? 'text-yellow-400 group-hover:text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}
                                                transition-colors
                                            `}>
                                                {link.label}
                                                <ArrowRight size={16} className={`
                                                    opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all
                                                    ${contrastMode === 'high-contrast' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}
                                                `} />
                                            </span>
                                            <span className={`text-xs mt-1 font-mono ${contrastMode === 'high-contrast' ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {link.path}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Sitemap;
