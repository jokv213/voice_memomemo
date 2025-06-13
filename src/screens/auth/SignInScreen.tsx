import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAuth} from '../../contexts/AuthContext';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

interface SignInScreenProps {
  navigation: StackNavigationProp<AuthStackParamList, 'SignIn'>;
}

export default function SignInScreen({navigation}: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const {signIn, loading, error, clearError} = useAuth();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    clearError();
    await signIn(email.trim(), password, rememberMe);
  };

  const navigateToSignUp = () => {
    clearError();
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>トレーニング声メモくん</Text>
            <Text style={styles.subtitle}>ログイン</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>メールアドレス</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>パスワード</Text>
                <TextInput
                  style={styles.input}
                  placeholder="パスワードを入力"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
                disabled={loading}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkboxMark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>ログイン状態を保持</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signInButton, loading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={loading}>
                <Text style={styles.signInButtonText}>
                  {loading ? 'ログイン中...' : 'ログイン'}
                </Text>
              </TouchableOpacity>

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>アカウントをお持ちでない方は</Text>
                <TouchableOpacity onPress={navigateToSignUp} disabled={loading}>
                  <Text style={styles.signUpLink}>新規登録</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#3498db',
    borderRadius: 4,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: '#3498db',
  },
  checkboxContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  checkboxLabel: {
    color: '#2c3e50',
    fontSize: 14,
  },
  checkboxMark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#f8f9fa',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderColor: '#fcc',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },
  errorText: {
    color: '#c0392b',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#bdc3c7',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputGroup: {
    gap: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  label: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  signInButton: {
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 16,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 16,
  },
  signUpLink: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  signUpText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
  },
  title: {
    color: '#2c3e50',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});
