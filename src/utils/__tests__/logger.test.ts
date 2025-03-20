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

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      expect(logEntry.message).toBe(message);
      expect(logEntry.level).toBe('info');
      expect(logEntry.data).toEqual(data);
    });
  });

  describe('warn', () => {
    it('should log warning message with data', () => {
      const message = 'Test warning message';
      const data = { test: 'data' };

      logger.warn(message, data);

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      expect(logEntry.message).toBe(message);
      expect(logEntry.level).toBe('warn');
      expect(logEntry.data).toEqual(data);
    });
  });

  describe('error', () => {
    it('should log error message with error object and data', () => {
      const message = 'Test error message';
      const error = new Error('Test error');
      const data = { test: 'data' };

      logger.error(message, error, data);

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      expect(logEntry.message).toBe(message);
      expect(logEntry.level).toBe('error');
      expect(logEntry.error).toEqual({
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      expect(logEntry.data).toEqual(data);
    });
  });

  describe('debug', () => {
    it('should log debug message in development', () => {
      logger.setEnvironment('development');
      const message = 'Test debug message';
      const data = { test: 'data' };

      logger.debug(message, data);

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      expect(logEntry.message).toBe(message);
      expect(logEntry.level).toBe('debug');
      expect(logEntry.data).toEqual(data);
    });

    it('should not log debug message in production', () => {
      logger.setEnvironment('production');
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

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      expect(logEntry.timestamp).toBeDefined();
      expect(new Date(logEntry.timestamp).toISOString()).toBe(logEntry.timestamp);
    });

    it('should include userId and requestId placeholders', () => {
      const message = 'Test message';

      logger.info(message);

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      expect(logEntry.userId).toBe('TODO: Get from auth context');
      expect(logEntry.requestId).toBe('TODO: Get from request context');
    });
  });
}); 