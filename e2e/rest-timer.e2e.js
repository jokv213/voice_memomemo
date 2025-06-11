const {device, expect, element, by, waitFor} = require('detox');

describe('Rest Timer Functionality', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    // Assume user is authenticated
  });

  describe('Timer Basic Functionality', () => {
    it('should navigate to rest timer screen', async () => {
      await element(by.text('タイマー')).tap();
      await waitFor(element(by.text('レストタイマー')))
        .toBeVisible()
        .withTimeout(3000);

      // Should show timer UI
      await expect(element(by.id('timer-display'))).toBeVisible();
      await expect(element(by.id('start-timer-button'))).toBeVisible();
    });

    it('should display default timer value', async () => {
      await element(by.text('タイマー')).tap();
      await waitFor(element(by.id('timer-display')))
        .toBeVisible()
        .withTimeout(3000);

      // Should show default time (e.g., 1:00)
      await expect(element(by.text('1:00'))).toBeVisible();
    });

    it('should allow setting preset timer values', async () => {
      await element(by.text('タイマー')).tap();

      // Test different preset values
      const presets = [
        {button: 'preset-30', time: '0:30'},
        {button: 'preset-60', time: '1:00'},
        {button: 'preset-90', time: '1:30'},
        {button: 'preset-120', time: '2:00'},
        {button: 'preset-180', time: '3:00'},
      ];

      for (const preset of presets) {
        await element(by.id(preset.button)).tap();
        await expect(element(by.text(preset.time))).toBeVisible();
      }
    });

    it('should allow manual time adjustment', async () => {
      await element(by.text('タイマー')).tap();

      // Increase time with + button
      await element(by.id('increase-time-button')).tap();
      await element(by.id('increase-time-button')).tap();

      // Should show increased time
      await expect(element(by.text('1:02'))).toBeVisible();

      // Decrease time with - button
      await element(by.id('decrease-time-button')).tap();

      // Should show decreased time
      await expect(element(by.text('1:01'))).toBeVisible();
    });
  });

  describe('Timer Operation', () => {
    beforeEach(async () => {
      await element(by.text('タイマー')).tap();
      await waitFor(element(by.id('timer-display')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should start timer countdown', async () => {
      // Set a short timer for testing
      await element(by.id('preset-30')).tap();
      await element(by.id('start-timer-button')).tap();

      // Should show countdown
      await waitFor(element(by.text('0:29')))
        .toBeVisible()
        .withTimeout(2000);
      await expect(element(by.id('pause-timer-button'))).toBeVisible();
    });

    it('should pause and resume timer', async () => {
      await element(by.id('preset-30')).tap();
      await element(by.id('start-timer-button')).tap();

      // Wait a moment then pause
      await new Promise(resolve => setTimeout(resolve, 2000));
      await element(by.id('pause-timer-button')).tap();

      // Should show paused state
      await expect(element(by.id('resume-timer-button'))).toBeVisible();

      // Resume timer
      await element(by.id('resume-timer-button')).tap();

      // Should continue countdown
      await expect(element(by.id('pause-timer-button'))).toBeVisible();
    });

    it('should reset timer to original value', async () => {
      await element(by.id('preset-60')).tap();
      await element(by.id('start-timer-button')).tap();

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Reset timer
      await element(by.id('reset-timer-button')).tap();

      // Should return to original time
      await expect(element(by.text('1:00'))).toBeVisible();
    });

    it('should show completion notification when timer reaches zero', async () => {
      // Set very short timer for testing
      await element(by.id('custom-time-input')).typeText('3'); // 3 seconds
      await element(by.id('start-timer-button')).tap();

      // Wait for completion
      await waitFor(element(by.text('0:00')))
        .toBeVisible()
        .withTimeout(5000);

      // Should show completion UI
      await expect(element(by.text('インターバル終了！'))).toBeVisible();
      await expect(element(by.id('restart-timer-button'))).toBeVisible();
    });
  });

  describe('Background Timer Functionality', () => {
    it('should continue running when app goes to background', async () => {
      await element(by.text('タイマー')).tap();
      await element(by.id('preset-30')).tap();
      await element(by.id('start-timer-button')).tap();

      // Send app to background
      await device.sendToHome();
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Bring app back
      await device.launchApp({newInstance: false});

      // Timer should have continued counting
      await waitFor(element(by.text('0:27')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should show notification when timer completes in background', async () => {
      await element(by.text('タイマー')).tap();
      await element(by.id('custom-time-input')).typeText('5'); // 5 seconds
      await element(by.id('start-timer-button')).tap();

      // Send to background immediately
      await device.sendToHome();

      // Wait for timer to complete
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Check for notification (limited testing capabilities in Detox)
      // This would need manual verification or additional tools
    });

    it('should maintain timer state across app restarts', async () => {
      await element(by.text('タイマー')).tap();
      await element(by.id('preset-60')).tap();
      await element(by.id('start-timer-button')).tap();

      // Terminate and restart app
      await device.terminateApp();
      await device.launchApp();

      // Navigate back to timer
      await element(by.text('タイマー')).tap();

      // Should restore timer state (if implemented)
      // This depends on persistence implementation
    });
  });

  describe('Notification Permissions', () => {
    it('should request notification permissions on first timer start', async () => {
      await element(by.text('タイマー')).tap();
      await element(by.id('preset-30')).tap();
      await element(by.id('start-timer-button')).tap();

      // Should handle permission request
      if (device.getPlatform() === 'ios') {
        await waitFor(element(by.text('Allow')))
          .toBeVisible()
          .withTimeout(3000);
        await element(by.text('Allow')).tap();
      }

      // Timer should start after permission granted
      await waitFor(element(by.text('0:29')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should handle permission denial gracefully', async () => {
      // Deny notification permission
      await device.setPermissions({notifications: 'denied'});

      await element(by.text('タイマー')).tap();
      await element(by.id('preset-30')).tap();
      await element(by.id('start-timer-button')).tap();

      // Should show warning about no notifications
      await waitFor(element(by.text('通知が無効になっています')))
        .toBeVisible()
        .withTimeout(3000);

      // But timer should still work
      await expect(element(by.text('0:29'))).toBeVisible();
    });
  });

  describe('Timer Sound and Vibration', () => {
    it('should play completion sound when timer finishes', async () => {
      await element(by.text('タイマー')).tap();
      await element(by.id('custom-time-input')).typeText('2'); // 2 seconds
      await element(by.id('start-timer-button')).tap();

      // Wait for completion
      await waitFor(element(by.text('0:00')))
        .toBeVisible()
        .withTimeout(4000);

      // Should trigger sound/vibration (can't directly test audio in Detox)
      // But we can verify the completion state
      await expect(element(by.text('インターバル終了！'))).toBeVisible();
    });

    it('should allow toggling sound on/off', async () => {
      await element(by.text('タイマー')).tap();

      // Toggle sound setting
      await element(by.id('sound-toggle')).tap();

      // Should show sound disabled state
      await expect(element(by.id('sound-disabled-indicator'))).toBeVisible();

      // Toggle back on
      await element(by.id('sound-toggle')).tap();
      await expect(element(by.id('sound-enabled-indicator'))).toBeVisible();
    });
  });

  describe('Multiple Timer Sessions', () => {
    it('should allow starting new timer after completion', async () => {
      await element(by.text('タイマー')).tap();
      await element(by.id('custom-time-input')).typeText('2');
      await element(by.id('start-timer-button')).tap();

      // Wait for completion
      await waitFor(element(by.text('0:00')))
        .toBeVisible()
        .withTimeout(4000);

      // Start new timer
      await element(by.id('restart-timer-button')).tap();

      // Should start new countdown
      await waitFor(element(by.text('0:01')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should track timer usage statistics', async () => {
      // This would require implementing timer usage tracking
      await element(by.text('タイマー')).tap();

      // Complete a few short timers
      for (let i = 0; i < 3; i++) {
        await element(by.id('custom-time-input')).typeText('1');
        await element(by.id('start-timer-button')).tap();
        await waitFor(element(by.text('0:00')))
          .toBeVisible()
          .withTimeout(3000);
        await element(by.id('restart-timer-button')).tap();
      }

      // Check for usage stats (if implemented)
      await element(by.id('timer-stats-button')).tap();
      await expect(element(by.text('今日のタイマー使用回数: 3'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid time input gracefully', async () => {
      await element(by.text('タイマー')).tap();

      // Try to input invalid time
      await element(by.id('custom-time-input')).typeText('abc');
      await element(by.id('start-timer-button')).tap();

      // Should show error or ignore invalid input
      await expect(element(by.text('有効な時間を入力してください'))).toBeVisible();
    });

    it('should handle system interruptions gracefully', async () => {
      await element(by.text('タイマー')).tap();
      await element(by.id('preset-30')).tap();
      await element(by.id('start-timer-button')).tap();

      // Simulate phone call or other interruption
      await device.sendToHome();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await device.launchApp({newInstance: false});

      // Timer should handle interruption gracefully
      await element(by.text('タイマー')).tap();
      await expect(element(by.id('timer-display'))).toBeVisible();
    });
  });
});
