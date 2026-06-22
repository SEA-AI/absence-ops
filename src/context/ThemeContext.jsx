import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// SEA.AI product themes (frontend.md): DARK default, LIGHT daytime, NIGHT bridge.
export const THEMES = ['DARK', 'LIGHT', 'NIGHT'];

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return THEMES.includes(saved) ? saved : 'DARK';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-theme', theme);
        root.style.colorScheme = theme === 'LIGHT' ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
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
