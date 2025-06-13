import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import ProgressCircle from '../components/ProgressCircle';
import {useRestTimer} from '../hooks/useRestTimer';

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
              {(() => {
                if (isRunning) return '⏸️ 一時停止';
                if (isPaused) return '▶️ 再開';
                return '▶️ 開始';
              })()}
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
  adjustButton: {
    alignItems: 'center',
    borderRadius: 8,
    minWidth: 80,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adjustButtons: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 24,
  },
  container: {
    backgroundColor: '#f8f9fa',
    flex: 1,
  },
  controlsSection: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  decreaseButton: {
    backgroundColor: '#e74c3c',
  },
  finishedText: {
    color: '#e74c3c',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  increaseButton: {
    backgroundColor: '#27ae60',
  },
  mainButton: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 4,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  mainControls: {
    gap: 12,
  },
  pauseButton: {
    backgroundColor: '#f39c12',
  },
  presetButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#3498db',
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 80,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  presetButtonText: {
    color: '#3498db',
    fontSize: 12,
    fontWeight: '600',
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  presetsSection: {
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  presetsTitle: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 12,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedPresetButton: {
    backgroundColor: '#3498db',
  },
  selectedPresetButtonText: {
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#3498db',
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  timerText: {
    fontFamily: 'monospace',
    fontSize: 48,
    fontWeight: 'bold',
  },
  title: {
    color: '#2c3e50',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  totalTimeText: {
    color: '#7f8c8d',
    fontSize: 16,
    marginTop: 8,
  },
});
