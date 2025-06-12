import React from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function LoadingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>トレーニング声メモくん</Text>
        <ActivityIndicator size="large" color="#3498db" style={styles.spinner} />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    color: '#7f8c8d',
    fontSize: 16,
    textAlign: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  title: {
    color: '#2c3e50',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
});
