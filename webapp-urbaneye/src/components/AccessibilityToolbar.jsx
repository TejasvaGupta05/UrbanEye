import { useAccessibility } from '../context/AccessibilityContext';
import { Ear, EarOff, Sun, Moon, Type, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const LOCALES = [
    { code: 'en', label: 'English', flag: '\u{1F1EE}\u{1F1F3}' },
    { code: 'hi', label: '\u0939\u093F\u0928\u094D\u0926\u0940', flag: '\u{1F1EE}\u{1F1F3}' },
    { code: 'as', label: '\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE', flag: '\u{1F1EE}\u{1F1F3}' },
];

const getCookieLocale = () => {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    return match ? match[1] : 'en';
};

const AccessibilityToolbar = () => {
    const {
        fontSize, setFontSize,
        contrastMode, setContrastMode,
        screenReaderEnabled, setScreenReaderEnabled
    } = useAccessibility();

    const locale = getCookieLocale();
    const currentLocale = LOCALES.find((l) => l.code === locale) || LOCALES[0];

    const setLocale = (code) => {
        if (code === 'en') {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
        } else {
            document.cookie = `googtrans=/en/${code}; path=/;`;
            document.cookie = `googtrans=/en/${code}; domain=${window.location.hostname}; path=/;`;
        }
        window.location.reload();
    };

    const increaseFont = () => {
        if (fontSize === 'small') setFontSize('normal');
        else if (fontSize === 'normal') setFontSize('large');
    };

    const decreaseFont = () => {
        if (fontSize === 'large') setFontSize('normal');
        else if (fontSize === 'normal') setFontSize('small');
    };

    const toggleContrast = () => {
        if (contrastMode === 'light') setContrastMode('dark');
        else if (contrastMode === 'dark') setContrastMode('high-contrast');
        else setContrastMode('light');
    };

    const toggleScreenReader = () => {
        setScreenReaderEnabled((prev) => !prev);
    };

    const fontLabel = fontSize === 'small' ? 'A' : fontSize === 'normal' ? 'A' : 'A';

    return (
        <div className="relative z-[100] accessibility-toolbar">
            <div className="bg-[#1a2332] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-end h-9 divide-x divide-white/15">

                            {/* Standard Gov Links */}
                            <div className="hidden lg:flex items-center h-9 px-3 gap-4 text-[11px] font-medium text-slate-300">
                                <a href="#main-content" className="hover:text-white transition-colors">Skip to Main Content</a>
                                <Link to="/sitemap" className="hover:text-white transition-colors">View Sitemap</Link>
                            </div>

                            {/* Theme / Contrast toggle */}
                            <div className="flex items-center px-3 h-9">
                                <span className="hidden md:inline text-[11px] font-medium text-slate-300 mr-2">Change Colorscheme:</span>
                                <button
                                    onClick={toggleContrast}
                                    className="flex items-center gap-1.5 h-7 px-2 rounded hover:bg-white/10 transition-colors text-[11px] font-semibold text-slate-300 hover:text-white"
                                aria-label={`Current theme: ${contrastMode}. Click to change.`}
                                title="Toggle contrast mode"
                            >
                                {contrastMode === 'light' && <Sun size={13} className="text-amber-300" />}
                                {contrastMode === 'dark' && <Moon size={13} className="text-indigo-300" />}
                                {contrastMode === 'high-contrast' && <Type size={13} className="text-white" />}
                                <span className="hidden sm:inline">
                                    {contrastMode === 'light' ? 'Light' : contrastMode === 'dark' ? 'Dark' : 'Hi-Con'}
                                </span>
                                </button>
                            </div>

                            {/* Font Size controls */}
                            <div className="flex items-center h-9 px-3">
                                <span className="hidden md:inline text-[11px] font-medium text-slate-300 mr-2">Accessibility:</span>
                                <button
                                    onClick={increaseFont}
                                    disabled={fontSize === 'large'}
                                    className="flex items-center justify-center w-8 h-9 text-[13px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    aria-label="Increase font size"
                                    title="Increase font size"
                                >
                                    +A
                                </button>
                                <span className="text-[14px] font-black text-white px-1">A</span>
                                <button
                                    onClick={decreaseFont}
                                    disabled={fontSize === 'small'}
                                    className="flex items-center justify-center w-8 h-9 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    aria-label="Decrease font size"
                                    title="Decrease font size"
                                >
                                    -A
                                </button>
                            </div>

                            {/* Screen Reader */}
                            <button
                                onClick={toggleScreenReader}
                                className={`flex items-center gap-1.5 px-3 h-9 text-[11px] font-semibold transition-all ${
                                    screenReaderEnabled
                                        ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15'
                                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                                }`}
                                aria-label={screenReaderEnabled ? 'Disable Screen Reader' : 'Enable Screen Reader'}
                                title="Toggle screen reader mode"
                            >
                                {screenReaderEnabled ? <Ear size={13} /> : <EarOff size={13} />}
                                <span className="hidden sm:inline">Screen Reader</span>
                            </button>

                            {/* Language selector */}
                            <div className="flex items-center">
                                <Globe size={13} className="text-slate-400 ml-3 mr-1.5" />
                                <select
                                    value={locale}
                                    onChange={(e) => setLocale(e.target.value)}
                                    className="appearance-none bg-transparent pr-3 h-9 text-[11px] font-semibold text-slate-300 hover:text-white cursor-pointer focus:outline-none"
                                    aria-label="Select language"
                                >
                                    {LOCALES.map((loc) => (
                                        <option key={loc.code} value={loc.code} className="bg-[#1a2332] text-white">
                                            {loc.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityToolbar;
