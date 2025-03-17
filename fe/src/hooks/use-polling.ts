import { useState, useEffect, useRef } from 'react';

interface PollingOptions {
  interval?: number;
  maxAttempts?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onMaxAttemptsReached?: () => void;
}

export function usePolling<T>(
  fetchFunction: () => Promise<T>,
  options: PollingOptions = {}
) {
  const {
    interval = 5000,
    maxAttempts = 60, // 5 minutes by default (60 * 5s)
    onSuccess,
    onError,
    onMaxAttemptsReached
  } = options;
  console.log('code reached to pooling');
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isPollingRef = useRef(false);
  
  const attemptCountRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  console.log('isPolling outside-->', isPollingRef.current);

  // Function to start polling
  const startPolling = () => {
    isPollingRef.current = true;
    attemptCountRef.current = 0;
    poll();
  };

  // Function to stop polling
  const stopPolling = () => {
    isPollingRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // The polling function
  const poll = async () => {
    console.log('code reached to poll function');
    console.log('isPolling -->', isPollingRef.current);
    if (!isPollingRef.current) return;
    
    attemptCountRef.current += 1;
    console.log('attemptCountRef.current -->', attemptCountRef.current);
    setLoading(true);
    
    try {
      const result = await fetchFunction();
      setData(result);
      setError(null);
      console.log('result -->', result);
      console.log('onsuccess -->', onSuccess);

      if (onSuccess) {
        onSuccess(result);
      }
      
      // If we've reached max attempts, stop polling
      if (attemptCountRef.current >= maxAttempts) {
        stopPolling();
        if (onMaxAttemptsReached) {
          onMaxAttemptsReached();
        }
        return;
      }
      
      // Schedule next poll
      timerRef.current = setTimeout(poll, interval);
    } catch (err) {
      setError(err as Error);
      if (onError) {
        onError(err);
      }
      
      // Continue polling even on error
      timerRef.current = setTimeout(poll, interval);
    } finally {
      setLoading(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    isPolling: isPollingRef.current,
    startPolling,
    stopPolling
  };
} 