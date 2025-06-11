import {useEffect, useState, useCallback} from 'react';
import {voiceService, VoiceServiceState} from '../services/voiceService';
import {parseExerciseFromText} from '../data/exerciseDictionary';

export interface ParsedExerciseData {
  exercise?: string;
  weight?: number;
  side?: string;
  reps?: number;
  sets?: number;
  isStructured: boolean;
  originalText: string;
}

export function useVoiceRecording() {
  const [voiceState, setVoiceState] = useState<VoiceServiceState>({
    isRecording: false,
    isTranscribing: false,
    hasPermission: false,
    currentTranscript: '',
    error: null,
  });

  const [parsedData, setParsedData] = useState<ParsedExerciseData | null>(null);

  useEffect(() => {
    const unsubscribe = voiceService.subscribe(setVoiceState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (voiceState.currentTranscript) {
      const parsed = parseExerciseFromText(voiceState.currentTranscript);
      setParsedData(parsed);
    }
  }, [voiceState.currentTranscript]);

  const startRecording = useCallback(async () => {
    const result = await voiceService.startRecording();
    if (result.error) {
      console.error('Failed to start recording:', result.error);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const result = await voiceService.stopRecording();
    if (result.error) {
      console.error('Failed to stop recording:', result.error);
    }
    return result;
  }, []);

  const requestPermissions = useCallback(async () => {
    const result = await voiceService.requestPermissions();
    if (result.error) {
      console.error('Failed to request permissions:', result.error);
    }
    return result;
  }, []);

  const clearTranscript = useCallback(() => {
    setParsedData(null);
  }, []);

  return {
    // Voice state
    isRecording: voiceState.isRecording,
    isTranscribing: voiceState.isTranscribing,
    hasPermission: voiceState.hasPermission,
    currentTranscript: voiceState.currentTranscript,
    error: voiceState.error,

    // Parsed exercise data
    parsedData,

    // Actions
    startRecording,
    stopRecording,
    requestPermissions,
    clearTranscript,
  };
}
