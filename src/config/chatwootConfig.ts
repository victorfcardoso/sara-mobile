import Constants from 'expo-constants';

const DEFAULT_CHATWOOT_BASE_URL =
  (Constants?.expoConfig?.extra?.defaultInstallationUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_CHATWOOT_BASE_URL ??
  'https://app.chatwoot.com';

const ensureProtocol = (value: string): string => {
  if (!value) {
    return 'https://app.chatwoot.com';
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `https://${value}`;
};

const ensureTrailingSlash = (value: string): string => {
  if (!value.endsWith('/')) {
    return `${value}/`;
  }
  return value;
};

const extractHost = (value: string): string => {
  try {
    return new URL(ensureProtocol(value)).host.toLowerCase();
  } catch (error) {
    return value
      .replace(/^https?:\/\//i, '')
      .replace(/\/$/, '')
      .toLowerCase();
  }
};

const installationUrl = ensureTrailingSlash(ensureProtocol(DEFAULT_CHATWOOT_BASE_URL));
const extractedHost = extractHost(installationUrl);
const baseHost = extractedHost || 'app.chatwoot.com';

const websocketUrl =
  process.env.EXPO_PUBLIC_CHATWOOT_WEBSOCKET_URL ??
  `${installationUrl.replace(/^http/i, 'ws')}cable`;

const rawSsoHosts = process.env.EXPO_PUBLIC_CHATWOOT_SSO_HOSTS ?? baseHost;
const ssoHosts = rawSsoHosts
  .split(',')
  .map((host: string) => host.trim().toLowerCase())
  .filter(Boolean);

export const chatwootConfig = {
  installationUrl,
  baseUrl: baseHost,
  webSocketUrl: websocketUrl,
  ssoHosts,
};

export const isChatwootCloudHost = (value?: string | null): boolean => {
  if (!value) {
    return false;
  }
  const host = extractHost(value);
  return host ? chatwootConfig.ssoHosts.includes(host) : false;
};
