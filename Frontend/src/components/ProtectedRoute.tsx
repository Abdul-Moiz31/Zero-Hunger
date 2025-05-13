import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!user) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 