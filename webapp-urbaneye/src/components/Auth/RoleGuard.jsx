import { useAuth } from '../../context/AuthContext';

const RoleGuard = ({ children, roles = [], fallback = null }) => {
    const { hasRole } = useAuth();

    if (hasRole(roles)) {
        return children;
    }

    return fallback;
};

export default RoleGuard;
