
import { useEffect } from 'react';

interface ScriptProps {
  src: string;
  async?: boolean;
  defer?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const Script = ({ src, async = true, defer = false, onLoad, onError }: ScriptProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    
    if (onLoad) {
      script.onload = onLoad;
    }
    
    if (onError) {
      script.onerror = onError;
    }
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [src, async, defer, onLoad, onError]);
  
  return null;
};
