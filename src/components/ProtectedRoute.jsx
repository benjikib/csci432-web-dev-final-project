import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, hasRole, hasPermission } from '../services/userApi';

/**
 * ProtectedRoute component that checks if user has required role or permission
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string} props.requiredRole - Required role (optional)
 * @param {string} props.requiredPermission - Required permission (optional)
 * @param {Function} props.customCheck - Custom authorization function (userData) => boolean (optional)
 * @param {string} props.fallbackPath - Path to redirect to if not authorized (default: '/unauthorized')
 */
export default function ProtectedRoute({
    children,
    requiredRole = null,
    requiredPermission = null,
    customCheck = null,
    fallbackPath = '/unauthorized'
}) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        async function checkAuthorization() {
            try {
                const userData = await getCurrentUser();
                console.log('ProtectedRoute - User data:', userData);
                console.log('ProtectedRoute - Required role:', requiredRole);
                console.log('ProtectedRoute - User roles:', userData?.roles);

                // Check if user meets requirements
                let isAuthorized = true;

                // If custom check function is provided, use it
                if (customCheck) {
                    isAuthorized = customCheck(userData);
                    console.log('ProtectedRoute - Custom check result:', isAuthorized);
                } else {
                    // Otherwise use role/permission checks
                    if (requiredRole) {
                        isAuthorized = hasRole(userData, requiredRole);
                        console.log('ProtectedRoute - Has required role?', isAuthorized);
                    }

                    if (requiredPermission && isAuthorized) {
                        isAuthorized = hasPermission(userData, requiredPermission);
                        console.log('ProtectedRoute - Has required permission?', isAuthorized);
                    }
                }

                console.log('ProtectedRoute - Final authorization:', isAuthorized);
                setAuthorized(isAuthorized);
            } catch (error) {
                console.error('Authorization check failed:', error);
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        }

        checkAuthorization();
    }, [requiredRole, requiredPermission, customCheck]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FEF9] dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-darker-green dark:border-lighter-green mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!authorized) {
        return <Navigate to={fallbackPath} replace />;
    }

    return children;
}
