import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import SuspenseFallback from '@/pages/Suspense';

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children, restricted = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Get the intended destination from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Show loading state while checking authentication
  if (isLoading) {
    return <SuspenseFallback />;
  }

  // If route is restricted and user is authenticated, redirect to intended destination
  if (restricted && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Render children for public routes
  return <>{children}</>;
};

export default PublicRoute; 