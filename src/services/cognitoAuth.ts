import '@/utils/cognitoPolyfills';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

import { cognitoConfig } from '@/config/cognitoConfig';

const getUserPool = () =>
  new CognitoUserPool({
    UserPoolId: cognitoConfig.userPoolId,
    ClientId: cognitoConfig.clientId,
    Storage: AsyncStorage,
  });

export type CognitoAuthChallenge =
  | 'NEW_PASSWORD_REQUIRED'
  | 'MFA_REQUIRED'
  | 'TOTP_REQUIRED'
  | 'MFA_SETUP';

export class CognitoChallengeError extends Error {
  challenge: CognitoAuthChallenge;
  cognitoUser: CognitoUser;

  constructor(challenge: CognitoAuthChallenge, user: CognitoUser) {
    super(challenge);
    this.name = 'CognitoChallengeError';
    this.challenge = challenge;
    this.cognitoUser = user;
  }
}

const authenticate = (
  user: CognitoUser,
  authDetails: AuthenticationDetails,
): Promise<CognitoUserSession> =>
  new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: session => resolve(session),
      onFailure: err => reject(err),
      newPasswordRequired: () => reject(new CognitoChallengeError('NEW_PASSWORD_REQUIRED', user)),
      mfaRequired: () => reject(new CognitoChallengeError('MFA_REQUIRED', user)),
      totpRequired: () => reject(new CognitoChallengeError('TOTP_REQUIRED', user)),
      mfaSetup: () => reject(new CognitoChallengeError('MFA_SETUP', user)),
    });
  });

export function signIn(email: string, password: string): Promise<CognitoUserSession> {
  const userPool = getUserPool();
  const normalizedEmail = email.trim();
  const authDetails = new AuthenticationDetails({ Username: normalizedEmail, Password: password });
  const user = new CognitoUser({ Username: normalizedEmail, Pool: userPool });

  return authenticate(user, authDetails);
}

export function forgotPassword(email: string): Promise<void> {
  const userPool = getUserPool();
  const user = new CognitoUser({ Username: email, Pool: userPool });

  return new Promise((resolve, reject) => {
    user.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: err => reject(err),
    });
  });
}

export function signOut(): void {
  const userPool = getUserPool();
  const user = userPool.getCurrentUser();
  if (user) {
    user.signOut();
  }
}

export function sendMFACode(
  cognitoUser: CognitoUser,
  code: string,
  mfaType: 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA' = 'SMS_MFA',
): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    cognitoUser.sendMFACode(
      code,
      {
        onSuccess: session => resolve(session),
        onFailure: err => reject(err),
      },
      mfaType,
    );
  });
}

export function completeNewPasswordChallenge(
  cognitoUser: CognitoUser,
  newPassword: string,
): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess: session => resolve(session),
      onFailure: err => reject(err),
    });
  });
}

export function getCurrentSession(): Promise<CognitoUserSession | null> {
  const userPool = getUserPool();
  const user = userPool.getCurrentUser();
  if (!user) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) reject(err);
      else resolve(session);
    });
  });
}
