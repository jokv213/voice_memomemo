describe('Smoke Test', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show welcome screen', async () => {
    await expect(element(by.text('Welcome'))).toBeVisible();
  });

  it('should be able to navigate through the app', async () => {
    // Test basic navigation and app startup
    await expect(element(by.id('app-root'))).toBeVisible();
  });
});
