/**
 * FeatureCard Component Tests
 *
 * Tests for the FeatureCard component used across the app
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FeatureCard } from '../FeatureCard';

// Mock hooks
jest.mock('@/hooks/useFeedback', () => ({
  useFeedback: () => ({
    feedback: jest.fn(),
  }),
}));

// Mock expo-blur
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// Create a mock icon component
const MockIcon = () => <Text testID="mock-icon">Icon</Text>;

describe('FeatureCard', () => {
  describe('rendering', () => {
    it('renders with title', () => {
      render(<FeatureCard title="Analysis" icon={<MockIcon />} />);

      expect(screen.getByText('Analysis')).toBeTruthy();
    });

    it('renders with title and subtitle', () => {
      render(
        <FeatureCard
          title="Drawing Analysis"
          subtitle="Analyze your drawings"
          icon={<MockIcon />}
        />
      );

      expect(screen.getByText('Drawing Analysis')).toBeTruthy();
      expect(screen.getByText('Analyze your drawings')).toBeTruthy();
    });

    it('renders icon', () => {
      render(<FeatureCard title="Test" icon={<MockIcon />} />);

      expect(screen.getByTestId('mock-icon')).toBeTruthy();
    });

    it('renders with arrow by default', () => {
      render(<FeatureCard title="Test" icon={<MockIcon />} showArrow />);

      // Arrow should be present (ChevronRight icon)
      expect(screen.getByText('Test')).toBeTruthy();
    });

    it('renders without arrow when showArrow is false', () => {
      render(<FeatureCard title="Test" icon={<MockIcon />} showArrow={false} />);

      expect(screen.getByText('Test')).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('renders in small size', () => {
      render(<FeatureCard title="Small Card" icon={<MockIcon />} size="small" />);

      expect(screen.getByText('Small Card')).toBeTruthy();
    });

    it('renders in medium size (default)', () => {
      render(<FeatureCard title="Medium Card" icon={<MockIcon />} size="medium" />);

      expect(screen.getByText('Medium Card')).toBeTruthy();
    });

    it('renders in large size', () => {
      render(<FeatureCard title="Large Card" icon={<MockIcon />} size="large" />);

      expect(screen.getByText('Large Card')).toBeTruthy();
    });
  });

  describe('feature types', () => {
    const featureTypes = ['analysis', 'chat', 'story', 'emotion', 'reward', 'coloring'] as const;

    featureTypes.forEach(type => {
      it(`renders ${type} type correctly`, () => {
        render(
          <FeatureCard
            title={`${type} Feature`}
            icon={<MockIcon />}
            type={type}
          />
        );

        expect(screen.getByText(`${type} Feature`)).toBeTruthy();
      });
    });
  });

  describe('interactions', () => {
    it('calls onPress when tapped', () => {
      const onPress = jest.fn();
      render(
        <FeatureCard
          title="Pressable Card"
          icon={<MockIcon />}
          onPress={onPress}
        />
      );

      const card = screen.getByText('Pressable Card');
      fireEvent.press(card);

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPress = jest.fn();
      render(
        <FeatureCard
          title="Disabled Card"
          icon={<MockIcon />}
          onPress={onPress}
          disabled
        />
      );

      const card = screen.getByText('Disabled Card');
      fireEvent.press(card);

      expect(onPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when comingSoon', () => {
      const onPress = jest.fn();
      render(
        <FeatureCard
          title="Coming Soon Card"
          icon={<MockIcon />}
          onPress={onPress}
          comingSoon
        />
      );

      const card = screen.getByText('Coming Soon Card');
      fireEvent.press(card);

      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('states', () => {
    it('renders disabled state', () => {
      render(
        <FeatureCard
          title="Disabled"
          icon={<MockIcon />}
          disabled
        />
      );

      expect(screen.getByText('Disabled')).toBeTruthy();
    });

    it('renders coming soon state', () => {
      render(
        <FeatureCard
          title="Coming Soon"
          icon={<MockIcon />}
          comingSoon
        />
      );

      expect(screen.getByText('Coming Soon')).toBeTruthy();
      expect(screen.getByText('Yakında')).toBeTruthy();
    });

    it('renders new badge when isNew is true', () => {
      render(
        <FeatureCard
          title="New Feature"
          icon={<MockIcon />}
          isNew
        />
      );

      expect(screen.getByText('New Feature')).toBeTruthy();
      expect(screen.getByText('YENİ')).toBeTruthy();
    });
  });

  describe('entrance animations', () => {
    it('accepts entranceIndex prop', () => {
      render(
        <FeatureCard
          title="Animated Card"
          icon={<MockIcon />}
          entranceIndex={2}
        />
      );

      expect(screen.getByText('Animated Card')).toBeTruthy();
    });

    it('accepts entranceDelay prop', () => {
      render(
        <FeatureCard
          title="Delayed Card"
          icon={<MockIcon />}
          entranceDelay={200}
        />
      );

      expect(screen.getByText('Delayed Card')).toBeTruthy();
    });
  });

  describe('custom styling', () => {
    it('accepts custom style prop', () => {
      render(
        <FeatureCard
          title="Styled Card"
          icon={<MockIcon />}
          style={{ marginTop: 20 }}
        />
      );

      expect(screen.getByText('Styled Card')).toBeTruthy();
    });
  });
});
