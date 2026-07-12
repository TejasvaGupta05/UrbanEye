import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserPlus, Key, Mail, Lock, User, Shield, Briefcase,
    Check, AlertCircle, Loader, Search, Filter, Edit2, Trash2,
    X, RefreshCw, Download, BarChart3, Building, UserCheck, Database, MapPin, Zap
} from 'lucide-react';
import axios from 'axios';
import '../styles/SecretAdmin.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1';

const SecretAdmin = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [secretKey, setSecretKey] = useState('');
    const [authError, setAuthError] = useState('');

    // Data State
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'civilian',
        department: ''
    });

    // Seeder State
    const [seederCity, setSeederCity] = useState('delhi');
    const [seederCount, setSeederCount] = useState(10);
    const [seederLoading, setSeederLoading] = useState(false);
    const [seededReports, setSeededReports] = useState([]);

    const roles = [
        { value: 'civilian', label: 'Civilian', color: '#3b82f6', icon: User },
        { value: 'social_worker', label: 'NGO / Social Worker', color: '#10b981', icon: Shield },
        { value: 'gig_worker', label: 'Gig Worker', color: '#f59e0b', icon: Briefcase },
        { value: 'gov_admin', label: 'Government Admin', color: '#8b5cf6', icon: Shield },
        { value: 'dept_head', label: 'Department Head', color: '#ec4899', icon: Building },
        { value: 'field_officer', label: 'Field Officer', color: '#06b6d4', icon: UserCheck },
        { value: 'super_admin', label: 'Super Admin', color: '#ef4444', icon: Key }
    ];

    const departments = ['Roads', 'Waste', 'Water', 'Electrical', 'General'];

    // Authenticate with secret key
    const handleAuth = async () => {
        setLoading(true);
        setAuthError('');
        try {
            const response = await axios.post(`${API_BASE}/auth/admin/users`, { secret_key: secretKey });
            if (response.data.success) {
                setIsAuthenticated(true);
                setUsers(response.data.users);
                fetchStats();
            }
        } catch (error) {
            setAuthError(error.response?.data?.message || 'Authentication failed');
        }
        setLoading(false);
    };

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/auth/admin/users`, { secret_key: secretKey });
            setUsers(response.data.users);
        } catch (error) {
            showNotification('error', 'Failed to fetch users');
        }
        setLoading(false);
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
            const response = await axios.post(`${API_BASE}/auth/admin/stats`, { secret_key: secretKey });
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    // Create user
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/auth/admin/create-user`, {
                ...formData,
                secret_key: secretKey
            });
            if (response.data.success) {
                showNotification('success', `User "${formData.name}" created successfully!`);
                setShowCreateModal(false);
                resetForm();
                fetchUsers();
                fetchStats();
            }
        } catch (error) {
            showNotification('error', error.response?.data?.message || 'Failed to create user');
        }
        setLoading(false);
    };

    // Update user
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updateData = {
                name: formData.name,
                role: formData.role,
                department: formData.department || null,
                secret_key: secretKey
            };
            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await axios.put(`${API_BASE}/auth/admin/user/${selectedUser.id}`, updateData);
            if (response.data.success) {
                showNotification('success', 'User updated successfully!');
                setShowEditModal(false);
                resetForm();
                fetchUsers();
                fetchStats();
            }
        } catch (error) {
            showNotification('error', error.response?.data?.message || 'Failed to update user');
        }
        setLoading(false);
    };

    // Delete user
    const handleDeleteUser = async () => {
        setLoading(true);
        try {
            const response = await axios.delete(`${API_BASE}/auth/admin/user/${selectedUser.id}`, {
                data: { secret_key: secretKey }
            });
            if (response.data.success) {
                showNotification('success', 'User deleted successfully!');
                setShowDeleteModal(false);
                setSelectedUser(null);
                fetchUsers();
                fetchStats();
            }
        } catch (error) {
            showNotification('error', error.response?.data?.message || 'Failed to delete user');
        }
        setLoading(false);
    };

    // Helpers
    const resetForm = () => {
        setFormData({ email: '', password: '', name: '', role: 'civilian', department: '' });
        setSelectedUser(null);
    };

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            password: '',
            name: user.name,
            role: user.role,
            department: user.department || ''
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const exportUsers = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Name,Email,Role,Department\n"
            + users.map(u => `${u.name},${u.email},${u.role},${u.department || ''}`).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "urbaneye_users.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleInfo = (roleValue) => roles.find(r => r.value === roleValue) || roles[0];

    // Auth Screen
    if (!isAuthenticated) {
        return (
            <div className="admin-auth-container">
                <div className="admin-auth-bg">
                    <div className="auth-pattern"></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-auth-card"
                >
                    <div className="auth-logo">
                        <div className="logo-icon-wrapper">
                            <Shield size={32} />
                        </div>
                        <h1>UrbanEye Admin</h1>
                        <p>Government User Management Portal</p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} className="auth-form">
                        {authError && (
                            <div className="auth-error">
                                <AlertCircle size={18} />
                                {authError}
                            </div>
                        )}
                        <div className="auth-input-group">
                            <Key size={20} />
                            <input
                                type="password"
                                placeholder="Enter Admin Secret Key"
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? <Loader className="spin" size={20} /> : 'Access Admin Panel'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Secured Government Portal • UrbanEye Platform</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Main Admin Panel
    return (
        <div className="admin-container">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`notification-toast ${notification.type}`}
                    >
                        {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="admin-header">
                <div className="header-left">
                    <div className="header-logo">
                        <Shield size={28} />
                        <span>UrbanEye</span>
                    </div>
                    <span className="header-badge">Admin Portal</span>
                </div>
                <div className="header-right">
                    <button className="header-btn" onClick={() => { fetchUsers(); fetchStats(); }}>
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                    <button className="header-btn" onClick={exportUsers}>
                        <Download size={18} />
                        Export
                    </button>
                    <button className="header-btn primary" onClick={() => setShowCreateModal(true)}>
                        <UserPlus size={18} />
                        Add User
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <nav className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <BarChart3 size={18} />
                    Dashboard
                </button>
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} />
                    User Management
                </button>
                <button
                    className={`tab-btn ${activeTab === 'seeder' ? 'active' : ''}`}
                    onClick={() => setActiveTab('seeder')}
                >
                    <Database size={18} />
                    Data Seeder
                </button>
            </nav>

            <main className="admin-main">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && stats && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="dashboard-content"
                    >
                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card total">
                                <div className="stat-icon">
                                    <Users size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.total_users}</span>
                                    <span className="stat-label">Total Users</span>
                                </div>
                            </div>
                            <div className="stat-card new">
                                <div className="stat-icon">
                                    <UserPlus size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.new_users_this_week}</span>
                                    <span className="stat-label">New This Week</span>
                                </div>
                            </div>
                            <div className="stat-card roles">
                                <div className="stat-icon">
                                    <Shield size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{Object.keys(stats.role_distribution).length}</span>
                                    <span className="stat-label">Active Roles</span>
                                </div>
                            </div>
                            <div className="stat-card depts">
                                <div className="stat-icon">
                                    <Building size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{Object.values(stats.department_distribution).reduce((a, b) => a + b, 0)}</span>
                                    <span className="stat-label">Dept. Assigned</span>
                                </div>
                            </div>
                        </div>

                        {/* Role Distribution */}
                        <div className="chart-section">
                            <h3>Role Distribution</h3>
                            <div className="role-bars">
                                {Object.entries(stats.role_distribution).map(([role, count]) => {
                                    const roleInfo = getRoleInfo(role);
                                    const percentage = stats.total_users > 0 ? (count / stats.total_users) * 100 : 0;
                                    return (
                                        <div key={role} className="role-bar-item">
                                            <div className="role-bar-header">
                                                <span className="role-name">{roleInfo.label}</span>
                                                <span className="role-count">{count}</span>
                                            </div>
                                            <div className="role-bar-track">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 0.8, delay: 0.1 }}
                                                    className="role-bar-fill"
                                                    style={{ backgroundColor: roleInfo.color }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
                            <h3>Quick Actions</h3>
                            <div className="actions-grid">
                                <button className="action-card" onClick={() => { setFormData({ ...formData, role: 'civilian' }); setShowCreateModal(true); }}>
                                    <User size={24} />
                                    <span>Add Civilian</span>
                                </button>
                                <button className="action-card" onClick={() => { setFormData({ ...formData, role: 'gov_admin' }); setShowCreateModal(true); }}>
                                    <Shield size={24} />
                                    <span>Add Admin</span>
                                </button>
                                <button className="action-card" onClick={() => { setFormData({ ...formData, role: 'field_officer' }); setShowCreateModal(true); }}>
                                    <UserCheck size={24} />
                                    <span>Add Officer</span>
                                </button>
                                <button className="action-card" onClick={() => setActiveTab('users')}>
                                    <Users size={24} />
                                    <span>Manage All</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="users-content"
                    >
                        {/* Filters */}
                        <div className="users-toolbar">
                            <div className="search-box">
                                <Search size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="filter-box">
                                <Filter size={18} />
                                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                    <option value="all">All Roles</option>
                                    {roles.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>
                            <span className="users-count">{filteredUsers.length} users</span>
                        </div>

                        {/* Users Table */}
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => {
                                        const roleInfo = getRoleInfo(user.role);
                                        return (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className="user-cell">
                                                        <div className="user-avatar" style={{ backgroundColor: roleInfo.color }}>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="user-details">
                                                            <span className="user-name">{user.name}</span>
                                                            <span className="user-email">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="role-badge" style={{ backgroundColor: `${roleInfo.color}20`, color: roleInfo.color, borderColor: roleInfo.color }}>
                                                        {roleInfo.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="dept-text">{user.department || '—'}</span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="icon-btn edit" onClick={() => openEditModal(user)} title="Edit User">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button className="icon-btn delete" onClick={() => openDeleteModal(user)} title="Delete User">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="empty-state">
                                    <Users size={48} />
                                    <p>No users found</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Seeder Tab */}
                {activeTab === 'seeder' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="seeder-content"
                    >
                        <div className="seeder-card">
                            <div className="seeder-header">
                                <Database size={32} />
                                <h2>Data Seeder</h2>
                                <p>Generate random civic reports for testing</p>
                            </div>

                            <div className="seeder-form">
                                <div className="seeder-option">
                                    <label><MapPin size={18} /> Select City</label>
                                    <div className="city-buttons">
                                        <button
                                            className={`city-btn ${seederCity === 'delhi' ? 'active' : ''}`}
                                            onClick={() => setSeederCity('delhi')}
                                        >
                                            <span className="city-icon">🏛️</span>
                                            Delhi
                                        </button>
                                        <button
                                            className={`city-btn ${seederCity === 'gwalior' ? 'active' : ''}`}
                                            onClick={() => setSeederCity('gwalior')}
                                        >
                                            <span className="city-icon">🏰</span>
                                            Gwalior
                                        </button>
                                    </div>
                                </div>

                                <div className="seeder-option">
                                    <label><Zap size={18} /> Number of Reports</label>
                                    <div className="count-selector">
                                        {[5, 10, 20, 30, 50].map(num => (
                                            <button
                                                key={num}
                                                className={`count-btn ${seederCount === num ? 'active' : ''}`}
                                                onClick={() => setSeederCount(num)}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    className="seed-button"
                                    onClick={async () => {
                                        setSeederLoading(true);
                                        try {
                                            const response = await axios.post(`${API_BASE}/auth/admin/seed-reports`, {
                                                secret_key: secretKey,
                                                city: seederCity,
                                                count: seederCount
                                            });
                                            if (response.data.success) {
                                                showNotification('success', response.data.message);
                                                setSeededReports(prev => [...response.data.reports, ...prev].slice(0, 20));
                                            }
                                        } catch (error) {
                                            showNotification('error', error.response?.data?.message || 'Failed to seed data');
                                        }
                                        setSeederLoading(false);
                                    }}
                                    disabled={seederLoading}
                                >
                                    {seederLoading ? (
                                        <><Loader className="spin" size={20} /> Generating...</>
                                    ) : (
                                        <><Database size={20} /> Generate {seederCount} Reports in {seederCity.charAt(0).toUpperCase() + seederCity.slice(1)}</>
                                    )}
                                </button>
                            </div>

                            {seededReports.length > 0 && (
                                <div className="seeded-results">
                                    <h4>Recently Seeded Reports</h4>
                                    <div className="seeded-list">
                                        {seededReports.map((report, idx) => (
                                            <div key={idx} className="seeded-item">
                                                <span className={`category-badge cat-${report.category}`}>
                                                    {report.category}
                                                </span>
                                                <span className="location-text">
                                                    {report.city.charAt(0).toUpperCase() + report.city.slice(1)} ({report.lat.toFixed(4)}, {report.lng.toFixed(4)})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Create User Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2><UserPlus size={24} /> Create New User</h2>
                                <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateUser} className="modal-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        {roles.map(role => (
                                            <option key={role.value} value={role.value}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>
                                {['dept_head', 'field_officer'].includes(formData.role) && (
                                    <div className="form-group">
                                        <label>Department</label>
                                        <select
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? <Loader className="spin" size={18} /> : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit User Modal */}
            <AnimatePresence>
                {showEditModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2><Edit2 size={24} /> Edit User</h2>
                                <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateUser} className="modal-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="disabled"
                                    />
                                    <small>Email cannot be changed</small>
                                </div>
                                <div className="form-group">
                                    <label>New Password (optional)</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Leave empty to keep current"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        {roles.map(role => (
                                            <option key={role.value} value={role.value}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>
                                {['dept_head', 'field_officer'].includes(formData.role) && (
                                    <div className="form-group">
                                        <label>Department</label>
                                        <select
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? <Loader className="spin" size={18} /> : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content delete-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="delete-icon">
                                <Trash2 size={32} />
                            </div>
                            <h2>Delete User</h2>
                            <p>Are you sure you want to delete <strong>{selectedUser.name}</strong>?</p>
                            <p className="warning-text">This action cannot be undone.</p>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button type="button" className="btn-danger" onClick={handleDeleteUser} disabled={loading}>
                                    {loading ? <Loader className="spin" size={18} /> : 'Delete User'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default SecretAdmin;
