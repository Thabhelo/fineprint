import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';

interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: unknown) => {
    let apiError: ApiError;
    let errorObject: Error;

    if (error instanceof Error) {
      apiError = {
        message: error.message,
        details: error.stack,
      };
      errorObject = error;
    } else if (typeof error === 'object' && error !== null) {
      const message = (error as any).message || 'An unexpected error occurred';
      apiError = {
        message,
        code: (error as any).code,
        details: error,
      };
      errorObject = new Error(message);
    } else {
      const message = 'An unexpected error occurred';
      apiError = {
        message,
        details: error,
      };
      errorObject = new Error(message);
    }

    logger.error('API Error:', errorObject, { apiError });
    setError(apiError);
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
  };
} 