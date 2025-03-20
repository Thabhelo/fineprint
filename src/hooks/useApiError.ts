import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';

interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError({
        message: error.message,
        details: { stack: error.stack }
      });
    } else if (typeof error === 'object' && error !== null) {
      setError({
        message: 'An unexpected error occurred',
        details: error as Record<string, unknown>
      });
    } else {
      setError({
        message: String(error)
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    clearError();

    try {
      const result = await operation();
      return result;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandling,
    setIsLoading
  };
} 