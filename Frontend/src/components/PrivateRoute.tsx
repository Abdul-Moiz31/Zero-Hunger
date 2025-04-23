import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user } = useAuth();

  // Simplified access - allow all authenticated users
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}