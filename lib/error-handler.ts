import { toast } from 'sonner';

export type ErrorSource = 'AUTH' | 'DATABASE' | 'API' | 'VALIDATION';
export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface ErrorLog {
  source: ErrorSource;
  severity: ErrorSeverity;
  message: string;
  error: unknown;
  context?: Record<string, unknown>;
  timestamp: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    public source: ErrorSource,
    public severity: ErrorSeverity = 'MEDIUM',
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const logError = async (errorLog: Omit<ErrorLog, 'timestamp'>) => {
  const fullError = {
    ...errorLog,
    timestamp: new Date().toISOString(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', fullError);
  }

  try {
    // Send error to backend logging service
    const response = await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullError),
    });

    if (!response.ok) {
      throw new Error('Failed to log error to server');
    }
  } catch (error) {
    // Fallback to console if API call fails
    console.error('Failed to log error:', error);
    console.error('Original error:', fullError);
  }

  // Show toast notification for user feedback
  toast.error('An error occurred', {
    description: errorLog.message || 'Please try again later',
  });
};