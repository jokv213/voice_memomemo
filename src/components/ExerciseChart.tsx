import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryTheme} from 'victory-native';

const screenWidth = Dimensions.get('window').width;

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

export default function ExerciseChart({
  data,
  title,
  yAxisLabel,
  color = '#3498db',
  type = 'line',
  height = 200,
}: ExerciseChartProps) {
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

  // Transform data for Victory
  const chartData = data.map((point, index) => ({
    x: index + 1, // Use index for x-axis
    y: point.y,
    label: point.label || point.x,
  }));

  const maxValue = Math.max(...chartData.map(d => d.y));
  const minValue = Math.min(...chartData.map(d => d.y));
  const padding = (maxValue - minValue) * 0.1;

  return (
    <View style={[styles.container, {height: height + 60}]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <VictoryChart
          theme={VictoryTheme.material}
          width={screenWidth - 48}
          height={height}
          padding={{left: 60, top: 20, right: 40, bottom: 40}}
          domain={{
            y: [Math.max(0, minValue - padding), maxValue + padding],
          }}>
          <VictoryAxis
            dependentAxis
            tickFormat={t => `${t}${yAxisLabel}`}
            style={{
              tickLabels: {fontSize: 12, fill: '#7f8c8d'},
              grid: {stroke: '#ecf0f1', strokeWidth: 1},
            }}
          />
          <VictoryAxis
            tickFormat={() => ''}
            style={{
              tickLabels: {fontSize: 12, fill: '#7f8c8d'},
              axis: {stroke: '#bdc3c7', strokeWidth: 1},
            }}
          />

          {type === 'area' ? (
            <VictoryArea
              data={chartData}
              style={{
                data: {fill: color, fillOpacity: 0.3, stroke: color, strokeWidth: 2},
              }}
              animate={{
                duration: 1000,
                onLoad: {duration: 500},
              }}
            />
          ) : (
            <VictoryLine
              data={chartData}
              style={{
                data: {stroke: color, strokeWidth: 3},
                parent: {border: '1px solid #ccc'},
              }}
              animate={{
                duration: 1000,
                onLoad: {duration: 500},
              }}
            />
          )}
        </VictoryChart>
      </View>

      {/* Date labels */}
      <View style={styles.dateLabels}>
        {data.map((point, index) => {
          // Show every nth label to avoid overcrowding
          const showLabel = data.length <= 5 || index % Math.ceil(data.length / 5) === 0;
          return showLabel ? (
            <Text key={index} style={styles.dateLabel}>
              {point.x}
            </Text>
          ) : null;
        })}
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
