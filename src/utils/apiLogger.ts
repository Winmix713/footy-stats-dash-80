import { getApiConfig } from './apiConfig';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  context?: string;
}

class ApiLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private config = getApiConfig();

  private createLog(level: LogEntry['level'], message: string, data?: any, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context
    };
  }

  private addLog(log: LogEntry) {
    if (!this.config.enableLogging) return;
    
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Also log to console in development
    if (this.config.enableLogging) {
      const consoleMethod = log.level === 'error' ? console.error : 
                           log.level === 'warn' ? console.warn : console.log;
      consoleMethod(`[API] ${log.message}`, log.data || '');
    }
  }

  info(message: string, data?: any, context?: string) {
    this.addLog(this.createLog('info', message, data, context));
  }

  warn(message: string, data?: any, context?: string) {
    this.addLog(this.createLog('warn', message, data, context));
  }

  error(message: string, data?: any, context?: string) {
    this.addLog(this.createLog('error', message, data, context));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.level === 'error');
  }
}

export const apiLogger = new ApiLogger();