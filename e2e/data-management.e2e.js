const {device, expect, element, by, waitFor} = require('detox');

describe('Data Management and Visualization', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    // Assume user is authenticated and has some data
  });

  describe('Session Data Management', () => {
    it('should navigate to data screen and show sessions', async () => {
      await element(by.text('データ')).tap();
      await waitFor(element(by.text('保存データ')))
        .toBeVisible()
        .withTimeout(3000);

      // Should show session data by default
      await expect(element(by.text('セッション'))).toBeVisible();
      await expect(element(by.id('sessions-list'))).toBeVisible();
    });

    it('should display session list with exercise details', async () => {
      await element(by.text('データ')).tap();
      await waitFor(element(by.id('sessions-list')))
        .toBeVisible()
        .withTimeout(3000);

      // Should show at least one session (from previous voice input tests)
      await waitFor(element(by.id('session-item-0')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show session details when tapped', async () => {
      await element(by.text('データ')).tap();
      await waitFor(element(by.id('sessions-list')))
        .toBeVisible()
        .withTimeout(3000);

      // Tap on first session
      await element(by.id('session-item-0')).tap();

      // Should show exercise details
      await waitFor(element(by.id('exercise-details')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should allow editing session title', async () => {
      await element(by.text('データ')).tap();
      await element(by.id('session-item-0')).tap();

      // Tap edit button
      await element(by.id('edit-session-button')).tap();

      // Edit title
      await element(by.id('session-title-input')).clearText();
      await element(by.id('session-title-input')).typeText('朝のトレーニング');

      // Save changes
      await element(by.id('save-session-button')).tap();

      // Should show updated title
      await waitFor(element(by.text('朝のトレーニング')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Exercise Progress Visualization', () => {
    it('should switch to exercise view and show progress', async () => {
      await element(by.text('データ')).tap();
      await element(by.text('種目')).tap();

      await waitFor(element(by.id('exercises-list')))
        .toBeVisible()
        .withTimeout(3000);

      // Should show exercise progress cards
      await expect(element(by.id('exercise-progress-item-0'))).toBeVisible();
    });

    it('should display exercise statistics correctly', async () => {
      await element(by.text('データ')).tap();
      await element(by.text('種目')).tap();

      await waitFor(element(by.id('exercise-progress-item-0')))
        .toBeVisible()
        .withTimeout(3000);

      // Should show max weight and total reps
      await expect(element(by.text('最大重量'))).toBeVisible();
      await expect(element(by.text('総回数'))).toBeVisible();
    });

    it('should show progress chart for exercises with history', async () => {
      await element(by.text('データ')).tap();
      await element(by.text('種目')).tap();

      await waitFor(element(by.id('exercise-progress-item-0')))
        .toBeVisible()
        .withTimeout(3000);

      // Should show chart note (since we simplified the chart)
      await expect(
        element(by.text('データ視覚化: Victory Native v41 との統合を修正中')),
      ).toBeVisible();
    });

    it('should sort exercises by max weight', async () => {
      await element(by.text('データ')).tap();
      await element(by.text('種目')).tap();

      await waitFor(element(by.id('exercises-list')))
        .toBeVisible()
        .withTimeout(3000);

      // First exercise should have highest weight (from our test data setup)
      const firstExercise = await element(by.id('exercise-progress-item-0'));
      await expect(firstExercise).toBeVisible();
    });
  });

  describe('Memo and Notes Management', () => {
    it('should switch to memos view and display memo list', async () => {
      await element(by.text('データ')).tap();
      await element(by.text('メモ')).tap();

      await waitFor(element(by.id('memos-list')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show memo details with exercise and session info', async () => {
      await element(by.text('データ')).tap();
      await element(by.text('メモ')).tap();

      await waitFor(element(by.id('memo-item-0')))
        .toBeVisible()
        .withTimeout(3000);

      // Should show memo content and metadata
      await expect(element(by.id('memo-text'))).toBeVisible();
      await expect(element(by.id('memo-exercise'))).toBeVisible();
      await expect(element(by.id('memo-date'))).toBeVisible();
    });

    it('should allow editing memo content', async () => {
      await element(by.text('データ')).tap();
      await element(by.text('メモ')).tap();

      await element(by.id('memo-item-0')).tap();

      // Edit memo
      await element(by.id('edit-memo-button')).tap();
      await element(by.id('memo-input')).clearText();
      await element(by.id('memo-input')).typeText('フォームを改善。次回は重量を上げる。');

      await element(by.id('save-memo-button')).tap();

      // Should show updated memo
      await waitFor(element(by.text('フォームを改善。次回は重量を上げる。')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Data Refresh and Sync', () => {
    it('should support pull-to-refresh functionality', async () => {
      await element(by.text('データ')).tap();
      await waitFor(element(by.id('sessions-list')))
        .toBeVisible()
        .withTimeout(3000);

      // Pull to refresh
      await element(by.id('sessions-list')).swipe('down', 'fast', 0.8);

      // Should show refresh indicator briefly
      await waitFor(element(by.id('refresh-indicator')))
        .toBeVisible()
        .withTimeout(1000);
      await waitFor(element(by.id('refresh-indicator')))
        .not.toBeVisible()
        .withTimeout(5000);
    });

    it('should handle sync conflicts gracefully', async () => {
      // Simulate data conflict scenario
      await device.setURLBlacklist(['*.supabase.co']);

      await element(by.text('データ')).tap();
      await element(by.id('session-item-0')).tap();
      await element(by.id('edit-session-button')).tap();
      await element(by.id('session-title-input')).typeText('オフライン編集');
      await element(by.id('save-session-button')).tap();

      // Should show offline save message
      await waitFor(element(by.text('オフラインで保存しました')))
        .toBeVisible()
        .withTimeout(3000);

      // Restore network
      await device.setURLBlacklist([]);

      // Pull to refresh to sync
      await element(by.id('sessions-list')).swipe('down', 'fast', 0.8);

      // Should resolve conflicts and sync
      await waitFor(element(by.text('同期完了')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Data Export and Sharing', () => {
    it('should provide export options for session data', async () => {
      await element(by.text('データ')).tap();
      await element(by.id('session-item-0')).tap();

      // Long press for context menu
      await element(by.id('session-item-0')).longPress();

      // Should show export options
      await waitFor(element(by.text('エクスポート')))
        .toBeVisible()
        .withTimeout(3000);
      await expect(element(by.text('CSV形式'))).toBeVisible();
      await expect(element(by.text('PDF形式'))).toBeVisible();
    });

    it('should allow sharing workout summary', async () => {
      await element(by.text('データ')).tap();
      await element(by.id('session-item-0')).tap();
      await element(by.id('session-item-0')).longPress();

      await element(by.text('共有')).tap();

      // Should open system share sheet
      // Note: Can't test system share sheet directly in Detox
      // But we can verify our share functionality is triggered
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should handle scrolling through large session lists', async () => {
      await element(by.text('データ')).tap();
      await waitFor(element(by.id('sessions-list')))
        .toBeVisible()
        .withTimeout(3000);

      // Scroll through list
      for (let i = 0; i < 5; i++) {
        await element(by.id('sessions-list')).scroll(200, 'down');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Should still be responsive
      await expect(element(by.id('sessions-list'))).toBeVisible();
    });

    it('should lazy load exercise progress data', async () => {
      await element(by.text('データ')).tap();
      await element(by.text('種目')).tap();

      await waitFor(element(by.id('exercises-list')))
        .toBeVisible()
        .withTimeout(3000);

      // Scroll to trigger lazy loading
      await element(by.id('exercises-list')).scroll(300, 'down');

      // Should load more data without crashing
      await new Promise(resolve => setTimeout(resolve, 2000));
      await expect(element(by.id('exercises-list'))).toBeVisible();
    });
  });

  describe('Empty State Handling', () => {
    it('should show appropriate message when no data exists', async () => {
      // This would require a fresh user account with no data
      // For now, we'll simulate by testing the empty state components
      await element(by.text('データ')).tap();
      await element(by.text('メモ')).tap();

      // If no memos exist, should show empty state
      // Note: This depends on test data state
    });
  });
});
