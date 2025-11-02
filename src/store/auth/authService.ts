import axios from 'axios';

import { apiService } from '@/services/APIService';
import type { User } from '@/types/User';
import { buildSaraApiUrl } from '@/config/saraConfig';

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
): ChatwootMobileAuthAgent => {
  const preferredId = response.default_agent_id;
  const { agents } = response;

  if (!agents?.length) {
    throw new Error('No Chatwoot agents configured for this user.');
  }

  const preferred =
    agents.find(agent => agent.agent_id === preferredId) ?? agents[0];

  return preferred;
};

const extractSaraTokens = (payload: unknown): SaraTokens => {
  const data = (payload as Record<string, unknown>) ?? {};
  const accessToken = data.access_token as string | undefined;
  const refreshToken = data.refresh_token as string | undefined;
  const tokenType = (data.token_type as string | undefined) ?? 'bearer';

  if (!accessToken || !refreshToken) {
    throw new Error('Sara authentication response missing tokens.');
  }

  return {
    accessToken,
    refreshToken,
    tokenType,
  };
};

export class AuthService {
  static async login(credentials: LoginPayload): Promise<LoginResponse> {
    try {
      const loginUrl = buildSaraApiUrl('/auth/login');
      const loginResponse = await axios.post(loginUrl, credentials, {
        headers: { 'Content-Type': 'application/json' },
      });

      const loginPayload = loginResponse.data as Record<string, unknown>;
      const tokens = extractSaraTokens(loginPayload.data);

      const mobileAuthUrl = buildSaraApiUrl('/chatwoot/mobile-auth');
      const mobileAuthResponse = await axios.post<ChatwootMobileAuthResponse>(
        mobileAuthUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const mobileAuth = mobileAuthResponse.data;
      const agent = ensureAgent(mobileAuth);

      const installationUrl = agent.installation_url;
      const websocketUrl = agent.websocket_url;
      const apiAccessToken = agent.api_access_token ?? null;

      if (!installationUrl) {
        throw new Error('Chatwoot installation URL missing from bootstrap payload.');
      }

      if (!apiAccessToken) {
        throw new Error(
          'Chatwoot API access token not configured for this operator. Generate a personal token and try again.',
        );
      }

      const profileUrl = new URL('api/v1/profile', installationUrl).toString();
      const profileResponse = await axios.get<ProfileResponse>(profileUrl, {
        headers: { api_access_token: apiAccessToken },
      });

      const chatwootUser: User = profileResponse.data.user;

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
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error((error as Error).message);
    }
  }

  static async getProfile(): Promise<ProfileResponse> {
    const response = await apiService.get<ProfileResponse>('profile');
    return response.data;
  }

  static async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    const response = await apiService.post<ResetPasswordResponse>('auth/password', payload);
    return response.data;
  }

  static async updateAvailability(payload: AvailabilityPayload): Promise<ProfileResponse> {
    const response = await apiService.post<ProfileResponse>('profile/availability', payload);
    return response.data;
  }

  static async setActiveAccount(payload: SetActiveAccountPayload): Promise<ProfileResponse> {
    const response = await apiService.put<ProfileResponse>('profile/set_active_account', payload);
    return response.data;
  }
}
