import AsyncStorage from '@react-native-async-storage/async-storage';

type StorageValue = string | null;

type StorageDriver = {
  getItem: (key: string) => Promise<StorageValue>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const fallBackErrorSignature = 'NSCocoaErrorDomain Code=4';

const createMemoryStorage = (): StorageDriver => {
  const store = new Map<string, string>();

  return {
    async getItem(key) {
      return store.get(key) ?? null;
    },
    async setItem(key, value) {
      store.set(key, value);
    },
    async removeItem(key) {
      store.delete(key);
    },
  };
};

const memoryStorage = createMemoryStorage();

let usingMemoryStorage = false;

const switchToMemoryStorage = () => {
  usingMemoryStorage = true;
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn('[persistStorage] Falling back to in-memory storage for this session.');
  }
  return memoryStorage;
};

const shouldFallbackToMemoryStorage = (error: unknown): boolean => {
  if (typeof error === 'string') {
    return error.includes(fallBackErrorSignature);
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: unknown }).message ?? '');
    return message.includes(fallBackErrorSignature);
  }

  return false;
};

const withFallback: StorageDriver = {
  async getItem(key: string) {
    if (usingMemoryStorage) {
      return memoryStorage.getItem(key);
    }

    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      if (shouldFallbackToMemoryStorage(error)) {
        return switchToMemoryStorage().getItem(key);
      }
      throw error;
    }
  },
  async setItem(key: string, value: string) {
    if (usingMemoryStorage) {
      await memoryStorage.setItem(key, value);
      return;
    }

    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      if (shouldFallbackToMemoryStorage(error)) {
        await switchToMemoryStorage().setItem(key, value);
        return;
      }
      throw error;
    }
  },
  async removeItem(key: string) {
    if (usingMemoryStorage) {
      await memoryStorage.removeItem(key);
      return;
    }

    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      if (shouldFallbackToMemoryStorage(error)) {
        await switchToMemoryStorage().removeItem(key);
        return;
      }
      throw error;
    }
  },
};

export default withFallback;
