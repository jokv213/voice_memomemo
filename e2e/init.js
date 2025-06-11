const {beforeAll, beforeEach, afterAll} = require('@jest/globals');
const {device, cleanup} = require('detox');
const adapter = require('detox/runners/jest/adapter');

// Set the default timeout
jest.setTimeout(120000);

beforeAll(async () => {
  await adapter.beforeAll();
  await device.launchApp();
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
  await cleanup();
});
