import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import DonorDashboard from '@/components/dashboard/DonorDashboard';
import NGODashboard from '@/components/dashboard/NGODashboard';
import VolunteerDashboard from '@/components/dashboard/VolunteerDashboard';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to={`/${user.role}-dashboard`} replace /> : <LoginPage />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to={`/${user.role}-dashboard`} replace /> : <SignupPage />} 
      />

      {/* Protected Routes */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor-dashboard"
        element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo-dashboard"
        element={
          <ProtectedRoute allowedRoles={['ngo']}>
            <NGODashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer-dashboard"
        element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Redirect root to appropriate dashboard or login */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={`/${user.role}-dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
} 