/**
 * Storybook Preview Configuration
 *
 * Global decorators and parameters for all stories
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { Preview } from '@storybook/react';
import { Colors } from '../constants/colors';

/**
 * Decorator to wrap all stories with consistent styling
 */
const withThemeProvider = (Story: React.ComponentType) => (
  <View style={styles.container}>
    <Story />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background.primary,
  },
});

const preview: Preview = {
  decorators: [withThemeProvider],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: Colors.background.primary },
        { name: 'dark', value: '#1a1a2e' },
        { name: 'brand', value: Colors.primary.sunset },
      ],
    },
  },
};

export default preview;
