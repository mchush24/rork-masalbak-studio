/**
 * Input Component Tests
 *
 * Tests for the reusable Input component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

// Mock useHaptic hook
jest.mock('@/lib/haptics', () => ({
  useHaptic: () => ({
    error: jest.fn(),
    success: jest.fn(),
    tap: jest.fn(),
  }),
}));

describe('Input', () => {
  describe('rendering', () => {
    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" testID="input" />);

      const input = screen.getByTestId('input');
      expect(input).toBeTruthy();
      expect(input.props.placeholder).toBe('Enter text');
    });

    it('renders with label', () => {
      render(<Input label="Email" testID="input" />);

      expect(screen.getByText('Email')).toBeTruthy();
    });

    it('renders with required indicator', () => {
      render(<Input label="Email" required testID="input" />);

      expect(screen.getByText('*')).toBeTruthy();
    });

    it('renders with left icon', () => {
      const MockIcon = () => <></>;
      render(<Input leftIcon={<MockIcon />} testID="input" />);

      const input = screen.getByTestId('input');
      expect(input).toBeTruthy();
    });

    it('renders with right icon', () => {
      const MockIcon = () => <></>;
      render(<Input rightIcon={<MockIcon />} testID="input" />);

      const input = screen.getByTestId('input');
      expect(input).toBeTruthy();
    });

    it('renders in small size', () => {
      render(<Input size="sm" testID="input" />);

      const input = screen.getByTestId('input');
      expect(input).toBeTruthy();
    });

    it('renders in medium size (default)', () => {
      render(<Input size="md" testID="input" />);

      const input = screen.getByTestId('input');
      expect(input).toBeTruthy();
    });

    it('renders in large size', () => {
      render(<Input size="lg" testID="input" />);

      const input = screen.getByTestId('input');
      expect(input).toBeTruthy();
    });
  });

  describe('states', () => {
    it('shows error state with error message', () => {
      render(<Input error="Invalid email" testID="input" />);

      expect(screen.getByText('Invalid email')).toBeTruthy();
    });

    it('shows success state with success message', () => {
      render(<Input success="Looks good!" testID="input" />);

      expect(screen.getByText('Looks good!')).toBeTruthy();
    });

    it('shows helper text', () => {
      render(<Input helperText="Enter a valid email address" testID="input" />);

      expect(screen.getByText('Enter a valid email address')).toBeTruthy();
    });

    it('renders disabled state', () => {
      render(<Input editable={false} testID="input" />);

      const input = screen.getByTestId('input');
      expect(input.props.editable).toBe(false);
    });

    it('prioritizes error over helper text', () => {
      render(<Input error="Invalid input" helperText="This should not show" testID="input" />);

      expect(screen.getByText('Invalid input')).toBeTruthy();
      expect(screen.queryByText('This should not show')).toBeNull();
    });
  });

  describe('interactions', () => {
    it('calls onChangeText when typing', () => {
      const onChangeText = jest.fn();
      render(<Input onChangeText={onChangeText} testID="input" />);

      const input = screen.getByTestId('input');
      fireEvent.changeText(input, 'Hello World');

      expect(onChangeText).toHaveBeenCalledWith('Hello World');
    });

    it('calls onFocus when focused', () => {
      const onFocus = jest.fn();
      render(<Input onFocus={onFocus} testID="input" />);

      const input = screen.getByTestId('input');
      fireEvent(input, 'focus');

      expect(onFocus).toHaveBeenCalled();
    });

    it('calls onBlur when blurred', () => {
      const onBlur = jest.fn();
      render(<Input onBlur={onBlur} testID="input" />);

      const input = screen.getByTestId('input');
      fireEvent(input, 'blur');

      expect(onBlur).toHaveBeenCalled();
    });

    it('handles secure text entry for password', () => {
      render(<Input secureTextEntry testID="input" />);

      const input = screen.getByTestId('input');
      expect(input.props.secureTextEntry).toBe(true);
    });
  });

  describe('validation display', () => {
    it('displays error message below input', () => {
      render(<Input error="Email is required" testID="input" />);

      const errorText = screen.getByText('Email is required');
      expect(errorText).toBeTruthy();
    });

    it('updates error message when prop changes', () => {
      const { rerender } = render(<Input error="Error 1" testID="input" />);

      expect(screen.getByText('Error 1')).toBeTruthy();

      rerender(<Input error="Error 2" testID="input" />);

      expect(screen.getByText('Error 2')).toBeTruthy();
      expect(screen.queryByText('Error 1')).toBeNull();
    });

    it('clears error when error prop is removed', () => {
      const { rerender } = render(<Input error="Some error" testID="input" />);

      expect(screen.getByText('Some error')).toBeTruthy();

      rerender(<Input testID="input" />);

      expect(screen.queryByText('Some error')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('has accessibility label when provided', () => {
      render(<Input accessibilityLabel="Email input field" testID="input" />);

      const input = screen.getByTestId('input');
      expect(input.props.accessibilityLabel).toBe('Email input field');
    });

    it('has accessibility hint when provided', () => {
      render(<Input accessibilityHint="Enter your email address" testID="input" />);

      const input = screen.getByTestId('input');
      expect(input.props.accessibilityHint).toBe('Enter your email address');
    });
  });

  describe('controlled input', () => {
    it('displays controlled value', () => {
      render(<Input value="test@email.com" testID="input" />);

      const input = screen.getByTestId('input');
      expect(input.props.value).toBe('test@email.com');
    });

    it('updates when value prop changes', () => {
      const { rerender } = render(<Input value="initial" testID="input" />);

      let input = screen.getByTestId('input');
      expect(input.props.value).toBe('initial');

      rerender(<Input value="updated" testID="input" />);

      input = screen.getByTestId('input');
      expect(input.props.value).toBe('updated');
    });
  });
});
