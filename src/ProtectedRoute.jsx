import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './hooks/AuthContext';

export default function ProtectedRoute() {
  // AuthProvider context
  const { userSession, isLoading } = useAuth();

  // const navigate = useNavigate();
  const location = useLocation();

  // 1. Wait for the session check to finish before making a decision
  if (isLoading) {
    return <div>Loading session...</div>;
  }

  // 2. If no user is found, redirect them to the login page
  // The 'replace' prop prevents them from clicking 'back' into a protected area
  return userSession ? (
    <Outlet /> 
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
