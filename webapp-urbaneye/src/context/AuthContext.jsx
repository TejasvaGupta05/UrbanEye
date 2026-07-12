import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser({ ...decoded, ...JSON.parse(localStorage.getItem('user_data') || '{}') });
                    // Set default axios header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
                email,
                password
            });

            const { access_token, user: userData } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user_data', JSON.stringify(userData));

            const mergedUser = { ...jwtDecode(access_token), ...userData };
            setToken(access_token);
            setUser(mergedUser);

            return { success: true, user: mergedUser };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    // Google OAuth login
    const googleLogin = async (credentialResponse) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${API_URL}/api/v1/auth/google`, {
                credential: credentialResponse.credential
            });

            const { access_token, user: userData } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user_data', JSON.stringify(userData));

            const mergedUser = { ...jwtDecode(access_token), ...userData };
            setToken(access_token);
            setUser(mergedUser);

            return { success: true, user: mergedUser };
        } catch (error) {
            console.error('Google login failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Google login failed'
            };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${API_URL}/api/v1/auth/signup`, {
                name,
                email,
                password
            });
            return { success: true };
        } catch (error) {
            console.error('Signup failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Signup failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const isAuthenticated = () => !!token;

    const hasRole = (allowedRoles) => {
        if (!user) return false;
        if (!allowedRoles || allowedRoles.length === 0) return true;

        // Handle array or single string
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        return roles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, googleLogin, signup, logout, isAuthenticated, hasRole }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
