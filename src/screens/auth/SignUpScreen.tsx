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

interface SignUpScreenProps {
  navigation: StackNavigationProp<AuthStackParamList, 'SignUp'>;
}

export default function SignUpScreen({navigation}: SignUpScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'individual' | 'trainer'>('individual');
  const {signUp, loading, error, clearError} = useAuth();

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('エラー', 'すべての項目を入力してください');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      Alert.alert('エラー', 'パスワードは6文字以上で入力してください');
      return;
    }

    clearError();
    await signUp(email.trim(), password, role);
  };

  const navigateToSignIn = () => {
    clearError();
    navigation.navigate('SignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>トレーニング声メモくん</Text>
            <Text style={styles.subtitle}>新規登録</Text>

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
                  placeholder="6文字以上で入力"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="new-password"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>パスワード確認</Text>
                <TextInput
                  style={styles.input}
                  placeholder="パスワードを再入力"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoComplete="new-password"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>アカウント種別</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity
                    style={[styles.roleButton, role === 'individual' && styles.roleButtonSelected]}
                    onPress={() => setRole('individual')}
                    disabled={loading}>
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'individual' && styles.roleButtonTextSelected,
                      ]}>
                      個人利用
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleButton, role === 'trainer' && styles.roleButtonSelected]}
                    onPress={() => setRole('trainer')}
                    disabled={loading}>
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'trainer' && styles.roleButtonTextSelected,
                      ]}>
                      トレーナー
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.signUpButton, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}>
                <Text style={styles.signUpButtonText}>{loading ? '登録中...' : '新規登録'}</Text>
              </TouchableOpacity>

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>すでにアカウントをお持ちの方は</Text>
                <TouchableOpacity onPress={navigateToSignIn} disabled={loading}>
                  <Text style={styles.signInLink}>ログイン</Text>
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
  roleButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#3498db',
    borderRadius: 8,
    borderWidth: 2,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  roleButtonSelected: {
    backgroundColor: '#3498db',
  },
  roleButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  roleButtonTextSelected: {
    color: '#fff',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  signInContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 16,
  },
  signInLink: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  signInText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  signUpButton: {
    alignItems: 'center',
    backgroundColor: '#27ae60',
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 16,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
