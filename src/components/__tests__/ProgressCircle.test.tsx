import React from 'react';
import {render} from '@testing-library/react-native';
import {ProgressCircle} from '../ProgressCircle';

// Mock react-native-svg
const mockReact = require('react');
jest.mock('react-native-svg', () => ({
  Svg: jest.fn(({children, ...props}) => {
    const MockSvg = 'Svg';
    return mockReact.createElement(MockSvg, {testID: 'svg', ...props}, children);
  }),
  Circle: jest.fn(props => {
    const MockCircle = 'Circle';
    return mockReact.createElement(MockCircle, {testID: 'circle', ...props});
  }),
  Text: jest.fn(({children, ...props}) => {
    const MockText = 'Text';
    return mockReact.createElement(MockText, {testID: 'svg-text', ...props}, children);
  }),
}));

describe('ProgressCircle', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render progress circle with percentage', () => {
      const {getByTestId, getByText} = render(<ProgressCircle progress={75} size={100} />);

      expect(getByTestId('svg')).toBeTruthy();
      expect(getByText('75%')).toBeTruthy();
    });

    it('should render with default size when not specified', () => {
      const {getByTestId} = render(<ProgressCircle progress={25} />);

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('should render with custom color', () => {
      const {getByTestId} = render(<ProgressCircle progress={50} size={100} color="#FF0000" />);

      expect(getByTestId('svg')).toBeTruthy();
    });
  });

  describe('progress values', () => {
    it('should handle zero progress', () => {
      const {getByText} = render(<ProgressCircle progress={0} size={100} />);

      expect(getByText('0%')).toBeTruthy();
    });

    it('should handle 100% progress', () => {
      const {getByText} = render(<ProgressCircle progress={100} size={100} />);

      expect(getByText('100%')).toBeTruthy();
    });

    it('should handle decimal progress values', () => {
      const {getByText} = render(<ProgressCircle progress={33.33} size={100} />);

      expect(getByText('33%')).toBeTruthy();
    });

    it('should handle negative progress values', () => {
      const {getByText} = render(<ProgressCircle progress={-10} size={100} />);

      expect(getByText('0%')).toBeTruthy();
    });

    it('should handle progress values over 100', () => {
      const {getByText} = render(<ProgressCircle progress={150} size={100} />);

      expect(getByText('100%')).toBeTruthy();
    });
  });

  describe('size variations', () => {
    it('should handle small size', () => {
      const {getByTestId} = render(<ProgressCircle progress={50} size={50} />);

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('should handle large size', () => {
      const {getByTestId} = render(<ProgressCircle progress={75} size={200} />);

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('should handle zero size', () => {
      const {getByTestId} = render(<ProgressCircle progress={50} size={0} />);

      expect(getByTestId('svg')).toBeTruthy();
    });
  });

  describe('color customization', () => {
    it('should accept hex color values', () => {
      const {getByTestId} = render(<ProgressCircle progress={60} size={100} color="#00FF00" />);

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('should accept RGB color values', () => {
      const {getByTestId} = render(
        <ProgressCircle progress={40} size={100} color="rgb(255, 0, 0)" />,
      );

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('should accept named color values', () => {
      const {getByTestId} = render(<ProgressCircle progress={80} size={100} color="blue" />);

      expect(getByTestId('svg')).toBeTruthy();
    });
  });

  describe('circle elements', () => {
    it('should render background and progress circles', () => {
      const {getAllByTestId} = render(<ProgressCircle progress={50} size={100} />);

      const circles = getAllByTestId('circle');
      expect(circles.length).toBe(2); // Background + progress circle
    });

    it('should render text element for percentage', () => {
      const {getByTestId} = render(<ProgressCircle progress={50} size={100} />);

      expect(getByTestId('svg-text')).toBeTruthy();
    });
  });

  describe('mathematical calculations', () => {
    it('should handle floating point precision', () => {
      const {getByText} = render(<ProgressCircle progress={33.333333} size={100} />);

      expect(getByText('33%')).toBeTruthy();
    });

    it('should round progress values correctly', () => {
      const {getByText} = render(<ProgressCircle progress={66.7} size={100} />);

      expect(getByText('67%')).toBeTruthy();
    });

    it('should handle very small progress values', () => {
      const {getByText} = render(<ProgressCircle progress={0.1} size={100} />);

      expect(getByText('0%')).toBeTruthy();
    });

    it('should handle very large progress values', () => {
      const {getByText} = render(<ProgressCircle progress={999} size={100} />);

      expect(getByText('100%')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle NaN progress values', () => {
      const {getByText} = render(<ProgressCircle progress={NaN} size={100} />);

      expect(getByText('0%')).toBeTruthy();
    });

    it('should handle Infinity progress values', () => {
      const {getByText} = render(<ProgressCircle progress={Infinity} size={100} />);

      expect(getByText('100%')).toBeTruthy();
    });

    it('should handle undefined progress', () => {
      const {getByText} = render(<ProgressCircle progress={undefined as any} size={100} />);

      expect(getByText('0%')).toBeTruthy();
    });

    it('should handle null progress', () => {
      const {getByText} = render(<ProgressCircle progress={null as any} size={100} />);

      expect(getByText('0%')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should display readable percentage text', () => {
      const {getByText} = render(<ProgressCircle progress={85} size={120} />);

      const percentageText = getByText('85%');
      expect(percentageText).toBeTruthy();
    });

    it('should maintain text visibility across different sizes', () => {
      const {getByText: getText1} = render(<ProgressCircle progress={50} size={50} />);

      const {getByText: getText2} = render(<ProgressCircle progress={50} size={200} />);

      expect(getText1('50%')).toBeTruthy();
      expect(getText2('50%')).toBeTruthy();
    });
  });

  describe('performance', () => {
    it('should handle rapid progress updates', () => {
      const {rerender, getByText} = render(<ProgressCircle progress={0} size={100} />);

      for (let i = 0; i <= 100; i += 10) {
        rerender(<ProgressCircle progress={i} size={100} />);
        expect(getByText(`${i}%`)).toBeTruthy();
      }
    });

    it('should handle multiple instances efficiently', () => {
      const {getAllByTestId} = render(
        <>
          <ProgressCircle progress={25} size={50} />
          <ProgressCircle progress={50} size={75} />
          <ProgressCircle progress={75} size={100} />
        </>,
      );

      const svgs = getAllByTestId('svg');
      expect(svgs.length).toBe(3);
    });
  });
});
