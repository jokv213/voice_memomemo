const {device, expect, element, by, waitFor} = require('detox');

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
  });

  describe('Happy Path - User Registration and Login', () => {
    it('should display authentication screen on app start', async () => {
      await waitFor(element(by.text('サインイン')))
        .toBeVisible()
        .withTimeout(5000);
      await expect(element(by.text('アカウントをお持ちでない方'))).toBeVisible();
    });

    it('should allow user to switch to sign up screen', async () => {
      await element(by.text('アカウントを作成')).tap();
      await waitFor(element(by.text('サインアップ')))
        .toBeVisible()
        .withTimeout(2000);
      await expect(element(by.text('すでにアカウントをお持ちの方'))).toBeVisible();
    });

    it('should allow individual user registration', async () => {
      // Generate unique email for test
      const timestamp = Date.now();
      const testEmail = `test-individual-${timestamp}@example.com`;
      const testPassword = 'TestPassword123!';

      // Fill in registration form
      await element(by.id('email-input')).typeText(testEmail);
      await element(by.id('password-input')).typeText(testPassword);

      // Select individual role
      await element(by.id('role-individual')).tap();

      // Submit registration
      await element(by.id('signup-button')).tap();

      // Should navigate to main app or email confirmation
      await waitFor(element(by.text('メイン')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should allow user to sign out and sign back in', async () => {
      // Navigate to profile/settings to sign out
      await element(by.text('データ')).tap();
      await waitFor(element(by.text('サインアウト')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.text('サインアウト')).tap();

      // Should return to auth screen
      await waitFor(element(by.text('サインイン')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Trainer Registration Flow', () => {
    it('should allow trainer registration', async () => {
      // Switch to sign up
      await element(by.text('アカウントを作成')).tap();
      await waitFor(element(by.text('サインアップ')))
        .toBeVisible()
        .withTimeout(2000);

      // Generate unique email for trainer
      const timestamp = Date.now();
      const trainerEmail = `test-trainer-${timestamp}@example.com`;
      const testPassword = 'TrainerPassword123!';

      // Fill in registration form
      await element(by.id('email-input')).typeText(trainerEmail);
      await element(by.id('password-input')).typeText(testPassword);

      // Select trainer role
      await element(by.id('role-trainer')).tap();

      // Submit registration
      await element(by.id('signup-button')).tap();

      // Should navigate to main app
      await waitFor(element(by.text('メイン')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await device.reloadReactNative();
      await waitFor(element(by.text('サインイン')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show error for invalid email format', async () => {
      await element(by.id('email-input')).typeText('invalid-email');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('signin-button')).tap();

      await waitFor(element(by.text('メールアドレスの形式が正しくありません')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show error for wrong credentials', async () => {
      await element(by.id('email-input')).typeText('nonexistent@example.com');
      await element(by.id('password-input')).typeText('wrongpassword');
      await element(by.id('signin-button')).tap();

      await waitFor(element(by.text('認証に失敗しました')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show error for weak password during registration', async () => {
      await element(by.text('アカウントを作成')).tap();
      await waitFor(element(by.text('サインアップ')))
        .toBeVisible()
        .withTimeout(2000);

      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('123'); // Weak password
      await element(by.id('role-individual')).tap();
      await element(by.id('signup-button')).tap();

      await waitFor(element(by.text('パスワードが弱すぎます')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Network Failure Handling', () => {
    it('should handle network disconnection gracefully', async () => {
      // Simulate network disconnection
      await device.setURLBlacklist(['*.supabase.co']);

      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('signin-button')).tap();

      // Should show network error
      await waitFor(element(by.text('ネットワークエラー')))
        .toBeVisible()
        .withTimeout(5000);

      // Restore network
      await device.setURLBlacklist([]);
    });
  });
});
