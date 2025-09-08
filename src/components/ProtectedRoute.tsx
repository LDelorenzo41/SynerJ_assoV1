import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthNew } from '../hooks/useAuthNew';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter';
  allowedRoles?: Array<'Super Admin' | 'Club Admin' | 'Member' | 'Supporter'>;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, profile, loading } = useAuthNew();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}