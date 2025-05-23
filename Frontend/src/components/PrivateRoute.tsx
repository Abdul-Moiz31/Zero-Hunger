import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// Named function declaration for consistent exports with Fast Refresh
function PrivateRouteComponent({ children, allowedRoles }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard based on role
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }

  // User is authenticated and has appropriate role
  return <>{children}</>;
}

// Export the component with the name 'PrivateRoute'
export const PrivateRoute = PrivateRouteComponent;