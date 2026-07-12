import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
    return useContext(AccessibilityContext);
};

export const AccessibilityProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState('normal'); // 'small', 'normal', 'large'
    const [contrastMode, setContrastMode] = useState('light'); // 'light', 'dark', 'high-contrast'
    const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
    const utteranceRef = useRef(null);
    const lastSpoken = useRef('');

    // Load saved preferences
    useEffect(() => {
        const savedFontSize = localStorage.getItem('accessibility_fontSize');
        const savedContrast = localStorage.getItem('accessibility_contrastMode');
        const savedScreenReader = localStorage.getItem('accessibility_screenReader');

        if (savedFontSize) setFontSize(savedFontSize);
        if (savedContrast) setContrastMode(savedContrast);
        if (savedScreenReader) setScreenReaderEnabled(savedScreenReader === 'true');
    }, []);

    // ─── speak helper ────────────────────────────────
    const speak = useCallback((text) => {
        if (!text || !window.speechSynthesis) return;

        const clean = text.replace(/\s+/g, ' ').trim();
        if (!clean || clean.length < 2) return;

        // Don't repeat the same thing
        if (clean === lastSpoken.current) return;
        lastSpoken.current = clean;

        // Cancel anything currently speaking
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(clean);
        utter.rate = 1;
        utter.pitch = 1;
        utter.volume = 1;
        utter.lang = 'en-IN';

        // Try to pick a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google'));
        if (preferred) utter.voice = preferred;

        utteranceRef.current = utter;
        window.speechSynthesis.speak(utter);
    }, []);

    const stopSpeaking = useCallback(() => {
        window.speechSynthesis.cancel();
        lastSpoken.current = '';
    }, []);

    // ─── Screen Reader: focus + hover listeners ─────
    useEffect(() => {
        if (!screenReaderEnabled) {
            stopSpeaking();
            return;
        }

        // Announce activation
        speak('Screen reader activated. Hover or tab onto elements to hear them.');

        const getReadableText = (el) => {
            // Priority: aria-label > aria-labelledby > alt > textContent
            if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');

            const labelledBy = el.getAttribute('aria-labelledby');
            if (labelledBy) {
                const labelEl = document.getElementById(labelledBy);
                if (labelEl) return labelEl.textContent;
            }

            if (el.tagName === 'IMG' && el.alt) return `Image: ${el.alt}`;
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                const label = el.labels?.[0]?.textContent || el.placeholder || el.name || '';
                const type = el.type || 'text';
                return `${label} ${type} field${el.value ? ', value: ' + el.value : ''}`;
            }
            if (el.tagName === 'SELECT') {
                const label = el.labels?.[0]?.textContent || '';
                const selected = el.options?.[el.selectedIndex]?.text || '';
                return `${label} dropdown, selected: ${selected}`;
            }
            if (el.tagName === 'BUTTON' || el.role === 'button') {
                return `Button: ${el.textContent?.trim() || 'unlabeled'}`;
            }
            if (el.tagName === 'A') {
                return `Link: ${el.textContent?.trim() || el.href || 'unlabeled'}`;
            }

            // Get visible text, cap at 200 chars
            const text = el.textContent?.trim() || '';
            return text.length > 200 ? text.slice(0, 200) + '...' : text;
        };

        const handleFocus = (e) => {
            const text = getReadableText(e.target);
            if (text) speak(text);
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            // Only read interactive elements and headings on hover
            const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'H1', 'H2', 'H3', 'H4', 'LABEL'];
            const isInteractive = interactiveTags.includes(target.tagName)
                || target.role === 'button'
                || target.role === 'link'
                || target.getAttribute('tabindex');

            if (isInteractive) {
                const text = getReadableText(target);
                if (text) speak(text);
            }
        };

        const handleClick = (e) => {
            const target = e.target;
            const text = getReadableText(target);
            if (text) speak(text);
        };

        // Attach listeners
        document.addEventListener('focusin', handleFocus, true);
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('click', handleClick, true);

        // Ensure voices are loaded
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => { };
        }

        return () => {
            document.removeEventListener('focusin', handleFocus, true);
            document.removeEventListener('mouseover', handleMouseOver, true);
            document.removeEventListener('click', handleClick, true);
            stopSpeaking();
        };
    }, [screenReaderEnabled, speak, stopSpeaking]);

    // Apply global classes/styles based on state
    useEffect(() => {
        const root = document.documentElement;

        // Reset classes
        root.classList.remove('font-size-small', 'font-size-large', 'dark', 'contrast-high', 'screen-reader-mode');

        // Apply Font Size
        if (fontSize === 'small') {
            root.classList.add('font-size-small');
        } else if (fontSize === 'large') {
            root.classList.add('font-size-large');
        }

        // Apply Contrast
        if (contrastMode === 'dark') {
            root.classList.add('dark');
        } else if (contrastMode === 'high-contrast') {
            root.classList.add('contrast-high');
        }

        // Apply Screen Reader Focus Mode
        if (screenReaderEnabled) {
            root.classList.add('screen-reader-mode');
        }

        // Save to localStorage
        localStorage.setItem('accessibility_fontSize', fontSize);
        localStorage.setItem('accessibility_contrastMode', contrastMode);
        localStorage.setItem('accessibility_screenReader', screenReaderEnabled);
    }, [fontSize, contrastMode, screenReaderEnabled]);

    return (
        <AccessibilityContext.Provider value={{
            fontSize, setFontSize,
            contrastMode, setContrastMode,
            screenReaderEnabled, setScreenReaderEnabled,
            speak, stopSpeaking
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
};
