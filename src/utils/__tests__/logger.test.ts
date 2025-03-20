import { logger } from '../logger';

describe('Logger', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalConsole = { ...console };

  beforeEach(() => {
    // Reset console methods
    console.log = jest.fn() as jest.Mock;
    console.warn = jest.fn() as jest.Mock;
    console.error = jest.fn() as jest.Mock;
    console.debug = jest.fn() as jest.Mock;
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  describe('info', () => {
    it('should log info message with data', () => {
      const message = 'Test info message';
      const data = { test: 'data' };

      logger.info(message, data);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"level":"info"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"data":{"test":"data"}')
      );
    });
  });

  describe('warn', () => {
    it('should log warning message with data', () => {
      const message = 'Test warning message';
      const data = { test: 'data' };

      logger.warn(message, data);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"level":"warn"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"data":{"test":"data"}')
      );
    });
  });

  describe('error', () => {
    it('should log error message with error object and data', () => {
      const message = 'Test error message';
      const error = new Error('Test error');
      const data = { test: 'data' };

      logger.error(message, error, data);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"level":"error"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"error":{"name":"Error","message":"Test error"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"data":{"test":"data"}')
      );
    });
  });

  describe('debug', () => {
    it('should log debug message in development', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Test debug message';
      const data = { test: 'data' };

      logger.debug(message, data);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"level":"debug"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"data":{"test":"data"}')
      );
    });

    it('should not log debug message in production', () => {
      process.env.NODE_ENV = 'production';
      const message = 'Test debug message';
      const data = { test: 'data' };

      logger.debug(message, data);

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('LogEntry format', () => {
    it('should include timestamp in ISO format', () => {
      const message = 'Test message';
      const now = new Date().toISOString();

      logger.info(message);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"timestamp":')
      );
      const logEntry = JSON.parse((console.log as jest.Mock).mock.calls[0][0]);
      expect(new Date(logEntry.timestamp).toISOString()).toBe(now);
    });

    it('should include userId and requestId placeholders', () => {
      const message = 'Test message';

      logger.info(message);

      const logEntry = JSON.parse((console.log as jest.Mock).mock.calls[0][0]);
      expect(logEntry.userId).toBe('TODO: Get from auth context');
      expect(logEntry.requestId).toBe('TODO: Get from request context');
    });
  });
}); 