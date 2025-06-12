import {renderHook, act} from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';

import {useRestTimer} from '../useRestTimer';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: 'timeInterval',
  },
  AndroidNotificationPriority: {
    HIGH: 'high',
  },
}));

// Mock timers
jest.useFakeTimers();

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;

describe('useRestTimer', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const {result} = renderHook(() => useRestTimer());

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.totalTime).toBe(0);
      expect(result.current.progress).toBe(0);
    });

    it('should set notification handler on mount', () => {
      renderHook(() => useRestTimer());

      expect(mockNotifications.setNotificationHandler).toHaveBeenCalledWith({
        handleNotification: expect.any(Function),
      });
    });
  });

  describe('timer operations', () => {
    it('should start timer with specified duration', () => {
      const {result} = renderHook(() => useRestTimer());

      act(() => {
        result.current.startTimer(120); // 2 minutes
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.timeRemaining).toBe(120);
      expect(result.current.totalTime).toBe(120);
      expect(result.current.progress).toBe(100);
    });

    it('should count down every second', () => {
      const {result} = renderHook(() => useRestTimer());

      act(() => {
        result.current.startTimer(5);
      });

      expect(result.current.timeRemaining).toBe(5);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeRemaining).toBe(4);
      expect(result.current.progress).toBe(80); // 4/5 * 100

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeRemaining).toBe(3);
      expect(result.current.progress).toBe(60); // 3/5 * 100
    });

    it('should stop when reaching zero', () => {
      const {result} = renderHook(() => useRestTimer());

      act(() => {
        result.current.startTimer(2);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.progress).toBe(0);
    });

    it('should pause timer correctly', () => {
      const {result} = renderHook(() => useRestTimer());

      act(() => {
        result.current.startTimer(10);
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.timeRemaining).toBe(7);

      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.isRunning).toBe(false);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should not decrease while paused
      expect(result.current.timeRemaining).toBe(7);
    });

    it('should resume timer correctly', () => {
      const {result} = renderHook(() => useRestTimer());

      act(() => {
        result.current.startTimer(10);
      });

      act(() => {
        jest.advanceTimersByTime(3000);
        result.current.pauseTimer();
      });

      expect(result.current.timeRemaining).toBe(7);
      expect(result.current.isRunning).toBe(false);

      act(() => {
        result.current.resumeTimer();
      });

      expect(result.current.isRunning).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeRemaining).toBe(6);
    });

    it('should reset timer', () => {
      const {result} = renderHook(() => useRestTimer());

      act(() => {
        result.current.startTimer(10);
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.timeRemaining).toBe(7);
      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.resetTimer();
      });

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.totalTime).toBe(0);
      expect(result.current.progress).toBe(0);
    });

    it('should add time to running timer', () => {
      const {result} = renderHook(() => useRestTimer());

      act(() => {
        result.current.startTimer(5);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.timeRemaining).toBe(3);

      act(() => {
        result.current.addTime(30);
      });

      expect(result.current.timeRemaining).toBe(33);
      expect(result.current.totalTime).toBe(35); // Original 5 + added 30
    });

    it('should add time to paused timer', () => {
      const {result} = renderHook(() => useRestTimer());

      act(() => {
        result.current.startTimer(10);
        result.current.pauseTimer();
      });

      act(() => {
        result.current.addTime(15);
      });

      expect(result.current.timeRemaining).toBe(25);
      expect(result.current.totalTime).toBe(25);
    });
  });

  describe('notifications', () => {
    it('should schedule notification when timer starts', async () => {
      const {result} = renderHook(() => useRestTimer());

      await act(async () => {
        result.current.startTimer(60);
      });

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '休憩時間終了！',
          body: '次のセットを開始しましょう',
          sound: true,
          priority: 'high',
        },
        trigger: {
          type: 'timeInterval',
          seconds: 60,
        },
      });
    });

    it('should cancel notification when timer is reset', async () => {
      const {result} = renderHook(() => useRestTimer());

      await act(async () => {
        result.current.startTimer(30);
      });

      await act(async () => {
        result.current.resetTimer();
      });

      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'notification-id',
      );
    });

    it('should cancel notification when timer is paused', async () => {
      const {result} = renderHook(() => useRestTimer());

      await act(async () => {
        result.current.startTimer(30);
      });

      await act(async () => {
        result.current.pauseTimer();
      });

      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'notification-id',
      );
    });

    it('should reschedule notification when timer is resumed', async () => {
      const {result} = renderHook(() => useRestTimer());

      await act(async () => {
        result.current.startTimer(30);
        jest.advanceTimersByTime(10000);
        result.current.pauseTimer();
      });

      jest.clearAllMocks();

      await act(async () => {
        result.current.resumeTimer();
      });

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '休憩時間終了！',
          body: '次のセットを開始しましょう',
          sound: true,
          priority: 'high',
        },
        trigger: {
          type: 'timeInterval',
          seconds: 20, // Remaining time after 10 seconds elapsed
        },
      });
    });

    it('should handle notification scheduling errors', async () => {
      mockNotifications.scheduleNotificationAsync.mockRejectedValueOnce(
        new Error('Notification failed'),
      );

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const {result} = renderHook(() => useRestTimer());

      await act(async () => {
        result.current.startTimer(60);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to schedule notification:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it('should handle notification cancellation errors', async () => {
      mockNotifications.cancelScheduledNotificationAsync.mockRejectedValueOnce(
        new Error('Cancel failed'),
      );

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const {result} = renderHook(() => useRestTimer());

      await act(async () => {
        result.current.startTimer(30);
      });

      await act(async () => {
        result.current.resetTimer();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to cancel notification:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle resume when timer is not paused', () => {
      const {result} = renderHook(() => useRestTimer());

      act(() => {
        result.current.startTimer(10);
      });

      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.resumeTimer();
      });

      // Should remain running
      expect(result.current.isRunning).toBe(true);
    });

    it('should handle pause when timer is not running', () => {
      const {result} = renderHook(() => useRestTimer());

      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('should handle adding time to stopped timer', () => {
      const {result} = renderHook(() => useRestTimer());

      act(() => {
        result.current.addTime(30);
      });

      expect(result.current.timeRemaining).toBe(30);
      expect(result.current.totalTime).toBe(30);
    });

    it('should handle zero duration timer', () => {
      const {result} = renderHook(() => useRestTimer());

      act(() => {
        result.current.startTimer(0);
      });

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isRunning).toBe(false);
    });

    it('should calculate progress correctly when total time is zero', () => {
      const {result} = renderHook(() => useRestTimer());

      expect(result.current.progress).toBe(0);

      act(() => {
        result.current.startTimer(0);
      });

      expect(result.current.progress).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should cleanup timer on unmount', async () => {
      const {result, unmount} = renderHook(() => useRestTimer());

      await act(async () => {
        result.current.startTimer(30);
      });

      unmount();

      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'notification-id',
      );
    });

    it('should not cleanup if no notification was scheduled', () => {
      const {unmount} = renderHook(() => useRestTimer());

      unmount();

      expect(mockNotifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    });
  });
});
