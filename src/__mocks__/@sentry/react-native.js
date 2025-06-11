// Mock for Sentry React Native
export const init = jest.fn();
export const captureException = jest.fn();
export const captureMessage = jest.fn();
export const addBreadcrumb = jest.fn();
export const setUser = jest.fn();
export const setTag = jest.fn();
export const setContext = jest.fn();
export const configureScope = jest.fn(callback =>
  callback({setTag: jest.fn(), setUser: jest.fn()}),
);
export const withScope = jest.fn(callback => callback({setTag: jest.fn(), setUser: jest.fn()}));
export const reactNavigationIntegration = jest.fn(() => ({}));

// Error boundary mock
export const ErrorBoundary = ({children, fallback}) => {
  try {
    return children;
  } catch (error) {
    return fallback;
  }
};

export default {
  init,
  captureException,
  captureMessage,
  addBreadcrumb,
  setUser,
  setTag,
  setContext,
  configureScope,
  withScope,
  reactNavigationIntegration,
  ErrorBoundary,
};
