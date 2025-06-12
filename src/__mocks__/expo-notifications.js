// Mock for expo-notifications
export const setNotificationHandler = jest.fn();
export const scheduleNotificationAsync = jest.fn(() => Promise.resolve('notification-id'));
export const cancelScheduledNotificationAsync = jest.fn();
export const requestPermissionsAsync = jest.fn(() => Promise.resolve({status: 'granted'}));

export const SchedulableTriggerInputTypes = {
  TIME_INTERVAL: 'timeInterval',
};

export const AndroidNotificationPriority = {
  HIGH: 'high',
};

export default {
  setNotificationHandler,
  scheduleNotificationAsync,
  cancelScheduledNotificationAsync,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  AndroidNotificationPriority,
};
