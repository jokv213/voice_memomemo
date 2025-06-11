import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
// Victory Native v41 imports simplified for compatibility
// import {VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryTheme} from 'victory-native';

export interface ChartDataPoint {
  x: string; // Date
  y: number; // Value (weight, reps, etc.)
  label?: string;
}

interface ExerciseChartProps {
  data: ChartDataPoint[];
  title: string;
  yAxisLabel: string;
  color?: string;
  type?: 'line' | 'area';
  height?: number;
}

export default function ExerciseChart({data, title, yAxisLabel, height = 200}: ExerciseChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, {height}]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>データがありません</Text>
        </View>
      </View>
    );
  }

  // Simplified chart display for Victory Native v41 compatibility
  const maxValue = Math.max(...data.map(d => d.y));
  const minValue = Math.min(...data.map(d => d.y));
  const avgValue = data.reduce((sum, d) => sum + d.y, 0) / data.length;

  return (
    <View style={[styles.container, {height: height + 60}]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>最大</Text>
            <Text style={styles.statValue}>
              {maxValue}
              {yAxisLabel}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>平均</Text>
            <Text style={styles.statValue}>
              {avgValue.toFixed(1)}
              {yAxisLabel}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>最小</Text>
            <Text style={styles.statValue}>
              {minValue}
              {yAxisLabel}
            </Text>
          </View>
        </View>
        <Text style={styles.chartNote}>データ視覚化: Victory Native v41 との統合を修正中</Text>
      </View>

      {/* Date labels */}
      <View style={styles.dateLabels}>
        {data.slice(-3).map((point, index) => (
          <Text key={index} style={styles.dateLabel}>
            {point.x}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  chartNote: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  dateLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  dateLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});
