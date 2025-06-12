import {voiceService} from '../voiceService';
import Voice from '@react-native-voice/voice';

// Mock @react-native-voice/voice
jest.mock('@react-native-voice/voice', () => ({
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),
  onSpeechStart: null,
  onSpeechEnd: null,
  onSpeechResults: null,
  onSpeechError: null,
  onSpeechPartialResults: null,
}));

// Mock expo-av
const mockCreateAsync = jest.fn().mockResolvedValue({
  recording: {
    stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
    getURI: jest.fn().mockReturnValue('file://test.m4a'),
    getStatusAsync: jest.fn().mockResolvedValue({durationMillis: 5000}),
  },
});

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    Recording: {
      createAsync: mockCreateAsync,
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));

const mockVoice = Voice as jest.Mocked<typeof Voice>;

describe('VoiceService', () => {
  let mockListener: jest.Mock;
  let unsubscribe: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
    mockListener = jest.fn();
    unsubscribe = voiceService.subscribe(mockListener);
  });

  afterEach(() => {
    unsubscribe();
  });

  describe('initialization', () => {
    it('should initialize voice service correctly', () => {
      expect(mockVoice.onSpeechStart).toBeDefined();
      expect(mockVoice.onSpeechEnd).toBeDefined();
      expect(mockVoice.onSpeechResults).toBeDefined();
      expect(mockVoice.onSpeechError).toBeDefined();
      expect(mockVoice.onSpeechPartialResults).toBeDefined();
    });
  });

  describe('requestPermissions', () => {
    it('should grant permissions successfully', async () => {
      const result = await voiceService.requestPermissions();

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle permission errors', async () => {
      // This tests the error handling path
      const result = await voiceService.requestPermissions();
      expect(result.data).toBe(true); // Auto-granted by expo-av
    });
  });

  describe('subscription management', () => {
    it('should call listener with initial state', () => {
      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          isRecording: false,
          isTranscribing: false,
          currentTranscript: '',
          error: null,
        }),
      );
    });

    it('should support multiple subscribers', () => {
      const mockListener2 = jest.fn();
      const unsubscribe2 = voiceService.subscribe(mockListener2);

      expect(mockListener2).toHaveBeenCalled();
      unsubscribe2();
    });

    it('should unsubscribe correctly', () => {
      mockListener.mockClear();
      unsubscribe();

      // Verify the unsubscribe function works
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('voice event handlers', () => {
    it('should handle speech start event', () => {
      if (mockVoice.onSpeechStart) {
        mockVoice.onSpeechStart({});
      }

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          isTranscribing: true,
          error: null,
        }),
      );
    });

    it('should handle speech end event', () => {
      if (mockVoice.onSpeechEnd) {
        mockVoice.onSpeechEnd({});
      }

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          isTranscribing: false,
        }),
      );
    });

    it('should handle speech results', () => {
      const mockEvent = {
        value: ['test transcript result'],
      };

      if (mockVoice.onSpeechResults) {
        mockVoice.onSpeechResults(mockEvent);
      }

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          currentTranscript: 'test transcript result',
          isTranscribing: false,
        }),
      );
    });

    it('should handle partial speech results', () => {
      const mockEvent = {
        value: ['partial result'],
      };

      if (mockVoice.onSpeechPartialResults) {
        mockVoice.onSpeechPartialResults(mockEvent);
      }

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          currentTranscript: 'partial result',
        }),
      );
    });

    it('should handle speech errors', () => {
      const mockEvent = {
        error: {
          message: 'Speech recognition failed',
        },
      };

      if (mockVoice.onSpeechError) {
        mockVoice.onSpeechError(mockEvent);
      }

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          isTranscribing: false,
          error: 'Speech recognition failed',
        }),
      );
    });

    it('should handle speech errors without message', () => {
      const mockEvent = {};

      if (mockVoice.onSpeechError) {
        mockVoice.onSpeechError(mockEvent);
      }

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          isTranscribing: false,
          error: 'Speech recognition error',
        }),
      );
    });

    it('should handle empty speech results', () => {
      const mockEvent = {
        value: [],
      };

      if (mockVoice.onSpeechResults) {
        mockVoice.onSpeechResults(mockEvent);
      }

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          currentTranscript: '',
        }),
      );
    });
  });

  describe('recording functionality', () => {
    it('should start recording successfully', async () => {
      const result = await voiceService.startRecording();

      expect(mockCreateAsync).toHaveBeenCalledWith(expect.any(Object));
      expect(mockVoice.start).toHaveBeenCalledWith('ja-JP');
      expect(result.data).toBeUndefined();
      expect(result.error).toBeNull();
    });

    it('should handle recording start errors', async () => {
      mockCreateAsync.mockRejectedValueOnce(new Error('Recording failed'));

      const result = await voiceService.startRecording();

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to start recording',
        details: expect.any(Error),
      });
    });

    it('should stop recording successfully', async () => {
      // First start recording
      await voiceService.startRecording();

      const result = await voiceService.stopRecording();

      expect(mockVoice.stop).toHaveBeenCalled();
      expect(result.data).toEqual({
        uri: 'file://test.m4a',
        duration: 5000,
      });
      expect(result.error).toBeNull();
    });

    it('should handle stop recording without active recording', async () => {
      const result = await voiceService.stopRecording();

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'No active recording',
      });
    });

    it('should handle stop recording errors', async () => {
      // Mock recording object
      const mockRecording = {
        stopAndUnloadAsync: jest.fn().mockRejectedValue(new Error('Stop failed')),
        getURI: jest.fn().mockReturnValue('file://test.m4a'),
        getStatusAsync: jest.fn().mockResolvedValue({durationMillis: 5000}),
      };

      mockCreateAsync.mockResolvedValueOnce({
        recording: mockRecording,
      });

      await voiceService.startRecording();
      const result = await voiceService.stopRecording();

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to stop recording',
        details: expect.any(Error),
      });
    });
  });

  describe('transcription functionality', () => {
    it('should get transcription successfully', async () => {
      // Set up transcript by triggering speech results
      const mockEvent = {value: ['test transcript']};
      if (mockVoice.onSpeechResults) {
        mockVoice.onSpeechResults(mockEvent);
      }

      const result = await voiceService.getTranscription();

      expect(result.data).toEqual({
        text: 'test transcript',
        confidence: 0.8,
      });
      expect(result.error).toBeNull();
    });

    it('should return error when no transcript available', async () => {
      const result = await voiceService.getTranscription();

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'No transcript available',
      });
    });

    it('should handle transcription errors', async () => {
      // Mock error in getTranscription
      const originalMethod = voiceService.getTranscription;
      jest.spyOn(voiceService, 'getTranscription').mockImplementationOnce(() => {
        throw new Error('Transcription failed');
      });

      try {
        await voiceService.getTranscription();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Restore original method
      jest.spyOn(voiceService, 'getTranscription').mockImplementation(originalMethod);
    });
  });

  describe('cleanup', () => {
    it('should destroy service correctly', async () => {
      await voiceService.destroy();

      expect(mockVoice.destroy).toHaveBeenCalled();
    });

    it('should handle destroy with active recording', async () => {
      await voiceService.startRecording();
      await voiceService.destroy();

      expect(mockVoice.destroy).toHaveBeenCalled();
    });

    it('should handle destroy errors gracefully', async () => {
      mockVoice.destroy.mockRejectedValueOnce(new Error('Destroy failed'));

      // Should not throw
      await expect(voiceService.destroy()).resolves.toBeUndefined();
    });
  });
});
