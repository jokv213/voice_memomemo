const {device, element, by, waitFor} = require('detox');

describe('Authentication - Basic Tests', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
  });

  describe('Auth Screen', () => {
    it('should show auth screen', async () => {
      // Basic test: auth screen should be visible or user is already logged in
      await waitFor(element(by.text('サインイン')).or(element(by.text('メイン'))))
        .toBeVisible()
        .withTimeout(10000);
    });
  });
});
