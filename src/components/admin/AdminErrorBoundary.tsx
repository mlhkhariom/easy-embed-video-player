
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/services/error-handler';

interface Props {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AdminErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Admin Error Boundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallbackComponent: FallbackComponent } = this.props;

    if (hasError && error) {
      if (FallbackComponent) {
        return <FallbackComponent error={error} resetError={this.resetError} />;
      }

      return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 text-center shadow-xl border">
            <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold">Admin Panel Error</h1>
            <p className="mb-6 text-muted-foreground">
              The admin panel has encountered an unexpected error.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={this.resetError} className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = '/admin')}>
                <Home className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            </div>

            {error && (
              <div className="mt-6 rounded-md bg-red-950/20 p-4 text-left">
                <p className="mb-2 text-sm font-semibold text-red-400">Error details:</p>
                <pre className="overflow-auto text-xs text-red-300">
                  {getUserFriendlyErrorMessage(error)}
                </pre>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-red-400">Stack trace</summary>
                  <pre className="mt-1 overflow-auto text-xs text-red-300 max-h-[200px]">
                    {error.stack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

// This wrapper component allows us to use hooks with the class component
export const AdminErrorBoundary: React.FC<Props> = (props) => {
  return <AdminErrorBoundaryClass {...props} />;
};

export default AdminErrorBoundary;
