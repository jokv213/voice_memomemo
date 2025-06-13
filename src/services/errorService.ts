import * as Sentry from '@sentry/react-native';
import {Alert} from 'react-native';

// Initialize Sentry with DSN from environment
export const initSentry = () => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn,
    debug: __DEV__, // Enable debug in development
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: __DEV__ ? 1.0 : 0.1, // 100% in dev, 10% in prod
    integrations: [
      // Sentry v6 compatible performance monitoring
      Sentry.reactNavigationIntegration(),
    ],
    beforeSend: event => {
      // Don't send events in development
      if (__DEV__) {
        // Don't send events in development (silent)
        return null;
      }
      return event;
    },
  });
};

// Capture and report error to Sentry
export const captureError = (error: Error | unknown, context?: Record<string, unknown>) => {
  console.error('App Error:', error);

  if (error instanceof Error) {
    Sentry.captureException(error, {
      contexts: {
        app: context,
      },
    });
  } else {
    Sentry.captureMessage(String(error), 'error');
  }
};

// Show user-friendly error alert
export const showErrorAlert = (
  title: string,
  message: string,
  error?: Error | unknown,
  retry?: () => void,
) => {
  // Log to Sentry
  if (error) {
    captureError(error, {title, message});
  }

  // Show alert to user
  const buttons = retry
    ? [
        {text: 'キャンセル', style: 'cancel' as const},
        {text: 'リトライ', onPress: retry},
      ]
    : [{text: 'OK', style: 'cancel' as const}];

  Alert.alert(title, message, buttons);
};

// Wrapper for async operations with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    errorTitle?: string;
    errorMessage?: string;
    showAlert?: boolean;
    retry?: () => void;
  } = {},
): Promise<T | null> {
  const {
    errorTitle = 'エラー',
    errorMessage = '処理中にエラーが発生しました',
    showAlert = true,
    retry,
  } = options;

  try {
    return await operation();
  } catch (error) {
    captureError(error, {
      operation: operation.name || 'anonymous',
      options,
    });

    if (showAlert) {
      showErrorAlert(errorTitle, errorMessage, error, retry);
    }

    return null;
  }
}

// React Error Boundary component wrapper
export const {ErrorBoundary} = Sentry;

// User identification for error tracking
export const identifyUser = (userId: string, email?: string, role?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    role,
  });
};

// Clear user on logout
export const clearUser = () => {
  Sentry.setUser(null);
};

// Add breadcrumb for better error context
export const addBreadcrumb = (
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>,
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

// Performance monitoring (Sentry v6 compatible)
export const measurePerformance = async <T>(
  name: string,
  operation: () => Promise<T>,
): Promise<T> => {
  const startTime = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - startTime;

    addBreadcrumb(`Performance: ${name} took ${duration}ms`, 'performance', 'info', {
      duration,
      operation: name,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    addBreadcrumb(`Performance: ${name} failed after ${duration}ms`, 'performance', 'error', {
      duration,
      operation: name,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};
