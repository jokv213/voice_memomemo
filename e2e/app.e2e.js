const {device, expect, element, by} = require('detox');

describe('Training Voice Memo App', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
  });

  it('should show welcome screen', async () => {
    await expect(element(by.text('Open up App.tsx to start working on your app!'))).toBeVisible();
  });

  it('should navigate through app without crashes', async () => {
    // This is a basic smoke test to ensure the app doesn't crash on startup
    await device.reloadReactNative();
    await expect(element(by.text('Open up App.tsx to start working on your app!'))).toBeVisible();
  });
});
