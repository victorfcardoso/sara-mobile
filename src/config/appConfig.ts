const scheme = process.env.EXPO_PUBLIC_URL_SCHEME ?? 'chatwootapp';
const ssoCallbackPath = 'auth/saml';

export const appConfig = {
  scheme,
  ssoCallbackPath,
  ssoCallbackUrl: `${scheme}://${ssoCallbackPath}`,
};

