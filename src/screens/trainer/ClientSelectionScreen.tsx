import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAuth} from '../../contexts/AuthContext';
import {supabase} from '../../lib/supabase';
import {TrainerStackParamList} from '../../navigation/TrainerNavigator';

interface Client {
  id: string;
  email: string;
  created_at: string;
}

interface TrainerClientRow {
  client_id: string;
  profiles: {
    id: string;
    email: string;
    created_at: string;
  } | null;
}

interface ClientSelectionScreenProps {
  navigation: StackNavigationProp<TrainerStackParamList, 'ClientSelection'>;
}

export default function ClientSelectionScreen({navigation}: ClientSelectionScreenProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {user, signOut} = useAuth();

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError('ユーザー情報が見つかりません');
        return;
      }

      // Get clients associated with this trainer
      const {data: trainerClients, error: trainerClientsError} = await supabase
        .from('trainer_clients')
        .select(
          `
          client_id,
          profiles!trainer_clients_client_id_fkey (
            id,
            email,
            created_at
          )
        `,
        )
        .eq('trainer_id', user.id);

      if (trainerClientsError) {
        throw trainerClientsError;
      }

      // Transform the data to match our Client interface
      const clientList: Client[] =
        trainerClients
          ?.map((tc: TrainerClientRow) => ({
            id: tc.profiles?.id || '',
            email: tc.profiles?.email || '',
            created_at: tc.profiles?.created_at || '',
          }))
          .filter((client: Client) => client.id) || [];

      setClients(clientList);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError(err instanceof Error ? err.message : 'クライアント情報の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const selectClient = (client: Client) => {
    // Navigate to client session with selected client info
    navigation.navigate('ClientSession', {
      clientId: client.id,
      clientName: client.email,
    });
  };

  const handleSignOut = async () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      {text: 'キャンセル', style: 'cancel'},
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const renderClient = ({item}: {item: Client}) => (
    <TouchableOpacity style={styles.clientItem} onPress={() => selectClient(item)}>
      <View style={styles.clientInfo}>
        <Text style={styles.clientEmail}>{item.email}</Text>
        <Text style={styles.clientDate}>
          登録日: {new Date(item.created_at).toLocaleDateString('ja-JP')}
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>クライアント情報を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>クライアント選択</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadClients} style={styles.retryButton}>
            <Text style={styles.retryText}>再試行</Text>
          </TouchableOpacity>
        </View>
      )}

      {clients.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📋</Text>
          <Text style={styles.emptyTitle}>クライアントが見つかりません</Text>
          <Text style={styles.emptySubtitle}>
            まだクライアントが登録されていません。{'\n'}
            管理者にお問い合わせください。
          </Text>
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={renderClient}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadClients}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  arrow: {
    color: '#bdc3c7',
    fontSize: 20,
    marginLeft: 12,
  },
  clientDate: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  clientEmail: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  clientInfo: {
    flex: 1,
  },
  clientItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  container: {
    backgroundColor: '#f8f9fa',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptySubtitle: {
    color: '#7f8c8d',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#2c3e50',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#fee',
    borderColor: '#fcc',
    borderRadius: 8,
    borderWidth: 1,
    margin: 20,
    padding: 20,
  },
  errorText: {
    color: '#c0392b',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#ecf0f1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#7f8c8d',
    fontSize: 16,
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#3498db',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#2c3e50',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
