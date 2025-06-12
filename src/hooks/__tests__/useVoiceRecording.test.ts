import {renderHook, act} from '@testing-library/react-native';
import {useVoiceRecording} from '../useVoiceRecording';
import {voiceService} from '../../services/voiceService';
import {parseExerciseFromText} from '../../data/exerciseDictionary';

// Mock voiceService
jest.mock('../../services/voiceService', () => ({
  voiceService: {
    subscribe: jest.fn(),
    requestPermissions: jest.fn(),
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    getTranscription: jest.fn(),
  },
}));

// Mock exercise dictionary
jest.mock('../../data/exerciseDictionary', () => ({
  parseExerciseFromText: jest.fn(),
}));

const mockVoiceService = voiceService as jest.Mocked<typeof voiceService>;
const mockParseExercise = parseExerciseFromText as jest.MockedFunction<
  typeof parseExerciseFromText
>;

describe('useVoiceRecording', () => {
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockVoiceService.subscribe.mockReturnValue(mockUnsubscribe);
    mockVoiceService.requestPermissions.mockResolvedValue({data: true, error: null});
    mockVoiceService.startRecording.mockResolvedValue({data: undefined, error: null});
    mockVoiceService.stopRecording.mockResolvedValue({
      data: {uri: 'file://test.m4a', duration: 5000},
      error: null,
    });
    mockVoiceService.getTranscription.mockResolvedValue({
      data: {text: 'Test transcript', confidence: 0.9},
      error: null,
    });
    mockParseExercise.mockReturnValue({
      exercise: 'ベンチプレス',
      weight: 100,
      reps: 10,
      sets: 3,
      isStructured: true,
      originalText: 'ベンチプレス 100キロ 10回 3セット',
    });
  });

  it('should initialize with default state', () => {
    const {result} = renderHook(() => useVoiceRecording());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isTranscribing).toBe(false);
    expect(result.current.hasPermission).toBe(false);
    expect(result.current.currentTranscript).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('should subscribe to voice service on mount', () => {
    renderHook(() => useVoiceRecording());

    expect(mockVoiceService.subscribe).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should unsubscribe on unmount', () => {
    const {unmount} = renderHook(() => useVoiceRecording());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should start recording successfully', async () => {
    const {result} = renderHook(() => useVoiceRecording());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(mockVoiceService.startRecording).toHaveBeenCalled();
  });

  it('should stop recording successfully', async () => {
    const {result} = renderHook(() => useVoiceRecording());

    await act(async () => {
      await result.current.stopRecording();
    });

    expect(mockVoiceService.stopRecording).toHaveBeenCalled();
  });

  it('should request permissions successfully', async () => {
    const {result} = renderHook(() => useVoiceRecording());

    let permissionResult;
    await act(async () => {
      permissionResult = await result.current.requestPermissions();
    });

    expect(mockVoiceService.requestPermissions).toHaveBeenCalled();
    expect(permissionResult).toEqual({
      data: true,
      error: null,
    });
  });

  describe('exercise parsing', () => {
    it('should parse transcript into exercise data', () => {
      // Set up a transcript that triggers parsing
      const mockListener = mockVoiceService.subscribe.mock.calls[0][0];

      const {result} = renderHook(() => useVoiceRecording());

      act(() => {
        mockListener({
          isRecording: false,
          isTranscribing: false,
          hasPermission: true,
          currentTranscript: 'ベンチプレス 100キロ 10回 3セット',
          error: null,
        });
      });

      expect(mockParseExercise).toHaveBeenCalledWith('ベンチプレス 100キロ 10回 3セット');
      expect(result.current.parsedData).toEqual({
        exercise: 'ベンチプレス',
        weight: 100,
        reps: 10,
        sets: 3,
        isStructured: true,
        originalText: 'ベンチプレス 100キロ 10回 3セット',
      });
    });

    it('should clear parsed data when transcript is cleared', () => {
      const {result} = renderHook(() => useVoiceRecording());

      act(() => {
        result.current.clearTranscript();
      });

      expect(result.current.parsedData).toBeNull();
    });

    it('should not parse empty transcript', () => {
      const mockListener = mockVoiceService.subscribe.mock.calls[0][0];

      renderHook(() => useVoiceRecording());

      act(() => {
        mockListener({
          isRecording: false,
          isTranscribing: false,
          hasPermission: true,
          currentTranscript: '',
          error: null,
        });
      });

      expect(mockParseExercise).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle startRecording errors', async () => {
      mockVoiceService.startRecording.mockResolvedValueOnce({
        data: null,
        error: {message: 'Permission denied'},
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const {result} = renderHook(() => useVoiceRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to start recording:', {
        message: 'Permission denied',
      });
      consoleSpy.mockRestore();
    });

    it('should handle stopRecording errors', async () => {
      mockVoiceService.stopRecording.mockResolvedValueOnce({
        data: null,
        error: {message: 'Recording failed'},
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const {result} = renderHook(() => useVoiceRecording());

      await act(async () => {
        await result.current.stopRecording();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to stop recording:', {
        message: 'Recording failed',
      });
      consoleSpy.mockRestore();
    });

    it('should handle requestPermissions errors', async () => {
      mockVoiceService.requestPermissions.mockResolvedValueOnce({
        data: null,
        error: {message: 'Permission denied'},
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const {result} = renderHook(() => useVoiceRecording());

      await act(async () => {
        await result.current.requestPermissions();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to request permissions:', {
        message: 'Permission denied',
      });
      consoleSpy.mockRestore();
    });
  });

  describe('voice state subscription', () => {
    it('should update all voice state properties', () => {
      const mockListener = mockVoiceService.subscribe.mock.calls[0][0];
      const {result} = renderHook(() => useVoiceRecording());

      act(() => {
        mockListener({
          isRecording: true,
          isTranscribing: true,
          hasPermission: true,
          currentTranscript: 'Live transcript',
          error: 'Some error',
        });
      });

      expect(result.current.isRecording).toBe(true);
      expect(result.current.isTranscribing).toBe(true);
      expect(result.current.hasPermission).toBe(true);
      expect(result.current.currentTranscript).toBe('Live transcript');
      expect(result.current.error).toBe('Some error');
    });

    it('should handle state updates without transcript', () => {
      const mockListener = mockVoiceService.subscribe.mock.calls[0][0];
      const {result} = renderHook(() => useVoiceRecording());

      act(() => {
        mockListener({
          isRecording: false,
          isTranscribing: false,
          hasPermission: false,
          currentTranscript: '',
          error: null,
        });
      });

      expect(result.current.isRecording).toBe(false);
      expect(result.current.currentTranscript).toBe('');
    });
  });
});
