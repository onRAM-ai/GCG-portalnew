type ErrorSeverity = "low" | "medium" | "high" | "critical";

interface ErrorLogData {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  userId?: string;
  timestamp: string;
}

export async function logError(
  error: Error,
  severity: ErrorSeverity = "medium",
  context?: Record<string, any>
) {
  const errorData: ErrorLogData = {
    message: error.message,
    stack: error.stack,
    severity,
    context,
    timestamp: new Date().toISOString(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", errorData);
    return;
  }

  try {
    // Send error to your error tracking service
    await fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorData),
    });
  } catch (e) {
    // Fallback to console if error logging fails
    console.error("Failed to log error:", e);
    console.error("Original error:", error);
  }
}