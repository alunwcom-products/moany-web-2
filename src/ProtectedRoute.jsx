import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './hooks/AuthContext';

export default function ProtectedRoute() {

  // AuthProvider context
  const { userSession, isLoading, pdateUserSession, checkSession, logout } = useAuth();

  // get location for possible login redirect
  const location = useLocation();

  // wait for session check to finish
  if (isLoading) {
    return <div>Loading session...</div>;
  }

  // if no user is found, redirect to login page
  // 'replace' prop prevents clicking 'back' into a protected area
  return userSession ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
