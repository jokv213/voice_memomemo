import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export interface ChartDataPoint {
  x: number; // Index for v41 API
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

  return (
    <View style={[styles.container, {height: height + 60}]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <View style={styles.simpleChart}>
          <Text style={styles.chartNote}>データ視覚化: Victory Native v41 との統合を修正中</Text>
          <View style={styles.dataPoints}>
            {data.map((point, index) => (
              <View key={index} style={styles.dataPoint}>
                <Text style={styles.dataValue}>
                  {point.y}
                  {yAxisLabel}
                </Text>
                <Text style={styles.dataIndex}>{index + 1}</Text>
              </View>
            ))}
          </View>
        </View>
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
  simpleChart: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minHeight: 120,
  },
  chartNote: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  dataPoints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dataPoint: {
    alignItems: 'center',
    margin: 4,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    minWidth: 50,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  dataIndex: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
  },
});
