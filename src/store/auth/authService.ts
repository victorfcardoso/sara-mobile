import axios from 'axios';
import type { CognitoUserSession } from 'amazon-cognito-identity-js';

import { apiService } from '@/services/APIService';
import { saraApiService } from '@/services/SaraAPIService';
import { forgotPassword, signIn, CognitoChallengeError } from '@/services/cognitoAuth';
import type { User } from '@/types/User';
import { buildSaraApiUrl } from '@/config/saraConfig';
import I18n from '@/i18n';

import type {
  LoginPayload,
  LoginResponse,
  ChatwootMobileAuthResponse,
  ChatwootMobileAuthAgent,
  SaraTokens,
  ResetPasswordPayload,
  ResetPasswordResponse,
  AvailabilityPayload,
  ProfileResponse,
  SetActiveAccountPayload,
  ChatwootSession,
} from './authTypes';
const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  try {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  } catch {
    return null;
  }
};

const ensureAgent = (
  response: ChatwootMobileAuthResponse,
  preferredAgentId?: string | null,
): ChatwootMobileAuthAgent => {
  const preferredId = preferredAgentId ?? response.default_agent_id;
  const { agents } = response;

  if (!agents?.length) {
    throw new Error('No Chatwoot agents configured for this user.');
  }

  const preferred =
    (preferredId && agents.find(agent => agent.agent_id === preferredId)) ?? agents[0];

  return preferred;
};

const extractCognitoTokens = (session: CognitoUserSession): SaraTokens => {
  const idToken = session.getIdToken()?.getJwtToken?.();
  const refreshToken = session.getRefreshToken()?.getToken?.();

  if (!idToken || !refreshToken) {
    throw new Error('Cognito ID token missing. Verify the user pool app client settings.');
  }

  return {
    accessToken: idToken,
    refreshToken,
    tokenType: 'bearer',
  };
};

export class AuthService {
  static async login(credentials: LoginPayload): Promise<LoginResponse> {
    try {
      const session = await signIn(credentials.email, credentials.password);
      const tokens = extractCognitoTokens(session);

      const mobileAuthUrl = buildSaraApiUrl('/chatwoot/mobile-auth');
      let mobileAuth: ChatwootMobileAuthResponse;

      try {
        const response = await axios.post<ChatwootMobileAuthResponse>(
          mobileAuthUrl,
          {},
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        );
        mobileAuth = response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          throw new Error(
            'Chatwoot setup is incomplete for this operator. Ask an admin to finish linking the Chatwoot credentials.',
          );
        }
        throw error;
      }
      let agent = ensureAgent(mobileAuth);

      let installationUrl = agent.installation_url;
      let websocketUrl = agent.websocket_url;
      let apiAccessToken = agent.api_access_token?.trim() || null;

      if (__DEV__) {
        console.log('[AuthService] Chatwoot auth payload', {
          installationUrl,
          websocketUrl,
          hasApiAccessToken: Boolean(apiAccessToken),
        });
      }

      if (!installationUrl) {
        throw new Error('Chatwoot installation URL missing from bootstrap payload.');
      }

      if (!apiAccessToken) {
        throw new Error(
          'Chatwoot API access token not configured for this operator. Generate a personal token and try again.',
        );
      }

      let profileUrl = new URL('api/v1/profile', installationUrl).toString();
      let profileResponse;
      try {
        profileResponse = await axios.get<ProfileResponse>(profileUrl, {
          headers: { api_access_token: apiAccessToken },
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          if (__DEV__) {
            console.log('[AuthService] Chatwoot token rejected; attempting PAT rotation');
          }

          try {
            const rotated = await axios.post<ChatwootMobileAuthResponse>(
              mobileAuthUrl,
              { agent_id: agent.agent_id, rotate_pat: true },
              {
                headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            mobileAuth = rotated.data;
            agent = ensureAgent(mobileAuth, agent.agent_id);

            installationUrl = agent.installation_url;
            websocketUrl = agent.websocket_url;
            apiAccessToken = agent.api_access_token?.trim() || null;

            if (!installationUrl) {
              throw new Error('Chatwoot installation URL missing from rotated bootstrap payload.');
            }

            if (!apiAccessToken) {
              throw new Error('Chatwoot API access token missing after rotation.');
            }

            profileUrl = new URL('api/v1/profile', installationUrl).toString();
            profileResponse = await axios.get<ProfileResponse>(profileUrl, {
              headers: { api_access_token: apiAccessToken },
            });
          } catch (rotateError) {
            if (__DEV__) {
              console.log('[AuthService] PAT rotation attempt failed', rotateError);
            }

            if (axios.isAxiosError(rotateError)) {
              const detail = (rotateError.response?.data as { detail?: unknown })?.detail;
              if (typeof detail === 'string' && detail.trim()) {
                throw new Error(detail);
              }

              if (rotateError.response?.status === 409 || rotateError.response?.status === 422) {
                throw new Error('Chatwoot token rotation failed.');
              }
            }

            const host = new URL(profileUrl).host;
            const suffix = apiAccessToken ? apiAccessToken.slice(-4) : '????';
            const debugMessage = __DEV__
              ? `Chatwoot token rejected by ${host} (token ..${suffix}). Ask an admin to refresh it.`
              : 'Chatwoot token rejected. Ask an admin to refresh it.';
            throw new Error(debugMessage);
          }
        } else {
          throw error;
        }
      }
      const profileData = profileResponse.data as unknown as User | { user?: User };
      const chatwootUser: User | undefined =
        (profileData as { user?: User })?.user ?? (profileData as User);

      if (!chatwootUser || !chatwootUser.id) {
        throw new Error('Chatwoot profile payload missing expected user fields.');
      }

      return {
        saraTokens: tokens,
        user: chatwootUser,
        chatwootSession: {
          agentId: agent.agent_id ?? null,
          accountId: toNumberOrNull(agent.account_id ?? chatwootUser?.account_id),
          installationUrl,
          websocketUrl,
          inboxId: toNumberOrNull(agent.inbox_id),
          apiAccessToken,
          ssoUrl: agent.sso_url ?? null,
          chatwootUserId: mobileAuth.chatwoot_user_id ?? null,
          chatwootAccountId: mobileAuth.chatwoot_account_id ?? null,
        },
      };
    } catch (error) {
      // Handle Cognito challenge errors with user-friendly messages
      if (error instanceof CognitoChallengeError) {
        switch (error.challenge) {
          case 'NEW_PASSWORD_REQUIRED':
            throw new Error(I18n.t('LOGIN.ERRORS.NEW_PASSWORD_REQUIRED'));
          case 'MFA_REQUIRED':
          case 'TOTP_REQUIRED':
            throw new Error(I18n.t('LOGIN.ERRORS.MFA_REQUIRED'));
          case 'MFA_SETUP':
            throw new Error(I18n.t('LOGIN.ERRORS.MFA_SETUP_REQUIRED'));
          default:
            throw error;
        }
      }
      if (axios.isAxiosError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        throw error;
      }
      if (typeof error === 'string') {
        throw new Error(error);
      }
      const message = (error as { message?: string })?.message;
      throw new Error(message || 'Authentication failed.');
    }
  }

  static async getProfile(): Promise<ProfileResponse> {
    const response = await apiService.get<ProfileResponse>('profile');
    return response.data;
  }

  static async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    await forgotPassword(payload.email);
    return { message: I18n.t('FORGOT_PASSWORD.API_SUCCESS') };
  }

  static async updateAvailability(payload: AvailabilityPayload): Promise<ProfileResponse> {
    const response = await apiService.post<ProfileResponse>('profile/availability', payload);
    return response.data;
  }

  static async setActiveAccount(payload: SetActiveAccountPayload): Promise<ProfileResponse> {
    const response = await apiService.put<ProfileResponse>('profile/set_active_account', payload);
    return response.data;
  }

  static async switchAgent(agentId: string): Promise<{
    user: User;
    chatwootSession: ChatwootSession;
  }> {
    if (!agentId) {
      throw new Error('Missing agent identifier.');
    }

    const mobileAuthResponse = await saraApiService.post<ChatwootMobileAuthResponse>(
      '/chatwoot/mobile-auth',
      { agent_id: agentId },
    );

    const mobileAuth = mobileAuthResponse.data;
    const agent = ensureAgent(mobileAuth, agentId);

    const installationUrl = agent.installation_url;
    const apiAccessToken = agent.api_access_token?.trim() || null;

    if (!installationUrl) {
      throw new Error('Chatwoot installation URL missing for the selected agent.');
    }

    if (!apiAccessToken) {
      throw new Error('Chatwoot API access token not configured for the selected agent.');
    }

    const profileUrl = new URL('api/v1/profile', installationUrl).toString();
    let profileResponse;
    try {
      profileResponse = await axios.get<ProfileResponse>(profileUrl, {
        headers: { api_access_token: apiAccessToken },
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const host = new URL(profileUrl).host;
        const suffix = apiAccessToken ? apiAccessToken.slice(-4) : '????';
        const debugMessage = __DEV__
          ? `Chatwoot token rejected by ${host} (token ..${suffix}). Ask an admin to refresh it.`
          : 'Chatwoot token rejected. Ask an admin to refresh it.';
        throw new Error(debugMessage);
      }
      throw error;
    }
    const profileData = profileResponse.data as unknown as User | { user?: User };
    const chatwootUser: User | undefined =
      (profileData as { user?: User })?.user ?? (profileData as User);

    if (!chatwootUser || !chatwootUser.id) {
      throw new Error('Chatwoot profile payload missing expected user fields.');
    }

    return {
      user: chatwootUser,
      chatwootSession: {
        agentId: agent.agent_id ?? null,
        accountId: toNumberOrNull(agent.account_id ?? chatwootUser?.account_id),
        installationUrl,
        websocketUrl: agent.websocket_url,
        inboxId: toNumberOrNull(agent.inbox_id),
        apiAccessToken,
        ssoUrl: agent.sso_url ?? null,
        chatwootUserId: mobileAuth.chatwoot_user_id ?? null,
        chatwootAccountId: mobileAuth.chatwoot_account_id ?? null,
      },
    };
  }
}
