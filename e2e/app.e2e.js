const {device, expect, element, by, waitFor} = require('detox');

describe('Training Voice Memo App - Integration Tests', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
  });

  describe('App Startup and Navigation', () => {
    it('should start without crashing', async () => {
      // Should show auth screen or main app
      await waitFor(element(by.text('サインイン')).or(element(by.text('メイン'))))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should handle app launch with fresh install', async () => {
      await device.uninstallApp();
      await device.installApp();
      await device.launchApp();

      // Should show onboarding or auth screen
      await waitFor(element(by.text('サインイン')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should navigate between all main tabs without crashing', async () => {
      // Assume we're authenticated (setup in individual test files)
      const tabs = ['メイン', '音声入力', 'データ', 'タイマー'];

      for (const tab of tabs) {
        await element(by.text(tab)).tap();
        await waitFor(element(by.text(tab)))
          .toBeVisible()
          .withTimeout(3000);

        // Wait a moment for screen to load
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    });
  });

  describe('Complete User Journey - Happy Path', () => {
    it('should allow complete workout session recording flow', async () => {
      // This is an integration test that combines multiple features

      // 1. Start with voice input
      await element(by.text('音声入力')).tap();
      await waitFor(element(by.id('voice-input-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // 2. Record first exercise
      await element(by.id('transcription-input')).typeText('ベンチプレス 80キロ 10回 3セット');
      await element(by.id('save-exercise-button')).tap();
      await waitFor(element(by.text('保存しました')))
        .toBeVisible()
        .withTimeout(5000);

      // 3. Use rest timer
      await element(by.text('タイマー')).tap();
      await element(by.id('preset-90')).tap();
      await element(by.id('start-timer-button')).tap();

      // Wait a moment for timer to start
      await waitFor(element(by.text('1:29')))
        .toBeVisible()
        .withTimeout(3000);

      // Skip waiting for full timer and reset
      await element(by.id('reset-timer-button')).tap();

      // 4. Record second exercise
      await element(by.text('音声入力')).tap();
      await element(by.id('transcription-input')).typeText(
        'スクワット 60キロ 15回 4セット フォーム良好',
      );
      await element(by.id('save-exercise-button')).tap();
      await waitFor(element(by.text('保存しました')))
        .toBeVisible()
        .withTimeout(5000);

      // 5. View recorded data
      await element(by.text('データ')).tap();
      await waitFor(element(by.id('sessions-list')))
        .toBeVisible()
        .withTimeout(3000);

      // Should see today's session with exercises
      await expect(element(by.text('ベンチプレス'))).toBeVisible();
      await expect(element(by.text('スクワット'))).toBeVisible();

      // 6. Check exercise progress
      await element(by.text('種目')).tap();
      await expect(element(by.text('ベンチプレス'))).toBeVisible();
      await expect(element(by.text('80kg'))).toBeVisible();

      // 7. Check memos
      await element(by.text('メモ')).tap();
      await expect(element(by.text('フォーム良好'))).toBeVisible();
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle app backgrounding during various operations', async () => {
      // Test during voice recording
      await element(by.text('音声入力')).tap();
      await element(by.id('mic-button')).tap();

      await device.sendToHome();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await device.launchApp({newInstance: false});

      // Should handle gracefully
      await element(by.text('音声入力')).tap();

      // Test during timer
      await element(by.text('タイマー')).tap();
      await element(by.id('preset-30')).tap();
      await element(by.id('start-timer-button')).tap();

      await device.sendToHome();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await device.launchApp({newInstance: false});

      // Timer should continue
      await element(by.text('タイマー')).tap();
      await expect(element(by.id('timer-display'))).toBeVisible();
    });

    it('should handle network disconnection and reconnection', async () => {
      // Disconnect network
      await device.setURLBlacklist(['*']);

      // Try to save exercise
      await element(by.text('音声入力')).tap();
      await element(by.id('transcription-input')).typeText('オフラインテスト 50キロ 10回');
      await element(by.id('save-exercise-button')).tap();

      // Should handle offline
      await waitFor(element(by.text('オフラインで保存しました')))
        .toBeVisible()
        .withTimeout(5000);

      // Reconnect network
      await device.setURLBlacklist([]);

      // Pull to refresh data screen
      await element(by.text('データ')).tap();
      await element(by.id('sessions-list')).swipe('down', 'fast', 0.8);

      // Should sync data
      await waitFor(element(by.text('同期完了')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should handle rapid navigation without crashes', async () => {
      // Rapidly switch between tabs
      for (let i = 0; i < 10; i++) {
        const tabs = ['メイン', '音声入力', 'データ', 'タイマー'];
        const randomTab = tabs[Math.floor(Math.random() * tabs.length)];
        await element(by.text(randomTab)).tap();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should still be functional
      await element(by.text('データ')).tap();
      await expect(element(by.text('保存データ'))).toBeVisible();
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large amounts of data without memory issues', async () => {
      // This would ideally run with pre-populated test data
      await element(by.text('データ')).tap();

      // Scroll through large dataset
      for (let i = 0; i < 20; i++) {
        await element(by.id('sessions-list')).scroll(200, 'down');
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should remain responsive
      await expect(element(by.text('保存データ'))).toBeVisible();
    });

    it('should handle concurrent operations gracefully', async () => {
      // Start timer
      await element(by.text('タイマー')).tap();
      await element(by.id('preset-60')).tap();
      await element(by.id('start-timer-button')).tap();

      // While timer running, try to save exercise
      await element(by.text('音声入力')).tap();
      await element(by.id('transcription-input')).typeText('同時操作テスト 40キロ 8回');
      await element(by.id('save-exercise-button')).tap();

      // Both should work
      await waitFor(element(by.text('保存しました')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.text('タイマー')).tap();
      await expect(element(by.id('pause-timer-button'))).toBeVisible();
    });
  });

  describe('Accessibility and Usability', () => {
    it('should support accessibility features', async () => {
      // Enable accessibility
      await device.setAccessibilityPolicy({
        announceEnabled: true,
        visualIndicators: true,
      });

      // Test navigation with accessibility
      await element(by.text('音声入力')).tap();
      await expect(element(by.id('voice-input-screen'))).toBeVisible();

      // Test button accessibility
      await expect(element(by.id('mic-button'))).toHaveAccessibilityLabel('音声録音ボタン');
    });

    it('should work in different orientations', async () => {
      // Test landscape mode
      await device.setOrientation('landscape');

      await element(by.text('データ')).tap();
      await expect(element(by.text('保存データ'))).toBeVisible();

      // Test portrait mode
      await device.setOrientation('portrait');
      await expect(element(by.text('保存データ'))).toBeVisible();
    });
  });
});
