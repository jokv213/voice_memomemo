import {useState, useEffect, useRef} from 'react';
import * as Notifications from 'expo-notifications';

export interface RestTimerState {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  totalTime: number;
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useRestTimer(initialTime = 60) {
  const [timerState, setTimerState] = useState<RestTimerState>({
    timeRemaining: initialTime,
    isRunning: false,
    isPaused: false,
    totalTime: initialTime,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationRef = useRef<string | null>(null);

  useEffect(() => {
    requestNotificationPermissions();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (notificationRef.current) {
        Notifications.cancelScheduledNotificationAsync(notificationRef.current);
      }
    };
  }, []);

  const requestNotificationPermissions = async () => {
    const {status} = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permission not granted');
    }
  };

  const startTimer = async () => {
    if (timerState.timeRemaining <= 0) return;

    setTimerState(prev => ({...prev, isRunning: true, isPaused: false}));

    // Schedule notification
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'レストタイマー',
          body: 'インターバル終了！次のセットを始めましょう',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {seconds: timerState.timeRemaining},
      });
      notificationRef.current = notificationId;
    } catch (error) {
      console.warn('Failed to schedule notification:', error);
    }

    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return {
            ...prev,
            timeRemaining: 0,
            isRunning: false,
            isPaused: false,
          };
        }
        return {...prev, timeRemaining: newTime};
      });
    }, 1000);
  };

  const pauseTimer = async () => {
    setTimerState(prev => ({...prev, isRunning: false, isPaused: true}));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cancel scheduled notification
    if (notificationRef.current) {
      await Notifications.cancelScheduledNotificationAsync(notificationRef.current);
      notificationRef.current = null;
    }
  };

  const resumeTimer = async () => {
    if (timerState.timeRemaining <= 0) return;
    await startTimer();
  };

  const resetTimer = async (newTime?: number) => {
    const resetTime = newTime || timerState.totalTime;

    setTimerState({
      timeRemaining: resetTime,
      isRunning: false,
      isPaused: false,
      totalTime: resetTime,
    });

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (notificationRef.current) {
      await Notifications.cancelScheduledNotificationAsync(notificationRef.current);
      notificationRef.current = null;
    }
  };

  const adjustTime = (seconds: number) => {
    setTimerState(prev => {
      const newTime = Math.max(0, prev.timeRemaining + seconds);
      return {
        ...prev,
        timeRemaining: newTime,
        totalTime: prev.isRunning ? prev.totalTime : newTime,
      };
    });
  };

  const setPresetTime = async (seconds: number) => {
    await resetTimer(seconds);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (timerState.totalTime === 0) return 0;
    return (timerState.totalTime - timerState.timeRemaining) / timerState.totalTime;
  };

  return {
    ...timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    adjustTime,
    setPresetTime,
    formatTime: () => formatTime(timerState.timeRemaining),
    formatTotalTime: () => formatTime(timerState.totalTime),
    getProgress,
  };
}
