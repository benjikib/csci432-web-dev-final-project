import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Check localStorage for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });

    // Initialize theme on mount
    useEffect(() => {
        // Apply theme to document root immediately on mount
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.style.backgroundColor = '#111827';
        } else {
            document.documentElement.classList.remove('dark');
            document.body.style.backgroundColor = '#F8FEF9';
        }
    }, []);

    useEffect(() => {
        // Save theme preference to localStorage
        localStorage.setItem('theme', theme);

        // Apply theme to document root
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.style.backgroundColor = '#111827';
        } else {
            document.documentElement.classList.remove('dark');
            document.body.style.backgroundColor = '#F8FEF9';
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
