import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {sessionService, Session, ExerciseLog} from '../services/sessionService';
import ExerciseChart, {ChartDataPoint} from '../components/ExerciseChart';

type ViewMode = 'sessions' | 'exercises' | 'memos';

interface SessionWithLogs extends Session {
  exerciseLogs: ExerciseLog[];
}

interface ExerciseProgress {
  exercise: string;
  maxWeight: number;
  totalReps: number;
  lastPerformed: string;
  progressData: ChartDataPoint[];
}

export default function DataScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('sessions');
  const [sessions, setSessions] = useState<SessionWithLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const sessionsResult = await sessionService.getUserSessions(50);

      if (sessionsResult.error) {
        Alert.alert('エラー', 'データの読み込みに失敗しました');
        return;
      }

      // Load exercise logs for each session
      const sessionsWithLogs: SessionWithLogs[] = [];
      for (const session of sessionsResult.data) {
        const logsResult = await sessionService.getSessionLogs(session.id);
        sessionsWithLogs.push({
          ...session,
          exerciseLogs: logsResult.data || [],
        });
      }

      setSessions(sessionsWithLogs);
    } catch {
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const exerciseProgress = useMemo((): ExerciseProgress[] => {
    const exerciseMap = new Map<
      string,
      {
        weights: Array<{date: string; weight: number}>;
        totalReps: number;
        lastDate: string;
      }
    >();

    sessions.forEach(session => {
      const sessionDate = new Date(session.date).toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
      });

      session.exerciseLogs.forEach(log => {
        if (!exerciseMap.has(log.exercise)) {
          exerciseMap.set(log.exercise, {
            weights: [],
            totalReps: 0,
            lastDate: sessionDate,
          });
        }

        const exerciseData = exerciseMap.get(log.exercise)!;

        if (log.weight) {
          exerciseData.weights.push({
            date: sessionDate,
            weight: log.weight,
          });
        }

        exerciseData.totalReps += (log.reps || 0) * (log.sets || 1);
        exerciseData.lastDate = sessionDate;
      });
    });

    return Array.from(exerciseMap.entries())
      .map(([exercise, data]) => {
        const maxWeight = Math.max(...(data.weights.map(w => w.weight) || [0]));

        // Create progress data (last 10 workouts)
        const progressData: ChartDataPoint[] = data.weights.slice(-10).map(w => ({
          x: w.date,
          y: w.weight,
        }));

        return {
          exercise,
          maxWeight,
          totalReps: data.totalReps,
          lastPerformed: data.lastDate,
          progressData,
        };
      })
      .sort((a, b) => b.maxWeight - a.maxWeight);
  }, [sessions]);

  const memoLogs = useMemo(() => {
    return sessions
      .flatMap(session =>
        session.exerciseLogs
          .filter(log => log.memo)
          .map(log => ({
            ...log,
            sessionTitle: session.title,
            date: new Date(session.date).toLocaleDateString('ja-JP'),
          })),
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [sessions]);

  const renderSessionItem = ({item}: {item: SessionWithLogs}) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionTitle}>{item.title}</Text>
        <Text style={styles.sessionDate}>{new Date(item.date).toLocaleDateString('ja-JP')}</Text>
      </View>

      <View style={styles.exerciseList}>
        {item.exerciseLogs.length === 0 ? (
          <Text style={styles.noExercises}>記録なし</Text>
        ) : (
          item.exerciseLogs.map((log, index) => (
            <View key={index} style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{log.exercise}</Text>
              <View style={styles.exerciseDetails}>
                {log.weight && <Text style={styles.exerciseDetail}>{log.weight}kg</Text>}
                {log.reps && <Text style={styles.exerciseDetail}>{log.reps}回</Text>}
                {log.sets && <Text style={styles.exerciseDetail}>{log.sets}セット</Text>}
                {log.side && <Text style={styles.exerciseDetail}>{log.side}</Text>}
              </View>
              {log.memo && <Text style={styles.exerciseMemo}>{log.memo}</Text>}
            </View>
          ))
        )}
      </View>
    </View>
  );

  const renderExerciseProgress = ({item}: {item: ExerciseProgress}) => (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseCardTitle}>{item.exercise}</Text>
        <Text style={styles.lastPerformed}>最終: {item.lastPerformed}</Text>
      </View>

      <View style={styles.exerciseStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.maxWeight}kg</Text>
          <Text style={styles.statLabel}>最大重量</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.totalReps}</Text>
          <Text style={styles.statLabel}>総回数</Text>
        </View>
      </View>

      {item.progressData.length > 1 && (
        <ExerciseChart
          data={item.progressData}
          title="重量の推移"
          yAxisLabel="kg"
          color="#27ae60"
          type="line"
          height={150}
        />
      )}
    </View>
  );

  const renderMemoItem = ({item}: {item: any}) => (
    <View style={styles.memoCard}>
      <View style={styles.memoHeader}>
        <Text style={styles.memoExercise}>{item.exercise}</Text>
        <Text style={styles.memoDate}>{item.date}</Text>
      </View>
      <Text style={styles.memoText}>{item.memo}</Text>
      <Text style={styles.memoSession}>{item.sessionTitle}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>データを読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>保存データ</Text>

        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segment, viewMode === 'sessions' && styles.activeSegment]}
            onPress={() => setViewMode('sessions')}>
            <Text style={[styles.segmentText, viewMode === 'sessions' && styles.activeSegmentText]}>
              セッション別
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, viewMode === 'exercises' && styles.activeSegment]}
            onPress={() => setViewMode('exercises')}>
            <Text
              style={[styles.segmentText, viewMode === 'exercises' && styles.activeSegmentText]}>
              種目別
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, viewMode === 'memos' && styles.activeSegment]}
            onPress={() => setViewMode('memos')}>
            <Text style={[styles.segmentText, viewMode === 'memos' && styles.activeSegmentText]}>
              メモ
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'sessions' && (
        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>セッションデータがありません</Text>
            </View>
          }
        />
      )}
      {viewMode === 'exercises' && (
        <FlatList
          data={exerciseProgress}
          renderItem={renderExerciseProgress}
          keyExtractor={item => item.exercise}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>種目データがありません</Text>
            </View>
          }
        />
      )}
      {viewMode === 'memos' && (
        <FlatList
          data={memoLogs}
          renderItem={renderMemoItem}
          keyExtractor={(item, index) => `memo-${index}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>メモがありません</Text>
            </View>
          }
        />
      )}
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeSegment: {
    backgroundColor: '#3498db',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  activeSegmentText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  exerciseList: {
    gap: 8,
  },
  noExercises: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  exerciseItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  exerciseDetail: {
    fontSize: 12,
    color: '#7f8c8d',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  exerciseMemo: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
    marginTop: 4,
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  lastPerformed: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  memoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memoExercise: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  memoDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  memoText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 8,
  },
  memoSession: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});
