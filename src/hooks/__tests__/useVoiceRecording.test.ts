import {renderHook, act} from '@testing-library/react-native';
import {useVoiceRecording} from '../useVoiceRecording';
import {voiceService} from '../../services/voiceService';

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

const mockVoiceService = voiceService as jest.Mocked<typeof voiceService>;

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
});
