
import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getUserFriendlyErrorMessage } from '@/services/error-handler';
import { Button } from '../ui/button';

interface AdminErrorHandlerProps {
  error: Error | null;
  resetError?: () => void;
  showInline?: boolean;
}

const AdminErrorHandler: React.FC<AdminErrorHandlerProps> = ({ 
  error, 
  resetError,
  showInline = false
}) => {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      
      toast({
        title: "Admin Panel Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // If there's no error or we don't want inline display, don't render anything
  if (!error || !showInline) return null;

  return (
    <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            An error occurred
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{getUserFriendlyErrorMessage(error)}</p>
            {error.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-red-600 dark:text-red-400">
                  Technical details
                </summary>
                <pre className="mt-1 whitespace-pre-wrap text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto max-h-[200px]">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
          {resetError && (
            <div className="mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={resetError}
                className="text-red-800 bg-red-50 hover:bg-red-100 border-red-300 dark:text-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminErrorHandler;
