/**
 * Jest Configuration
 *
 * Supports both backend (Node) and frontend (React Native) tests
 */

module.exports = {
  projects: [
    // Backend tests (Node environment)
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/backend'],
      testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            diagnostics: {
              ignoreCodes: [2571, 2339, 18046, 2345],
            },
          },
        ],
      },
      transformIgnorePatterns: [
        'node_modules/(?!(superjson|copy-anything|is-what)/)',
      ],
    },
    // Frontend/Component tests (React Native environment)
    {
      displayName: 'components',
      preset: 'jest-expo',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/components', '<rootDir>/lib', '<rootDir>/app'],
      testMatch: ['**/__tests__/**/*.(spec|test).(ts|tsx)', '**/?(*.)+(spec|test).(ts|tsx)'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-reanimated|react-native-gesture-handler|@shopify/react-native-skia|lucide-react-native)',
      ],
    },
  ],
  // Coverage configuration
  collectCoverageFrom: [
    'backend/**/*.ts',
    'components/**/*.tsx',
    'lib/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
