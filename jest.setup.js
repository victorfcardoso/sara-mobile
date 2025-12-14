/**
 * Jest setup file
 * Mocks for native modules and expo packages
 */

// Mock expo-constants
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        defaultInstallationUrl: 'https://app.chatwoot.com',
        saraApiBaseUrl: 'https://api-dev.sara-ai.com.br',
      },
    },
  },
}));

// Mock expo-modules-core
jest.mock('expo-modules-core', () => ({
  CodedError: class CodedError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  },
  requireOptionalNativeModule: jest.fn(() => null),
}));

// Mock react-native-snackbar
jest.mock('react-native-snackbar', () => ({
  show: jest.fn(),
  dismiss: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock i18n
jest.mock('@/i18n', () => ({
  __esModule: true,
  default: {
    t: (key) => key,
    locale: 'en',
  },
}));

// Silence console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated') || args[0].includes('useNativeDriver'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};
