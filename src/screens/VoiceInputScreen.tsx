import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../contexts/AuthContext';
import {useVoiceRecording} from '../hooks/useVoiceRecording';
import {sessionService, Session} from '../services/sessionService';

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
  const pulseAnimation = new Animated.Value(1);

  useEffect(() => {
    loadTodaysSession();
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isRecording]);

  const startPulseAnimation = () => {
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
  };

  const stopPulseAnimation = () => {
    pulseAnimation.stopAnimation();
    Animated.timing(pulseAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

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
      const result = await sessionService.addExerciseLog({
        session_id: currentSession.id,
        exercise: parsedData.exercise || '不明な種目',
        weight: parsedData.weight,
        side: parsedData.side,
        reps: parsedData.reps,
        sets: parsedData.sets,
        memo: parsedData.isStructured ? undefined : parsedData.originalText,
      });

      if (result.error) {
        Alert.alert('エラー', '保存に失敗しました');
      } else {
        Alert.alert('成功', 'トレーニングデータを保存しました');
        clearTranscript();
      }
    } catch {
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
            {isRecording
              ? '録音中...'
              : isTranscribing
                ? '音声認識中...'
                : '録音ボタンを押してトレーニングを記録'}
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  recordingSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  recordButton: {
    marginBottom: 24,
  },
  recordButtonInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordButtonActive: {
    backgroundColor: '#e74c3c',
  },
  recordButtonIcon: {
    fontSize: 48,
  },
  recordingStatus: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c0392b',
    textAlign: 'center',
    fontSize: 14,
  },
  transcriptSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  transcriptCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transcriptText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  parsedDataSection: {
    marginTop: 8,
  },
  structuredDataCard: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
    width: 80,
  },
  dataValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  memoCard: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  memoText: {
    fontSize: 14,
    color: '#856404',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
