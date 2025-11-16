import { createContext, useContext, useState, useEffect } from 'react';
import { getUserSettings } from '../services/userApi';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    const [isLoading, setIsLoading] = useState(true);

    // Function to fetch and apply theme from backend
    const fetchTheme = async (isInitialLoad = false) => {
        try {
            // Check if user is authenticated
            const token = localStorage.getItem('token');
            if (token) {
                const response = await getUserSettings();
                if (response.success && response.settings.theme) {
                    const newTheme = response.settings.theme;
                    setTheme(newTheme);

                    // Apply theme immediately to DOM (for faster feedback)
                    if (newTheme === 'dark') {
                        document.documentElement.classList.add('dark');
                        document.body.style.backgroundColor = '#111827';
                    } else {
                        document.documentElement.classList.remove('dark');
                        document.body.style.backgroundColor = '#F8FEF9';
                    }
                }
            } else if (isInitialLoad) {
                // Only set default on initial load if no token
                setTheme('light');
            }
        } catch (error) {
            console.error('Error fetching theme from backend:', error);
            // Only fall back to light theme on initial load
            if (isInitialLoad) {
                setTheme('light');
            }
        } finally {
            if (isInitialLoad) {
                setIsLoading(false);
            }
        }
    };

    // Fetch theme from backend on mount
    useEffect(() => {
        fetchTheme(true);
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
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isLoading, refetchSettings: fetchTheme }}>
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
