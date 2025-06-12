const {device, element, by, waitFor} = require('detox');

describe('Training Voice Memo App - Basic Tests', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
  });

  describe('App Startup', () => {
    it('should start without crashing', async () => {
      // Basic test: app should start and show something
      await waitFor(
        element(by.text('トレーニング声メモくん')).or(
          element(by.text('サインイン')).or(element(by.text('Loading...'))),
        ),
      )
        .toBeVisible()
        .withTimeout(30000);
    });
  });
});
