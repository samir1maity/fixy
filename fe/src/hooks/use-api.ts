import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function useApi<T>(defaultOptions: UseApiOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const { toast } = useToast();

  const execute = useCallback(
    async <R = T>(
      apiCall: () => Promise<R>,
      options?: UseApiOptions
    ): Promise<R | null> => {
      const mergedOptions = { ...defaultOptions, ...options };
      
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await apiCall();
        
        setState({
          data: result as unknown as T,
          loading: false,
          error: null,
        });
        
        if (mergedOptions.showSuccessToast) {
          toast({
            title: 'Success',
            description: mergedOptions.successMessage || 'Operation completed successfully',
            variant: 'default',
          });
        }
        
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        
        setState({
          data: null,
          loading: false,
          error: errorObj,
        });
        
        if (mergedOptions.showErrorToast) {
          toast({
            title: 'Error',
            description: mergedOptions.errorMessage || errorObj.message,
            variant: 'destructive',
          });
        }
        
        return null;
      }
    },
    [toast, defaultOptions]
  );

  return {
    ...state,
    execute,
    reset: useCallback(() => {
      setState({
        data: null,
        loading: false,
        error: null,
      });
    }, []),
  };
} 