import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (t) => {
            root.classList.remove('light-theme', 'dark-theme');
            let themeToApply = t;

            if (t === 'system') {
                const mq = window.matchMedia('(prefers-color-scheme: dark)');
                themeToApply = mq.matches ? 'dark' : 'light';
                console.log(`[Theme] System preference detected: ${themeToApply} (matches: ${mq.matches})`);
            }

            const themeClass = `${themeToApply}-theme`;
            root.classList.add(themeClass);
            root.style.colorScheme = themeToApply;
            console.log(`[Theme] Applied ${themeClass} to documentRoot`);
        };

        applyTheme(theme);
        localStorage.setItem('theme', theme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            console.log('[Theme] System theme change detected');
            if (theme === 'system') applyTheme('system');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
