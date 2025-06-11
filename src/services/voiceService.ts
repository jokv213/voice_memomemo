import {Audio} from 'expo-av';
import Voice from '@react-native-voice/voice';
import * as Permissions from 'expo-permissions';
import {Result} from '../lib/supabase';

export interface VoiceRecording {
  uri: string;
  duration: number;
}

export interface VoiceTranscription {
  text: string;
  confidence: number;
}

export interface VoiceServiceState {
  isRecording: boolean;
  isTranscribing: boolean;
  hasPermission: boolean;
  currentTranscript: string;
  error: string | null;
}

class VoiceService {
  private recording: Audio.Recording | null = null;
  private isInitialized = false;
  private listeners: ((state: VoiceServiceState) => void)[] = [];
  private state: VoiceServiceState = {
    isRecording: false,
    isTranscribing: false,
    hasPermission: false,
    currentTranscript: '',
    error: null,
  };

  constructor() {
    this.initializeVoiceService();
  }

  private async initializeVoiceService(): Promise<void> {
    try {
      // Initialize Voice recognition
      Voice.onSpeechStart = this.onSpeechStart.bind(this);
      Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
      Voice.onSpeechResults = this.onSpeechResults.bind(this);
      Voice.onSpeechError = this.onSpeechError.bind(this);
      Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);

      this.isInitialized = true;
    } catch {
      this.updateState({error: 'Failed to initialize voice service'});
    }
  }

  private onSpeechStart = (): void => {
    this.updateState({isTranscribing: true, error: null});
  };

  private onSpeechEnd = (): void => {
    this.updateState({isTranscribing: false});
  };

  private onSpeechResults = (event: any): void => {
    const results = event.value || [];
    const transcript = results[0] || '';
    this.updateState({
      currentTranscript: transcript,
      isTranscribing: false,
    });
  };

  private onSpeechPartialResults = (event: any): void => {
    const results = event.value || [];
    const transcript = results[0] || '';
    this.updateState({currentTranscript: transcript});
  };

  private onSpeechError = (event: any): void => {
    this.updateState({
      isTranscribing: false,
      error: event.error?.message || 'Speech recognition error',
    });
  };

  private updateState(updates: Partial<VoiceServiceState>): void {
    this.state = {...this.state, ...updates};
    this.listeners.forEach(listener => listener(this.state));
  }

  public subscribe(listener: (state: VoiceServiceState) => void): () => void {
    this.listeners.push(listener);
    // Send current state immediately
    listener(this.state);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public async requestPermissions(): Promise<Result<boolean>> {
    try {
      // Request microphone permission
      const {status: audioStatus} = await Permissions.askAsync(Permissions.AUDIO_RECORDING);

      if (audioStatus !== 'granted') {
        return {
          data: null,
          error: {message: 'Microphone permission is required for voice recording'},
        };
      }

      this.updateState({hasPermission: true});
      return {data: true, error: null};
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Failed to request permissions',
          details: error,
        },
      };
    }
  }

  public async startRecording(): Promise<Result<void>> {
    try {
      if (!this.state.hasPermission) {
        const permResult = await this.requestPermissions();
        if (permResult.error) return permResult;
      }

      if (!this.isInitialized) {
        await this.initializeVoiceService();
      }

      // Start audio recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const {recording} = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
      );
      this.recording = recording;

      // Start speech recognition
      await Voice.start('ja-JP'); // Japanese locale

      this.updateState({
        isRecording: true,
        currentTranscript: '',
        error: null,
      });

      return {data: undefined, error: null};
    } catch (error) {
      this.updateState({isRecording: false});
      return {
        data: null,
        error: {
          message: 'Failed to start recording',
          details: error,
        },
      };
    }
  }

  public async stopRecording(): Promise<Result<VoiceRecording>> {
    try {
      if (!this.recording) {
        return {
          data: null,
          error: {message: 'No active recording'},
        };
      }

      // Stop voice recognition
      await Voice.stop();

      // Stop audio recording
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI() || '';
      const status = await this.recording.getStatusAsync();
      const duration = status.isLoaded ? status.durationMillis || 0 : 0;

      this.recording = null;
      this.updateState({isRecording: false});

      return {
        data: {uri, duration},
        error: null,
      };
    } catch (error) {
      this.updateState({isRecording: false});
      return {
        data: null,
        error: {
          message: 'Failed to stop recording',
          details: error,
        },
      };
    }
  }

  public async getTranscription(): Promise<Result<VoiceTranscription>> {
    try {
      if (!this.state.currentTranscript) {
        return {
          data: null,
          error: {message: 'No transcript available'},
        };
      }

      return {
        data: {
          text: this.state.currentTranscript,
          confidence: 0.8, // Mock confidence score
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Failed to get transcription',
          details: error,
        },
      };
    }
  }

  public async destroy(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      await Voice.destroy();
      this.listeners = [];
    } catch (error) {
      console.warn('Error destroying voice service:', error);
    }
  }
}

export const voiceService = new VoiceService();
