/**
 * JellyButton Stories
 *
 * Interactive documentation for the JellyButton component
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet, Alert } from 'react-native';
import { JellyButton } from '../JellyButton';

const meta: Meta<typeof JellyButton> = {
  title: 'Components/JellyButton',
  component: JellyButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      description: 'Button style variant',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
  },
  parameters: {
    notes: `
# JellyButton

A playful, animated button component with jelly-like press animation.

## Usage

\`\`\`tsx
import { JellyButton } from '@/components/JellyButton';

<JellyButton
  title="Devam Et"
  onPress={() => console.log('Pressed!')}
  variant="primary"
/>
\`\`\`

## Variants

- **primary**: Main action button with gradient background
- **secondary**: Secondary action with solid color
- **outline**: Bordered button with transparent background
- **ghost**: Text-only button for tertiary actions

## Accessibility

The button supports:
- accessibilityLabel for screen readers
- accessibilityHint for additional context
- Disabled state announcement
    `,
  },
};

export default meta;
type Story = StoryObj<typeof JellyButton>;

// Default story
export const Default: Story = {
  args: {
    title: 'Devam Et',
    onPress: () => Alert.alert('Button Pressed!'),
  },
};

// Primary variant
export const Primary: Story = {
  args: {
    title: 'Primary Button',
    variant: 'primary',
    onPress: () => Alert.alert('Primary Pressed!'),
  },
};

// Secondary variant
export const Secondary: Story = {
  args: {
    title: 'Secondary Button',
    variant: 'secondary',
    onPress: () => Alert.alert('Secondary Pressed!'),
  },
};

// Outline variant
export const Outline: Story = {
  args: {
    title: 'Outline Button',
    variant: 'outline',
    onPress: () => Alert.alert('Outline Pressed!'),
  },
};

// Loading state
export const Loading: Story = {
  args: {
    title: 'Loading...',
    loading: true,
    onPress: () => {},
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    title: 'Disabled Button',
    disabled: true,
    onPress: () => {},
  },
};

// All sizes
export const Sizes: Story = {
  render: () => (
    <View style={styles.column}>
      <JellyButton title="Small" size="small" onPress={() => {}} />
      <JellyButton title="Medium" size="medium" onPress={() => {}} />
      <JellyButton title="Large" size="large" onPress={() => {}} />
    </View>
  ),
};

// All variants
export const AllVariants: Story = {
  render: () => (
    <View style={styles.column}>
      <JellyButton title="Primary" variant="primary" onPress={() => {}} />
      <JellyButton title="Secondary" variant="secondary" onPress={() => {}} />
      <JellyButton title="Outline" variant="outline" onPress={() => {}} />
      <JellyButton title="Ghost" variant="ghost" onPress={() => {}} />
    </View>
  ),
};

const styles = StyleSheet.create({
  column: {
    gap: 12,
  },
});
