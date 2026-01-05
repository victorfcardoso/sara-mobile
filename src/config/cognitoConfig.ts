import Constants from 'expo-constants';

const resolveCognitoValue = (
  explicit: string | undefined,
  extra: unknown,
  label: string,
  envKey: string,
): string => {
  const extraValue = typeof extra === 'string' ? extra : undefined;
  const candidate = (explicit ?? extraValue)?.trim();

  if (!candidate) {
    throw new Error(`${label} is not configured. Set ${envKey}.`);
  }

  return candidate;
};

const userPoolId = resolveCognitoValue(
  process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID,
  Constants?.expoConfig?.extra?.cognitoUserPoolId,
  'Cognito user pool ID',
  'EXPO_PUBLIC_COGNITO_USER_POOL_ID',
);

const clientId = resolveCognitoValue(
  process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
  Constants?.expoConfig?.extra?.cognitoClientId,
  'Cognito client ID',
  'EXPO_PUBLIC_COGNITO_CLIENT_ID',
);

export const cognitoConfig = {
  userPoolId,
  clientId,
};
