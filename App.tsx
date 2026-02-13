import { ReactNode } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { PendingVerify } from './pages/PendingVerify';
import { Dashboard } from './pages/admin/Dashboard';
import { Recipes } from './pages/admin/Recipes';
import { MenuPlanner } from './pages/admin/MenuPlanner';
import { Users } from './pages/admin/Users';
import { Categories } from './pages/admin/Categories';
import { Roles } from './pages/admin/Roles';
import { Reports } from './pages/admin/Reports';
import { Notifications } from './pages/admin/Notifications';
import { SurveyManager } from './pages/admin/SurveyManager'; // Import Admin Survey Manager
import { StudentDashboard } from './pages/student/StudentDashboard';
import { OrderFlow } from './pages/student/OrderFlow';
import { SurveyForm } from './pages/student/SurveyForm'; // Import Student Survey Form

const PrivateRoute = ({ children, roles }: { children?: ReactNode, roles: string[] }) => {
  const { user } = useAuth();
  
  // 1. Check Authentication
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Middleware: Check Email Verification
  // We allow Admins to bypass because they are demo accounts or manually set
  if (!user.emailVerified) {
    return <Navigate to="/pending-verify" replace />;
  }

  // 3. Check Role Permission
  if (!roles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? "/admin/dashboard" : "/student/dashboard"} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const ORDERING_ROLES = ['student', 'teacher', 'staff', 'visitor'];

  const getHomeRedirect = () => {
    if (!user) return "/login";
    if (!user.emailVerified) return "/pending-verify";
    return user.role === 'admin' ? "/admin/dashboard" : "/student/dashboard";
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to={getHomeRedirect()} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={getHomeRedirect()} />} />
      <Route path="/verify" element={<VerifyEmail />} />
      
      {/* Semi-Protected (Authenticated but Unverified) */}
      <Route path="/pending-verify" element={
        user && !user.emailVerified ? <PendingVerify /> : <Navigate to={getHomeRedirect()} />
      } />
      
      {/* Protected Admin Routes */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute roles={['admin']}>
          <Layout><Dashboard /></Layout>
        </PrivateRoute>
      } />
      <Route path="/admin/reports" element={
        <PrivateRoute roles={['admin']}>
          <Layout><Reports /></Layout>
        </PrivateRoute>
      } />
      <Route path="/admin/recipes" element={
        <PrivateRoute roles={['admin']}>
          <Layout><Recipes /></Layout>
        </PrivateRoute>
      } />
      <Route path="/admin/categories" element={
        <PrivateRoute roles={['admin']}>
          <Layout><Categories /></Layout>
        </PrivateRoute>
      } />
      <Route path="/admin/menu" element={
        <PrivateRoute roles={['admin']}>
          <Layout><MenuPlanner /></Layout>
        </PrivateRoute>
      } />
      <Route path="/admin/users" element={
        <PrivateRoute roles={['admin']}>
          <Layout><Users /></Layout>
        </PrivateRoute>
      } />
      <Route path="/admin/roles" element={
        <PrivateRoute roles={['admin']}>
          <Layout><Roles /></Layout>
        </PrivateRoute>
      } />
      <Route path="/admin/notifications" element={
        <PrivateRoute roles={['admin']}>
          <Layout><Notifications /></Layout>
        </PrivateRoute>
      } />
      <Route path="/admin/surveys" element={
        <PrivateRoute roles={['admin']}>
          <Layout><SurveyManager /></Layout>
        </PrivateRoute>
      } />

      {/* Protected Student Routes (Now accessible by Teacher, Staff, Visitor) */}
      <Route path="/student/dashboard" element={
        <PrivateRoute roles={ORDERING_ROLES}>
          <Layout><StudentDashboard /></Layout>
        </PrivateRoute>
      } />
      <Route path="/student/order/:date" element={
        <PrivateRoute roles={ORDERING_ROLES}>
          <Layout><OrderFlow /></Layout>
        </PrivateRoute>
      } />
      <Route path="/student/survey" element={
        <PrivateRoute roles={ORDERING_ROLES}>
          <Layout><SurveyForm /></Layout>
        </PrivateRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}