import Constants from 'expo-constants';
import type { CognitoUserSession } from 'amazon-cognito-identity-js';

import { AppDispatch, RootState } from '@/store';
import { ensureInstallationDefaults } from './settingsSlice';
import { chatwootConfig } from '@/config/chatwootConfig';
import { getCurrentSession } from '@/services/cognitoAuth';
import { updateSaraTokens, logout } from '@/store/auth/authSlice';
import type { SaraTokens } from '@/store/auth/authTypes';

const extractTokensFromSession = (session: CognitoUserSession): SaraTokens | null => {
  const idToken = session.getIdToken()?.getJwtToken?.();
  const refreshToken = session.getRefreshToken()?.getToken?.();

  if (!idToken || !refreshToken) {
    return null;
  }

  return {
    accessToken: idToken,
    refreshToken,
    tokenType: 'bearer',
  };
};

/**
 * Seeds the installation URL from the Expo runtime configuration when the persisted state is empty.
 * This keeps first-launch behaviour aligned with our single-tenant deployment.
 */
export const bootstrapInstallationUrl =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const hasInstallationUrl = Boolean(state.settings.installationUrl);
    const defaultInstallationUrl =
      (Constants?.expoConfig?.extra?.defaultInstallationUrl as string | undefined) ??
      chatwootConfig.installationUrl;

    if (!hasInstallationUrl && defaultInstallationUrl) {
      dispatch(ensureInstallationDefaults());
    } else if (!state.settings.webSocketUrl || !state.settings.baseUrl) {
      // If the persisted state is partially missing derived values, backfill them.
      dispatch(ensureInstallationDefaults());
    }
  };

/**
 * Validates and refreshes Cognito tokens on app startup.
 * If the user has stored tokens, this will attempt to refresh them.
 * If refresh fails (e.g., refresh token expired), the user will be logged out.
 */
export const validateAndRefreshTokens =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    // Only validate if user appears to be logged in
    if (!state.auth.saraTokens?.accessToken || !state.auth.user) {
      return;
    }

    try {
      const session = await getCurrentSession();

      if (session) {
        const tokens = extractTokensFromSession(session);
        if (tokens) {
          dispatch(updateSaraTokens(tokens));
          if (__DEV__) {
            console.log('[Bootstrap] Cognito tokens refreshed on startup');
          }
        }
      } else {
        // No valid session, log out
        if (__DEV__) {
          console.log('[Bootstrap] No valid Cognito session, logging out');
        }
        dispatch(logout());
      }
    } catch (error) {
      // Token refresh failed, log out
      if (__DEV__) {
        console.log('[Bootstrap] Token refresh failed on startup:', error);
      }
      dispatch(logout());
    }
  };
