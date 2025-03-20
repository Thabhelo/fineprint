type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
  userId?: string;
  requestId?: string;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel, message: string, data?: any, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      userId: 'TODO: Get from auth context',
      requestId: 'TODO: Get from request context',
    };
  }

  private log(entry: LogEntry) {
    if (this.isDevelopment) {
      console.log(JSON.stringify(entry, null, 2));
    } else {
      // In production, send to logging service
      // TODO: Implement production logging service
      console.log(JSON.stringify(entry));
    }
  }

  info(message: string, data?: any) {
    this.log(this.formatLog('info', message, data));
  }

  warn(message: string, data?: any) {
    this.log(this.formatLog('warn', message, data));
  }

  error(message: string, error?: Error, data?: any) {
    this.log(this.formatLog('error', message, data, error));
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      this.log(this.formatLog('debug', message, data));
    }
  }
}

export const logger = Logger.getInstance(); 