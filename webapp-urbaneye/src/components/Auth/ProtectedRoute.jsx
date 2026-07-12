import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { user, loading, isAuthenticated, hasRole } = useAuth();
    const location = useLocation();

    // Wait for auth state to initialize before making access decisions
    if (loading) return null;

    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated but user object hasn't loaded yet, wait
    if (!user) return null;

    if (roles.length > 0 && !hasRole(roles)) {
        // User authenticated but not authorized
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
