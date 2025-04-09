
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { errorToast, getUserFriendlyErrorMessage } from '../services/error-handler';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorHandlerProps {
  error: unknown;
  resetError?: () => void;
  inline?: boolean;
  title?: string;
}

const ErrorHandler = ({ error, resetError, inline = false, title = "An error occurred" }: ErrorHandlerProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (error && !inline) {
      const errorMessage = errorToast(error);
      toast({
        title,
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [error, toast, inline, title]);

  if (!error || !inline) return null;

  return (
    <div className="rounded-md bg-destructive/10 p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-destructive">{title}</h3>
          <div className="mt-2 text-sm">
            <p>{getUserFriendlyErrorMessage(error)}</p>
          </div>
          {resetError && (
            <div className="mt-4">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={resetError}
                className="bg-destructive/10 hover:bg-destructive/20 text-destructive"
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

export default ErrorHandler;
