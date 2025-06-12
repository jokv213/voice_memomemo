import * as Notifications from 'expo-notifications';
import {useState, useEffect, useRef} from 'react';

export function useRestTimer() {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<string | null>(null);

  // Set up notification handler
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (notificationIdRef.current) {
        Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      }
    };
  }, []);

  const startTimer = (duration: number) => {
    setTimeRemaining(duration);
    setTotalTime(duration);
    setIsRunning(true);

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsRunning(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    // Schedule notification
    scheduleNotification(duration);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (notificationIdRef.current) {
      Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  };

  const resumeTimer = () => {
    if (timeRemaining > 0 && !isRunning) {
      setIsRunning(true);

      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsRunning(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);

      scheduleNotification(timeRemaining);
    }
  };

  const resetTimer = () => {
    setTimeRemaining(0);
    setTotalTime(0);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (notificationIdRef.current) {
      Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  };

  const addTime = (seconds: number) => {
    setTimeRemaining(prev => prev + seconds);
    setTotalTime(prev => prev + seconds);
  };

  const scheduleNotification = async (seconds: number) => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '休憩時間終了！',
          body: '次のセットを開始しましょう',
          sound: true,
          priority: 'high',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
        },
      });
      notificationIdRef.current = notificationId;
    } catch (error) {
      console.warn('Failed to schedule notification:', error);
    }
  };

  const progress = totalTime > 0 ? Math.round((timeRemaining / totalTime) * 100) : 0;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const adjustTime = (seconds: number) => {
    addTime(seconds);
  };

  const setPresetTime = (seconds: number) => {
    setTimeRemaining(seconds);
    setTotalTime(seconds);
  };

  const getProgress = () => progress;

  return {
    timeRemaining,
    isRunning,
    isPaused: !isRunning && timeRemaining > 0,
    totalTime,
    progress,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addTime,
    adjustTime,
    setPresetTime,
    formatTime: () => formatTime(timeRemaining),
    formatTotalTime: () => formatTime(totalTime),
    getProgress,
  };
}
