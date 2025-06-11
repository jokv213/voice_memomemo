const {device, expect, element, by, waitFor} = require('detox');

describe('Voice Input Flow', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    // Assume user is already authenticated
    // This test suite should run after auth tests
  });

  describe('Happy Path - Voice Recording and Exercise Logging', () => {
    it('should navigate to voice input screen', async () => {
      await waitFor(element(by.text('音声入力')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.text('音声入力')).tap();

      await waitFor(element(by.id('voice-input-screen')))
        .toBeVisible()
        .withTimeout(3000);
      await expect(element(by.text('音声でトレーニングを記録'))).toBeVisible();
    });

    it('should request microphone permissions on first use', async () => {
      await element(by.id('mic-button')).tap();

      // Handle iOS permission dialog
      if (device.getPlatform() === 'ios') {
        await waitFor(element(by.text('OK')))
          .toBeVisible()
          .withTimeout(3000);
        await element(by.text('OK')).tap();
      }

      // Should start recording
      await waitFor(element(by.id('recording-indicator')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should display recording UI when recording starts', async () => {
      await element(by.id('mic-button')).tap();

      await waitFor(element(by.id('recording-indicator')))
        .toBeVisible()
        .withTimeout(3000);
      await expect(element(by.text('録音中...'))).toBeVisible();
      await expect(element(by.id('stop-recording-button'))).toBeVisible();
    });

    it('should stop recording and show transcription', async () => {
      // Start recording
      await element(by.id('mic-button')).tap();
      await waitFor(element(by.id('recording-indicator')))
        .toBeVisible()
        .withTimeout(3000);

      // Wait a moment then stop
      await new Promise(resolve => setTimeout(resolve, 2000));
      await element(by.id('stop-recording-button')).tap();

      // Should show transcription area
      await waitFor(element(by.id('transcription-text')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should parse exercise data from transcription', async () => {
      // Navigate to voice input if not already there
      await element(by.text('音声入力')).tap();

      // Simulate transcription text (since we can't actually speak in E2E tests)
      await element(by.id('transcription-input')).typeText('ベンチプレス 80キロ 10回 3セット');

      // Should show parsed exercise data
      await waitFor(element(by.text('ベンチプレス')))
        .toBeVisible()
        .withTimeout(3000);
      await expect(element(by.text('80kg'))).toBeVisible();
      await expect(element(by.text('10回'))).toBeVisible();
      await expect(element(by.text('3セット'))).toBeVisible();
    });

    it('should save exercise data successfully', async () => {
      // Make sure we have parsed data
      await element(by.id('transcription-input')).typeText('スクワット 60キロ 15回 4セット');

      // Save the exercise
      await element(by.id('save-exercise-button')).tap();

      // Should show success message
      await waitFor(element(by.text('保存しました')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should allow adding memo to exercise', async () => {
      await element(by.id('transcription-input')).typeText(
        'デッドリフト 100キロ 5回 3セット フォーム注意',
      );

      // Should parse memo part
      await waitFor(element(by.text('フォーム注意')))
        .toBeVisible()
        .withTimeout(3000);

      await element(by.id('save-exercise-button')).tap();
      await waitFor(element(by.text('保存しました')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Permission Denied Scenarios', () => {
    beforeEach(async () => {
      await device.reloadReactNative();
      await waitFor(element(by.text('音声入力')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.text('音声入力')).tap();
    });

    it('should handle microphone permission denial gracefully', async () => {
      // Deny microphone permission
      await device.setPermissions({microphone: 'denied'});

      await element(by.id('mic-button')).tap();

      // Should show permission error
      await waitFor(element(by.text('マイクの権限が必要です')))
        .toBeVisible()
        .withTimeout(3000);
      await expect(element(by.text('設定から権限を有効にしてください'))).toBeVisible();
    });

    it('should provide settings link when permission denied', async () => {
      await device.setPermissions({microphone: 'denied'});
      await element(by.id('mic-button')).tap();

      await waitFor(element(by.text('設定を開く')))
        .toBeVisible()
        .withTimeout(3000);
      // Don't actually tap it as it would open system settings
    });
  });

  describe('Network Failure Scenarios', () => {
    it('should handle save failure gracefully', async () => {
      // Set up network blacklist to simulate connection failure
      await device.setURLBlacklist(['*.supabase.co']);

      await element(by.id('transcription-input')).typeText('プルアップ 自重 12回 3セット');
      await element(by.id('save-exercise-button')).tap();

      // Should show error and offer retry
      await waitFor(element(by.text('保存に失敗しました')))
        .toBeVisible()
        .withTimeout(5000);
      await expect(element(by.text('リトライ'))).toBeVisible();

      // Restore network
      await device.setURLBlacklist([]);
    });

    it('should allow retry after network failure', async () => {
      // Simulate network failure
      await device.setURLBlacklist(['*.supabase.co']);

      await element(by.id('transcription-input')).typeText('ラットプルダウン 50キロ 12回 3セット');
      await element(by.id('save-exercise-button')).tap();

      await waitFor(element(by.text('保存に失敗しました')))
        .toBeVisible()
        .withTimeout(5000);

      // Restore network and retry
      await device.setURLBlacklist([]);
      await element(by.text('リトライ')).tap();

      // Should succeed now
      await waitFor(element(by.text('保存しました')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should queue data for offline save when network unavailable', async () => {
      // Simulate offline
      await device.setURLBlacklist(['*']);

      await element(by.id('transcription-input')).typeText('ショルダープレス 30キロ 8回 3セット');
      await element(by.id('save-exercise-button')).tap();

      // Should show offline save message
      await waitFor(element(by.text('オフラインで保存しました')))
        .toBeVisible()
        .withTimeout(5000);
      await expect(element(by.text('ネットワーク復旧時に自動同期されます'))).toBeVisible();

      // Restore network
      await device.setURLBlacklist([]);
    });
  });

  describe('Background Recording Scenarios', () => {
    it('should continue recording when app goes to background briefly', async () => {
      await element(by.id('mic-button')).tap();
      await waitFor(element(by.id('recording-indicator')))
        .toBeVisible()
        .withTimeout(3000);

      // Send app to background
      await device.sendToHome();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Bring app back
      await device.launchApp({newInstance: false});

      // Should still be recording
      await expect(element(by.id('recording-indicator'))).toBeVisible();
    });

    it('should show notification when recording in background', async () => {
      await element(by.id('mic-button')).tap();
      await waitFor(element(by.id('recording-indicator')))
        .toBeVisible()
        .withTimeout(3000);

      await device.sendToHome();

      // Should show background recording notification
      // Note: Detox has limited notification testing capabilities
      // This would need to be tested manually or with additional tools
    });
  });

  describe('Long Recording Scenarios', () => {
    it('should handle long recordings without crashing', async () => {
      await element(by.id('mic-button')).tap();
      await waitFor(element(by.id('recording-indicator')))
        .toBeVisible()
        .withTimeout(3000);

      // Record for 15 seconds (simulating long session description)
      await new Promise(resolve => setTimeout(resolve, 15000));

      await element(by.id('stop-recording-button')).tap();

      // Should still process successfully
      await waitFor(element(by.id('transcription-text')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });
});
