import { createContext, useContext, useState, useEffect } from 'react';
import { getUserSettings } from '../services/userApi';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch theme from backend on mount
    useEffect(() => {
        const fetchTheme = async () => {
            try {
                // Check if user is authenticated
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await getUserSettings();
                    if (response.success && response.settings.theme) {
                        setTheme(response.settings.theme);
                    }
                }
            } catch (error) {
                console.error('Error fetching theme from backend:', error);
                // Fall back to light theme if fetch fails
                setTheme('light');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTheme();
    }, []);

    useEffect(() => {
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
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isLoading }}>
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
