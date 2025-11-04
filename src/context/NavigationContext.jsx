import { createContext, useContext, useState, useCallback } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
    const [navigationBlocked, setNavigationBlocked] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState(
        "You have unsaved changes. Are you sure you want to leave without saving?"
    );

    const blockNavigation = useCallback((message) => {
        setNavigationBlocked(true);
        if (message) {
            setConfirmMessage(message);
        }
    }, []);

    const unblockNavigation = useCallback(() => {
        setNavigationBlocked(false);
    }, []);

    const confirmNavigation = useCallback(() => {
        if (navigationBlocked) {
            return window.confirm(confirmMessage);
        }
        return true;
    }, [navigationBlocked, confirmMessage]);

    return (
        <NavigationContext.Provider
            value={{
                navigationBlocked,
                blockNavigation,
                unblockNavigation,
                confirmNavigation
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigationBlock() {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigationBlock must be used within a NavigationProvider');
    }
    return context;
}
