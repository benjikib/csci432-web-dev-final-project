import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../services/userApi';

/**
 * ProtectedRoute component that checks authentication before rendering children
 * Redirects to /login if user is not authenticated
 * Redirects to /organization-deleted if user's organization was deleted
 */
export default function ProtectedRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
    const [organizationDeleted, setOrganizationDeleted] = useState(false);
    const location = useLocation();

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await getCurrentUser();
                if (response && response.user) {
                    setIsAuthenticated(true);
                    
                    // Check if user had an organization that was deleted
                    // User will have no organizationId but also won't be a super-admin
                    const isSuperAdmin = response.user.roles?.includes('super-admin');
                    const hasNoOrg = !response.user.organizationId;
                    
                    // Allow access to payment and setup pages without organization
                    const isPaymentOrSetupPage = location.pathname === '/organization/payment' || 
                                                (location.pathname.startsWith('/organization/') && location.pathname.includes('/setup'));
                    
                    // If user has no organization and isn't a super-admin, they need to join/create org
                    // But allow them to access payment and setup pages
                    if (hasNoOrg && !isSuperAdmin && !isPaymentOrSetupPage && location.pathname !== '/organization-deleted') {
                        setOrganizationDeleted(true);
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
            }
        }
        checkAuth();
    }, [location.pathname]);

    // While checking authentication, show nothing (or could show a loader)
    if (isAuthenticated === null) {
        return null;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If organization was deleted and not already on the org-deleted page, redirect
    // But allow access to payment and setup pages
    const isPaymentOrSetupPage = location.pathname === '/organization/payment' || 
                                (location.pathname.startsWith('/organization/') && location.pathname.includes('/setup'));
    
    if (organizationDeleted && location.pathname !== '/organization-deleted' && !isPaymentOrSetupPage) {
        return <Navigate to="/organization-deleted" replace />;
    }

    // If authenticated, render the children
    return children;
}
