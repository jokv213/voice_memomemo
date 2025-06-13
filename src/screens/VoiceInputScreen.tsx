import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAuth} from '../contexts/AuthContext';
import {useVoiceRecording} from '../hooks/useVoiceRecording';
import {formatExercise, formatMemo} from '../llm';
import {sessionService, SessionService, Session} from '../services/sessionService';

export default function VoiceInputScreen() {
  const {signOut} = useAuth();
  const {
    isRecording,
    isTranscribing,
    hasPermission,
    currentTranscript,
    error,
    parsedData,
    startRecording,
    stopRecording,
    requestPermissions,
    clearTranscript,
  } = useVoiceRecording();

  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnimation]);

  const stopPulseAnimation = useCallback(() => {
    pulseAnimation.stopAnimation();
    Animated.timing(pulseAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [pulseAnimation]);

  useEffect(() => {
    loadTodaysSession();
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isRecording, startPulseAnimation, stopPulseAnimation]);

  const loadTodaysSession = async () => {
    const result = await sessionService.getOrCreateTodaysSession();
    if (result.error) {
      Alert.alert('エラー', 'セッションの作成に失敗しました');
    } else {
      setCurrentSession(result.data);
    }
  };

  const handleRecordPress = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      if (!hasPermission) {
        const result = await requestPermissions();
        if (result.error) {
          Alert.alert('権限エラー', 'マイクの権限が必要です');
          return;
        }
      }
      await startRecording();
    }
  };

  const handleSaveExercise = async () => {
    if (!parsedData || !currentSession) return;

    setIsSaving(true);
    try {
      // Format exercise data with OpenAI
      let formattedExercise;
      let formattedMemo;

      try {
        formattedExercise = await formatExercise(currentTranscript || '', {
          exercise: parsedData.exercise,
          weight: parsedData.weight,
          reps: parsedData.reps,
          sets: parsedData.sets,
          side: parsedData.side,
        });

        // Format memo if there's unstructured text
        if (!parsedData.isStructured && parsedData.originalText) {
          formattedMemo = await formatMemo(currentTranscript || '', {
            content: parsedData.originalText,
            exercise: formattedExercise.exercise,
          });
        }
      } catch (llmError) {
        // Show toast/alert for LLM error but continue with original data
        Alert.alert('AI処理エラー', 'データの整形に失敗しましたが、元のデータで保存を続行します');
        formattedExercise = {
          exercise: parsedData.exercise || '不明な種目',
          weight: parsedData.weight,
          reps: parsedData.reps,
          sets: parsedData.sets,
          side: parsedData.side,
        };
        formattedMemo = parsedData.originalText;
      }

      const result = await SessionService.addExerciseLog({
        session_id: currentSession.id,
        exercise: formattedExercise.exercise,
        weight: formattedExercise.weight,
        side: formattedExercise.side,
        reps: formattedExercise.reps,
        sets: formattedExercise.sets,
        memo: formattedMemo || (parsedData.isStructured ? undefined : parsedData.originalText),
      });

      if (result.error) {
        Alert.alert('エラー', '保存に失敗しました');
      } else {
        Alert.alert('成功', 'トレーニングデータを保存しました');
        clearTranscript();
      }
    } catch (saveError) {
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>音声入力</Text>
          {currentSession && <Text style={styles.sessionTitle}>{currentSession.title}</Text>}
        </View>

        <View style={styles.recordingSection}>
          <Animated.View style={[styles.recordButton, {transform: [{scale: pulseAnimation}]}]}>
            <TouchableOpacity
              style={[styles.recordButtonInner, isRecording && styles.recordButtonActive]}
              onPress={handleRecordPress}
              disabled={isTranscribing}>
              <Text style={styles.recordButtonIcon}>{isRecording ? '⏹️' : '🎤'}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.recordingStatus}>
            {(() => {
              if (isRecording) return '録音中...';
              if (isTranscribing) return '音声認識中...';
              return '録音ボタンを押してトレーニングを記録';
            })()}
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {currentTranscript && (
          <View style={styles.transcriptSection}>
            <Text style={styles.sectionTitle}>認識結果</Text>
            <View style={styles.transcriptCard}>
              <Text style={styles.transcriptText}>{currentTranscript}</Text>
            </View>

            {parsedData && (
              <View style={styles.parsedDataSection}>
                <Text style={styles.sectionTitle}>
                  {parsedData.isStructured ? '構造化データ' : 'メモ'}
                </Text>

                {parsedData.isStructured ? (
                  <View style={styles.structuredDataCard}>
                    {parsedData.exercise && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>種目:</Text>
                        <Text style={styles.dataValue}>{parsedData.exercise}</Text>
                      </View>
                    )}
                    {parsedData.weight && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>重量:</Text>
                        <Text style={styles.dataValue}>{parsedData.weight}kg</Text>
                      </View>
                    )}
                    {parsedData.side && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>左右:</Text>
                        <Text style={styles.dataValue}>{parsedData.side}</Text>
                      </View>
                    )}
                    {parsedData.reps && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>回数:</Text>
                        <Text style={styles.dataValue}>{parsedData.reps}回</Text>
                      </View>
                    )}
                    {parsedData.sets && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>セット:</Text>
                        <Text style={styles.dataValue}>{parsedData.sets}セット</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.memoCard}>
                    <Text style={styles.memoText}>{parsedData.originalText}</Text>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveExercise}
                    disabled={isSaving}>
                    <Text style={styles.saveButtonText}>{isSaving ? '保存中...' : '保存'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.clearButton} onPress={clearTranscript}>
                    <Text style={styles.clearButtonText}>クリア</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>ログアウト</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 12,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#f8f9fa',
    flex: 1,
  },
  dataLabel: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: '600',
    width: 80,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dataValue: {
    color: '#2c3e50',
    flex: 1,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderColor: '#fcc',
    borderRadius: 8,
    borderWidth: 1,
    margin: 16,
    padding: 12,
  },
  errorText: {
    color: '#c0392b',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  memoCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  memoText: {
    color: '#856404',
    fontSize: 14,
    fontStyle: 'italic',
  },
  parsedDataSection: {
    marginTop: 8,
  },
  recordButton: {
    marginBottom: 24,
  },
  recordButtonActive: {
    backgroundColor: '#e74c3c',
  },
  recordButtonIcon: {
    fontSize: 48,
  },
  recordButtonInner: {
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 60,
    elevation: 8,
    height: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 120,
  },
  recordingSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  recordingStatus: {
    color: '#7f8c8d',
    fontSize: 16,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#27ae60',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: '#2c3e50',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sessionTitle: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  structuredDataCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  title: {
    color: '#2c3e50',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transcriptCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transcriptSection: {
    padding: 24,
  },
  transcriptText: {
    color: '#2c3e50',
    fontSize: 16,
    lineHeight: 24,
  },
});
