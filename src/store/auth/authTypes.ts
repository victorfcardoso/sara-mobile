import type { User } from '@/types/User';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SaraTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface ChatwootMobileAuthAgent {
  agent_id: string;
  name?: string;
  account_id?: number | null;
  installation_url: string;
  websocket_url: string;
  inbox_id?: number | null;
  api_access_token?: string | null;
  sso_url?: string | null;
}

export interface ChatwootMobileAuthResponse {
  sara_user_id: string;
  chatwoot_user_id?: string | null;
  chatwoot_account_id?: string | null;
  default_agent_id: string;
  agents: ChatwootMobileAuthAgent[];
}

export interface ChatwootSession {
  agentId: string | null;
  accountId: number | null;
  installationUrl: string;
  websocketUrl: string;
  inboxId: number | null;
  apiAccessToken: string | null;
  ssoUrl: string | null;
  chatwootUserId: string | null;
  chatwootAccountId: string | null;
}

export interface LoginResponse {
  saraTokens: SaraTokens;
  user: User;
  chatwootSession: ChatwootSession;
}

export interface ResetPasswordPayload {
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface AvailabilityPayload {
  profile: {
    availability: string;
    account_id: string;
  };
}

export interface ProfileResponse {
  user: User;
}

export interface ApiErrorResponse {
  success: boolean;
  errors: string[];
  message?: string;
}

export interface SetActiveAccountPayload {
  profile: {
    account_id: number;
  };
}
