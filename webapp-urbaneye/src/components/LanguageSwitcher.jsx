import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

const LOCALES = [
    { code: 'en', label: 'English', flag: '\u{1F1EE}\u{1F1F3}' },
    { code: 'hi', label: '\u0939\u093F\u0928\u094D\u0926\u0940', flag: '\u{1F1EE}\u{1F1F3}' },
    { code: 'as', label: '\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE', flag: '\u{1F1EE}\u{1F1F3}' },
];

const getCookieLocale = () => {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    return match ? match[1] : 'en';
};

const LanguageSwitcher = ({ isScrolled = false }) => {
    const [locale, setLocaleState] = useState(getCookieLocale());
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLocale = LOCALES.find((l) => l.code === locale) || LOCALES[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (code) => {
        setLocaleState(code);
        setIsOpen(false);
        if (code === 'en') {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + location.hostname + "; path=/;";
        } else {
            document.cookie = `googtrans=/en/${code}; path=/;`;
            document.cookie = `googtrans=/en/${code}; domain=${location.hostname}; path=/;`;
        }
        window.location.reload();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${isScrolled ? 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50' : 'text-slate-700 hover:text-indigo-600 hover:bg-white/50'}`}
                title="Change Language"
            >
                <Globe size={16} />
                <span className="hidden sm:inline">{currentLocale.flag}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-[100] animate-in fade-in">
                    {LOCALES.map((loc) => (
                        <button
                            key={loc.code}
                            onClick={() => handleSelect(loc.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${loc.code === locale ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
                        >
                            <span className="text-base">{loc.flag}</span>
                            <span>{loc.label}</span>
                            {loc.code === locale && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
