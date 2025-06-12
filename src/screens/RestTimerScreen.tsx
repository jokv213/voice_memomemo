import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRestTimer} from '../hooks/useRestTimer';
import ProgressCircle from '../components/ProgressCircle';

const PRESET_TIMES = [30, 60, 90, 120, 180, 300]; // seconds

export default function RestTimerScreen() {
  const {
    timeRemaining,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    adjustTime,
    setPresetTime,
    formatTime,
    formatTotalTime,
    getProgress,
  } = useRestTimer();

  const [selectedPreset, setSelectedPreset] = useState(60);

  const handlePresetSelect = async (seconds: number) => {
    if (isRunning) {
      Alert.alert(
        '確認',
        `タイマーをリセットして${Math.floor(seconds / 60)}分${seconds % 60 > 0 ? `${seconds % 60}秒` : ''}に設定しますか？`,
        [
          {text: 'キャンセル', style: 'cancel'},
          {
            text: 'リセット',
            onPress: async () => {
              await setPresetTime(seconds);
              setSelectedPreset(seconds);
            },
          },
        ],
      );
    } else {
      await setPresetTime(seconds);
      setSelectedPreset(seconds);
    }
  };

  const handleStartPause = async () => {
    if (isRunning) {
      await pauseTimer();
    } else if (isPaused) {
      await resumeTimer();
    } else {
      await startTimer(selectedPreset);
    }
  };

  const handleReset = async () => {
    await resetTimer();
  };

  const formatPresetTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}分${remainingSeconds > 0 ? `${remainingSeconds}秒` : ''}`
      : `${remainingSeconds}秒`;
  };

  const getTimerColor = (): string => {
    if (timeRemaining === 0) return '#e74c3c';
    if (timeRemaining <= 10) return '#f39c12';
    return '#3498db';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>レストタイマー</Text>
        <Text style={styles.subtitle}>インターバル管理</Text>
      </View>

      <View style={styles.timerSection}>
        <ProgressCircle
          progress={getProgress()}
          size={240}
          strokeWidth={12}
          color={getTimerColor()}
          showPercentage={false}>
          <View style={styles.timerContent}>
            <Text style={[styles.timerText, {color: getTimerColor()}]}>{formatTime()}</Text>
            <Text style={styles.totalTimeText}>/ {formatTotalTime()}</Text>
          </View>
        </ProgressCircle>

        {timeRemaining === 0 && <Text style={styles.finishedText}>⏰ インターバル終了！</Text>}
      </View>

      <View style={styles.controlsSection}>
        <View style={styles.adjustButtons}>
          <TouchableOpacity
            style={[styles.adjustButton, styles.decreaseButton]}
            onPress={() => adjustTime(-10)}
            disabled={timeRemaining <= 10}>
            <Text style={styles.adjustButtonText}>-10秒</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adjustButton, styles.increaseButton]}
            onPress={() => adjustTime(10)}>
            <Text style={styles.adjustButtonText}>+10秒</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainControls}>
          <TouchableOpacity
            style={[styles.mainButton, isRunning ? styles.pauseButton : styles.startButton]}
            onPress={handleStartPause}>
            <Text style={styles.mainButtonText}>
              {isRunning ? '⏸️ 一時停止' : isPaused ? '▶️ 再開' : '▶️ 開始'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>🔄 リセット</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.presetsSection}>
        <Text style={styles.presetsTitle}>クイック設定</Text>
        <View style={styles.presetButtons}>
          {PRESET_TIMES.map(seconds => (
            <TouchableOpacity
              key={seconds}
              style={[
                styles.presetButton,
                selectedPreset === seconds && styles.selectedPresetButton,
              ]}
              onPress={() => handlePresetSelect(seconds)}>
              <Text
                style={[
                  styles.presetButtonText,
                  selectedPreset === seconds && styles.selectedPresetButtonText,
                ]}>
                {formatPresetTime(seconds)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  totalTimeText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 8,
  },
  finishedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e74c3c',
    marginTop: 24,
    textAlign: 'center',
  },
  controlsSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  adjustButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  adjustButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  decreaseButton: {
    backgroundColor: '#e74c3c',
  },
  increaseButton: {
    backgroundColor: '#27ae60',
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mainControls: {
    gap: 12,
  },
  mainButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButton: {
    backgroundColor: '#3498db',
  },
  pauseButton: {
    backgroundColor: '#f39c12',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#95a5a6',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  presetsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  presetsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3498db',
    backgroundColor: '#fff',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedPresetButton: {
    backgroundColor: '#3498db',
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3498db',
  },
  selectedPresetButtonText: {
    color: '#fff',
  },
});
