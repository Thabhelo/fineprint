import { renderHook, act } from '@testing-library/react';
import { useApiError } from '../useApiError';
import { logger } from '../../utils/logger';

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('useApiError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with no error and not loading', () => {
    const { result } = renderHook(() => useApiError());
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle Error instance', async () => {
    const { result } = renderHook(() => useApiError());
    const error = new Error('Test error');

    await act(async () => {
      result.current.handleError(error);
    });

    expect(result.current.error).toEqual({
      message: 'Test error',
      details: error.stack,
    });
    expect(logger.error).toHaveBeenCalledWith('API Error:', error, {
      apiError: {
        message: 'Test error',
        details: error.stack,
      },
    });
  });

  it('should handle error object', async () => {
    const { result } = renderHook(() => useApiError());
    const error = { message: 'Test error', code: 'TEST_ERROR' };

    await act(async () => {
      result.current.handleError(error);
    });

    expect(result.current.error).toEqual({
      message: 'Test error',
      code: 'TEST_ERROR',
      details: error,
    });
    expect(logger.error).toHaveBeenCalledWith('API Error:', expect.any(Error), {
      apiError: {
        message: 'Test error',
        code: 'TEST_ERROR',
        details: error,
      },
    });
  });

  it('should handle unknown error type', async () => {
    const { result } = renderHook(() => useApiError());
    const error = 'string error';

    await act(async () => {
      result.current.handleError(error);
    });

    expect(result.current.error).toEqual({
      message: 'An unexpected error occurred',
      details: error,
    });
    expect(logger.error).toHaveBeenCalledWith('API Error:', expect.any(Error), {
      apiError: {
        message: 'An unexpected error occurred',
        details: error,
      },
    });
  });

  it('should clear error', async () => {
    const { result } = renderHook(() => useApiError());
    const error = new Error('Test error');

    await act(async () => {
      result.current.handleError(error);
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle async operation with error', async () => {
    const { result } = renderHook(() => useApiError());
    const error = new Error('Test error');

    await act(async () => {
      await result.current.withErrorHandling(async () => {
        throw error;
      });
    });

    expect(result.current.error).toEqual({
      message: 'Test error',
      details: error.stack,
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle async operation without error', async () => {
    const { result } = renderHook(() => useApiError());
    const successData = { data: 'success' };

    await act(async () => {
      const operationResult = await result.current.withErrorHandling(async () => {
        return successData;
      });
      expect(operationResult).toBe(successData);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
}); 