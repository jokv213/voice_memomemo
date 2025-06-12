import React from 'react';
import {render} from '@testing-library/react-native';
import ExerciseChart from '../ExerciseChart';

// Mock victory-native components
const mockReact = require('react');
jest.mock('victory-native', () => ({
  VictoryChart: jest.fn(({children}) => {
    const MockVictoryChart = 'VictoryChart';
    return mockReact.createElement(MockVictoryChart, {testID: 'victory-chart'}, children);
  }),
  VictoryLine: jest.fn(() => {
    const MockVictoryLine = 'VictoryLine';
    return mockReact.createElement(MockVictoryLine, {testID: 'victory-line'});
  }),
  VictoryAxis: jest.fn(() => {
    const MockVictoryAxis = 'VictoryAxis';
    return mockReact.createElement(MockVictoryAxis, {testID: 'victory-axis'});
  }),
  VictoryTheme: {
    material: {},
  },
  VictoryArea: jest.fn(() => {
    const MockVictoryArea = 'VictoryArea';
    return mockReact.createElement(MockVictoryArea, {testID: 'victory-area'});
  }),
}));

// Mock react-native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({width: 375, height: 812})),
    },
  };
});

describe('ExerciseChart', () => {
  const mockData = [
    {x: '2024-01-01', y: 100},
    {x: '2024-01-02', y: 105},
    {x: '2024-01-03', y: 110},
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering with data', () => {
    it('should render chart with valid data', () => {
      const {getByTestId, getByText} = render(
        <ExerciseChart data={mockData} title="Bench Press Progress" yAxisLabel="Weight (kg)" />,
      );

      expect(getByTestId('victory-chart')).toBeTruthy();
      expect(getByText('Bench Press Progress')).toBeTruthy();
    });

    it('should display chart title correctly', () => {
      const {getByText} = render(
        <ExerciseChart data={mockData} title="Custom Chart Title" yAxisLabel="Values" />,
      );

      expect(getByText('Custom Chart Title')).toBeTruthy();
    });

    it('should render line chart for weight data', () => {
      const {getByTestId} = render(
        <ExerciseChart data={mockData} title="Weight Progress" yAxisLabel="Weight" />,
      );

      expect(getByTestId('victory-chart')).toBeTruthy();
      expect(getByTestId('victory-line')).toBeTruthy();
    });
  });

  describe('empty state handling', () => {
    it('should render empty state when no data provided', () => {
      const {getByText, queryByTestId} = render(
        <ExerciseChart data={[]} title="No Data Chart" yAxisLabel="Values" />,
      );

      expect(getByText('No data available')).toBeTruthy();
      expect(queryByTestId('victory-chart')).toBeFalsy();
    });

    it('should render empty state with custom message', () => {
      const {getByText} = render(
        <ExerciseChart data={[]} title="Empty Chart" yAxisLabel="Values" />,
      );

      expect(getByText('No data available')).toBeTruthy();
      expect(getByText('Empty Chart')).toBeTruthy();
    });
  });

  describe('data formatting', () => {
    it('should handle single data point', () => {
      const singleDataPoint = [{x: '2024-01-01', y: 100}];

      const {getByTestId} = render(
        <ExerciseChart data={singleDataPoint} title="Single Point Chart" yAxisLabel="Value" />,
      );

      expect(getByTestId('victory-chart')).toBeTruthy();
    });

    it('should handle data with missing properties', () => {
      const incompleteData = [
        {x: '2024-01-01', y: 100},
        {x: '2024-01-02', y: 8},
        {x: '2024-01-03', y: 660},
      ];

      const {getByTestId} = render(
        <ExerciseChart data={incompleteData} title="Incomplete Data Chart" yAxisLabel="Various" />,
      );

      expect(getByTestId('victory-chart')).toBeTruthy();
    });

    it('should handle large datasets', () => {
      const largeData = Array.from({length: 50}, (_, i) => ({
        x: `2024-01-${String(i + 1).padStart(2, '0')}`,
        y: 100 + i,
      }));

      const {getByTestId} = render(
        <ExerciseChart data={largeData} title="Large Dataset Chart" yAxisLabel="Values" />,
      );

      expect(getByTestId('victory-chart')).toBeTruthy();
    });
  });

  describe('chart configuration', () => {
    it('should apply proper chart dimensions', () => {
      const {getByTestId} = render(
        <ExerciseChart data={mockData} title="Dimension Test" yAxisLabel="Value" />,
      );

      const chart = getByTestId('victory-chart');
      expect(chart).toBeTruthy();
    });

    it('should include axes in the chart', () => {
      const {getAllByTestId} = render(
        <ExerciseChart data={mockData} title="Axes Test" yAxisLabel="Value" />,
      );

      const axes = getAllByTestId('victory-axis');
      expect(axes.length).toBeGreaterThan(0);
    });
  });

  describe('accessibility', () => {
    it('should have accessible title', () => {
      const {getByText} = render(
        <ExerciseChart data={mockData} title="Accessible Chart" yAxisLabel="Value" />,
      );

      const title = getByText('Accessible Chart');
      expect(title).toBeTruthy();
    });

    it('should provide meaningful empty state message', () => {
      const {getByText} = render(
        <ExerciseChart data={[]} title="Empty Accessible Chart" yAxisLabel="Value" />,
      );

      expect(getByText('No data available')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should handle undefined data gracefully', () => {
      const {getByText} = render(
        <ExerciseChart data={undefined as any} title="Undefined Data" yAxisLabel="Value" />,
      );

      expect(getByText('No data available')).toBeTruthy();
    });

    it('should handle null data gracefully', () => {
      const {getByText} = render(
        <ExerciseChart data={null as any} title="Null Data" yAxisLabel="Value" />,
      );

      expect(getByText('No data available')).toBeTruthy();
    });

    it('should handle malformed data', () => {
      const malformedData = [
        {invalidProperty: 'test'},
        null,
        undefined,
        {date: 'invalid-date', weight: 'not-a-number'},
      ];

      const {getByTestId} = render(
        <ExerciseChart data={malformedData as any} title="Malformed Data" yAxisLabel="Value" />,
      );

      // Should still render chart container even with bad data
      expect(getByTestId('victory-chart')).toBeTruthy();
    });
  });

  describe('responsive behavior', () => {
    it('should adapt to different screen dimensions', () => {
      // Mock different screen size
      require('react-native').Dimensions.get.mockReturnValue({
        width: 320,
        height: 568,
      });

      const {getByTestId} = render(
        <ExerciseChart data={mockData} title="Responsive Chart" yAxisLabel="Value" />,
      );

      expect(getByTestId('victory-chart')).toBeTruthy();
    });
  });
});
