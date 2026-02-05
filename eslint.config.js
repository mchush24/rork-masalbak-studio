const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      'ios/*',
      'android/*',
      'coverage/*',
      '*.config.js',
      'babel.config.js',
      'metro.config.js',
      '.storybook/*',
      'scripts/*',
    ],
  },
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // General code quality
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'group', 'groupEnd', 'log'],
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]);
