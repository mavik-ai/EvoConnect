export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

// In-memory store (will reset on Vercel cold starts, but good enough for live session tracking)
class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 50;

  addLog(message: string, type: LogEntry['type'] = 'info') {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
      message,
      type,
    };
    
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    
    // Also log to proper console for Vercel logs history
    console.log(`[${entry.timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  getLogs() {
    return this.logs;
  }
}

// Export a singleton
export const systemLogger = new Logger();
