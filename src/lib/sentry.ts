import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

export const initSentry = () => {
  const dsn = Constants.expoConfig?.extra?.sentryDsn as string | undefined;
  if (!dsn) return; // DSN が空なら何もしない

  Sentry.init({
    dsn,
    enableAutoSessionTracking: true,
    debug: __DEV__,
  });
};
