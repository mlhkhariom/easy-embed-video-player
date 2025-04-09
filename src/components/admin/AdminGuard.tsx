
import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import AdminErrorBoundary from './AdminErrorBoundary';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAuthenticated, checkAuthentication } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setError(null);
        // If checkAuthentication exists, call it to verify admin auth status
        if (typeof checkAuthentication === 'function') {
          await checkAuthentication();
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Authentication check failed'));
        toast({
          title: "Authentication Error",
          description: "Failed to verify admin credentials",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [checkAuthentication, toast]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="text-center text-xl font-bold">Authentication Error</h2>
          <p className="mt-2 text-center text-muted-foreground">{error.message}</p>
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin/login'}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <AdminErrorBoundary>{children}</AdminErrorBoundary>;
};

export default AdminGuard;
