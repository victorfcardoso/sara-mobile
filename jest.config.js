module.exports = {
  preset: 'react-native',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '(jest-)?@?react-native|' +
      '@react-native-community|' +
      '@react-navigation|' +
      '@reduxjs|' +
      'immer|' +
      'expo|' +
      'expo-constants|' +
      'expo-modules-core|' +
      '@expo|' +
      'react-native-reanimated' +
    ')/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!**/node_modules/**',
  ],
};
