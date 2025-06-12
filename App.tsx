import {StatusBar} from 'expo-status-bar';
import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import {AuthProvider} from './src/contexts/AuthContext';
import {initSentry} from './src/lib/sentry';
import RootNavigator from './src/navigation/RootNavigator';
import {ErrorBoundary} from './src/services/errorService';

// Initialize Sentry on app start
initSentry();

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  errorMessage: {
    color: '#2c3e50',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#e74c3c',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

function ErrorFallback({resetError}: {resetError: () => void}) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>エラーが発生しました</Text>
      <Text style={styles.errorMessage}>アプリケーションで予期しないエラーが発生しました。</Text>
      <TouchableOpacity style={styles.resetButton} onPress={resetError}>
        <Text style={styles.resetButtonText}>アプリを再起動</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  useEffect(() => {
    // Additional app initialization if needed
  }, []);

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <AuthProvider>
        <RootNavigator />
        {/* eslint-disable-next-line react/style-prop-object */}
        <StatusBar style="auto" />
      </AuthProvider>
    </ErrorBoundary>
  );
}
