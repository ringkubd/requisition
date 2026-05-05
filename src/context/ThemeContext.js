import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(false);

    const applyTheme = (isDark) => {
        document.documentElement.classList.toggle('dark', isDark);
        const themeMeta = document.getElementById('theme-color-meta');
        if (themeMeta) {
            themeMeta.content = isDark ? '#0b1220' : '#ffffff';
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = stored === 'dark' || (!stored && prefersDark);
        setDark(isDark);
        applyTheme(isDark);
    }, []);

    const toggle = () => {
        setDark(prev => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            applyTheme(next);
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ dark, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
