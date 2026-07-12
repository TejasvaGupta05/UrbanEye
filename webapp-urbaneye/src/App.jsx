import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './Layout';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookService from './pages/BookService';
import RequestNGOHelp from './pages/RequestNGOHelp';
import SecretAdmin from './pages/SecretAdmin';
import SuperAdminDashboard from './components/Dashboard/SuperAdminDashboard';
import GovAdminDashboard from './components/Dashboard/GovAdminDashboard';
import DeptHeadDashboard from './components/Dashboard/DeptHeadDashboard';
import FieldOfficerDashboard from './components/Dashboard/FieldOfficerDashboard';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import Chatbot from './components/Chatbot';
import AICommandCenter from './pages/AICommandCenter';
import SmartMeterDashboard from './pages/SmartMeterDashboard';
import EmergencyMode from './pages/EmergencyMode';
import SmartCityDevices from './pages/SmartCityDevices';
import GovIntegration from './pages/GovIntegration';
import ElectricityDepartment from './pages/ElectricityDepartment';
import GasDepartment from './pages/GasDepartment';
import WaterDepartment from './pages/WaterDepartment';
import Sitemap from './pages/Sitemap';

import AccessibilityToolbar from './components/AccessibilityToolbar';

function App() {
    return (
        <AuthProvider>
            <AccessibilityToolbar />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/secret-admin" element={<SecretAdmin />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Standalone Super Admin Dashboard - No Layout/Navbar */}
                <Route
                    path="/super-admin-dashboard"
                    element={
                        <ProtectedRoute roles={['super_admin']}>
                            <SuperAdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Standalone Gov Admin Dashboard - No Layout/Navbar */}
                <Route
                    path="/gov-admin-dashboard"
                    element={
                        <ProtectedRoute roles={['gov_admin']}>
                            <GovAdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Dept Head Dashboard */}
                <Route
                    path="/dept-head-dashboard"
                    element={
                        <ProtectedRoute roles={['dept_head']}>
                            <DeptHeadDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Field Officer Dashboard */}
                <Route
                    path="/field-officer-dashboard"
                    element={
                        <ProtectedRoute roles={['field_officer']}>
                            <FieldOfficerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute roles={['civilian', 'social_worker', 'gig_worker', 'gov_admin', 'dept_head', 'field_officer', 'super_admin']}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Standalone Analyze Page - No Layout/Navbar */}
                <Route
                    path="/analyze"
                    element={
                        <ProtectedRoute roles={['civilian', 'gov_admin', 'super_admin', 'gig_worker', 'social_worker']}>
                            <Analyze />
                        </ProtectedRoute>
                    }
                />

                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="sitemap" element={<Sitemap />} />

                    <Route
                        path="book"
                        element={
                            <ProtectedRoute roles={['civilian', 'super_admin']}>
                                <BookService />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="ngo-help"
                        element={
                            <ProtectedRoute roles={['civilian', 'super_admin']}>
                                <RequestNGOHelp />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Protected Feature Pages - Login required */}
                <Route
                    path="/ai-command-center"
                    element={
                        <ProtectedRoute roles={['gov_admin', 'super_admin', 'dept_head', 'field_officer', 'civilian', 'gig_worker', 'social_worker']}>
                            <AICommandCenter />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/smart-meters"
                    element={
                        <ProtectedRoute roles={['gov_admin', 'super_admin', 'dept_head', 'field_officer', 'civilian', 'gig_worker', 'social_worker']}>
                            <SmartMeterDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/emergency-mode"
                    element={
                        <ProtectedRoute roles={['gov_admin', 'super_admin', 'dept_head', 'field_officer', 'civilian', 'gig_worker', 'social_worker']}>
                            <EmergencyMode />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/smart-city-devices"
                    element={
                        <ProtectedRoute roles={['gov_admin', 'super_admin', 'dept_head', 'field_officer', 'civilian', 'gig_worker', 'social_worker']}>
                            <SmartCityDevices />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/gov-integration"
                    element={
                        <ProtectedRoute roles={['gov_admin', 'super_admin', 'dept_head', 'field_officer', 'civilian', 'gig_worker', 'social_worker']}>
                            <GovIntegration />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/electricity"
                    element={
                        <ProtectedRoute roles={['gov_admin', 'super_admin', 'dept_head', 'field_officer', 'civilian', 'gig_worker', 'social_worker']}>
                            <ElectricityDepartment />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/gas"
                    element={
                        <ProtectedRoute roles={['gov_admin', 'super_admin', 'dept_head', 'field_officer', 'civilian', 'gig_worker', 'social_worker']}>
                            <GasDepartment />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/water"
                    element={
                        <ProtectedRoute roles={['gov_admin', 'super_admin', 'dept_head', 'field_officer', 'civilian', 'gig_worker', 'social_worker']}>
                            <WaterDepartment />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Chatbot />
        </AuthProvider>
    );
}

export default App;
