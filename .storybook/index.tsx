/**
 * Storybook Entry Point
 *
 * This file bootstraps Storybook for React Native
 */

import { getStorybookUI } from '@storybook/react-native';
import './storybook.requires';

const StorybookUIRoot = getStorybookUI({
  // Options
  enableWebsockets: true,
  onDeviceUI: true,
  shouldDisableKeyboardAvoidingView: false,
  keyboardAvoidingViewVerticalOffset: 0,
});

export default StorybookUIRoot;
