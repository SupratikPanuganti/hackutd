import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  requireAuth = true,
}: ProtectedRouteProps) => {
  const { user, isLoading } = useUser();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect admin-only routes to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
