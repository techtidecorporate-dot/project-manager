import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Normalize roles to an array
    const roles = allowedRoles || (requiredRole ? [requiredRole] : null);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#e8eae3]">
                <div className="relative w-24 h-24">
                    <div className="absolute top-0 left-0 w-full h-full border-2 border-[#fa2742]/20 rounded-[32px]"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-[#fa2742] rounded-[32px] border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
