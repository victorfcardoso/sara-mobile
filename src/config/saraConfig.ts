import Constants from 'expo-constants';

const resolveBaseUrl = (): string => {
  const explicit = process.env.EXPO_PUBLIC_SARA_API_BASE_URL;
  const extra = Constants?.expoConfig?.extra?.saraApiBaseUrl as string | undefined;

  const candidate = (explicit ?? extra)?.trim();

  if (!candidate) {
    throw new Error('Sara API base URL is not configured. Set EXPO_PUBLIC_SARA_API_BASE_URL.');
  }

  if (!/^https?:\/\//i.test(candidate)) {
    throw new Error('Sara API base URL must include http(s) protocol.');
  }

  return candidate.replace(/\/+$/, '');
};

export const saraConfig = {
  apiBaseUrl: resolveBaseUrl(),
};

export const buildSaraApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${saraConfig.apiBaseUrl}${normalizedPath}`;
};
