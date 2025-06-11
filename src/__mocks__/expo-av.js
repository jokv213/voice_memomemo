// Mock for expo-av
export const Audio = {
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
  Recording: {
    createAsync: jest.fn(() =>
      Promise.resolve({
        recording: {
          startAsync: jest.fn(),
          stopAndUnloadAsync: jest.fn(),
          getURI: jest.fn(() => 'file://recording.m4a'),
          getStatusAsync: jest.fn(() =>
            Promise.resolve({
              durationMillis: 5000,
            }),
          ),
        },
      }),
    ),
  },
  RecordingOptionsPresets: {
    HIGH_QUALITY: {
      android: {
        extension: '.m4a',
        outputFormat: 'aac_adts',
        audioEncoder: 'aac',
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: 'aac_adts',
        audioQuality: 'high',
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    },
  },
};

export default {Audio};
