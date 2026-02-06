import axios from 'axios';

import { mockUser, mockChatwootSession, mockSaraTokens } from './authMockData';

import { forgotPassword, signIn } from '@/services/cognitoAuth';

// Import after mocks are set up
import { AuthService } from '@/store/auth/authService';
import { apiService } from '@/services/APIService';

jest.mock('axios');

jest.mock('@/services/cognitoAuth', () => {
  const actual = jest.requireActual('@/services/cognitoAuth');
  return {
    ...actual,
    signIn: jest.fn(),
    forgotPassword: jest.fn(),
  };
});

jest.mock('@/services/APIService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/services/SaraAPIService', () => ({
  saraAPIService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('AuthService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    jest.clearAllMocks();
    (mockedAxios.isAxiosError as jest.Mock).mockImplementation((candidate: unknown) =>
      Boolean((candidate as { isAxiosError?: boolean } | null)?.isAxiosError),
    );
  });

  describe('login', () => {
    it('authenticates with Cognito, fetches Chatwoot session, and hydrates profile', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const mockSession = {
        getIdToken: () => ({ getJwtToken: () => mockSaraTokens.accessToken }),
        getRefreshToken: () => ({ getToken: () => mockSaraTokens.refreshToken }),
      };

      (signIn as jest.Mock).mockResolvedValueOnce(mockSession);

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          sara_user_id: 'user-1',
          chatwoot_user_id: mockChatwootSession.chatwootUserId,
          chatwoot_account_id: mockChatwootSession.chatwootAccountId,
          default_agent_id: mockChatwootSession.agentId,
          agents: [
            {
              agent_id: mockChatwootSession.agentId,
              account_id: mockChatwootSession.accountId,
              installation_url: mockChatwootSession.installationUrl,
              websocket_url: mockChatwootSession.websocketUrl,
              inbox_id: mockChatwootSession.inboxId,
              api_access_token: mockChatwootSession.apiAccessToken,
              sso_url: mockChatwootSession.ssoUrl,
            },
          ],
        },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          user: mockUser,
        },
      });

      const result = await AuthService.login(credentials);

      expect(signIn).toHaveBeenCalledWith(credentials.email, credentials.password);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/chatwoot/mobile-auth'),
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining(mockSaraTokens.accessToken),
          }),
        }),
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/profile'),
        expect.objectContaining({
          headers: { api_access_token: mockChatwootSession.apiAccessToken },
        }),
      );

      expect(result).toEqual({
        saraTokens: mockSaraTokens,
        user: mockUser,
        chatwootSession: expect.objectContaining({
          agentId: mockChatwootSession.agentId,
          installationUrl: mockChatwootSession.installationUrl,
          apiAccessToken: mockChatwootSession.apiAccessToken,
        }),
      });
    });

    it('throws when Cognito login fails', async () => {
      const credentials = { email: 'test@example.com', password: 'wrong' };
      const failure = new Error('Invalid credentials');

      (signIn as jest.Mock).mockRejectedValueOnce(failure);

      await expect(AuthService.login(credentials)).rejects.toThrow(failure);
    });

    it('rotates the Chatwoot PAT and retries when the stored token is rejected', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const mockSession = {
        getIdToken: () => ({ getJwtToken: () => mockSaraTokens.accessToken }),
        getRefreshToken: () => ({ getToken: () => mockSaraTokens.refreshToken }),
      };

      const rejectedTokenError = {
        isAxiosError: true,
        response: { status: 401, data: { error: 'Invalid Access Token' } },
      };

      (signIn as jest.Mock).mockResolvedValueOnce(mockSession);

      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            sara_user_id: 'user-1',
            chatwoot_user_id: mockChatwootSession.chatwootUserId,
            chatwoot_account_id: mockChatwootSession.chatwootAccountId,
            default_agent_id: mockChatwootSession.agentId,
            agents: [
              {
                agent_id: mockChatwootSession.agentId,
                account_id: mockChatwootSession.accountId,
                installation_url: mockChatwootSession.installationUrl,
                websocket_url: mockChatwootSession.websocketUrl,
                inbox_id: mockChatwootSession.inboxId,
                api_access_token: 'stale-token',
                sso_url: mockChatwootSession.ssoUrl,
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            sara_user_id: 'user-1',
            chatwoot_user_id: mockChatwootSession.chatwootUserId,
            chatwoot_account_id: mockChatwootSession.chatwootAccountId,
            default_agent_id: mockChatwootSession.agentId,
            agents: [
              {
                agent_id: mockChatwootSession.agentId,
                account_id: mockChatwootSession.accountId,
                installation_url: mockChatwootSession.installationUrl,
                websocket_url: mockChatwootSession.websocketUrl,
                inbox_id: mockChatwootSession.inboxId,
                api_access_token: 'new-token',
                sso_url: mockChatwootSession.ssoUrl,
              },
            ],
          },
        });

      mockedAxios.get
        .mockRejectedValueOnce(rejectedTokenError)
        .mockResolvedValueOnce({ data: { user: mockUser } });

      const result = await AuthService.login(credentials);

      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/chatwoot/mobile-auth'),
        { agent_id: mockChatwootSession.agentId, rotate_pat: true },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining(mockSaraTokens.accessToken),
          }),
        }),
      );

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('/api/v1/profile'),
        expect.objectContaining({
          headers: { api_access_token: 'stale-token' },
        }),
      );

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/api/v1/profile'),
        expect.objectContaining({
          headers: { api_access_token: 'new-token' },
        }),
      );

      expect(result.chatwootSession.apiAccessToken).toBe('new-token');
    });
  });

  describe('getProfile', () => {
    it('delegates to apiService.get', async () => {
      const mockResponse = { data: mockUser };
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await AuthService.getProfile();

      expect(apiService.get).toHaveBeenCalledWith('profile');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('resetPassword', () => {
    it('delegates to Cognito forgotPassword', async () => {
      const payload = { email: 'test@example.com' };
      (forgotPassword as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await AuthService.resetPassword(payload);

      expect(forgotPassword).toHaveBeenCalledWith(payload.email);
      expect(result).toEqual({ message: 'FORGOT_PASSWORD.API_SUCCESS' });
    });
  });

  describe('updateAvailability', () => {
    it('delegates to apiService.post', async () => {
      const payload = { profile: { availability: 'available', account_id: '1' } };
      const mockResponse = { data: mockUser };

      (apiService.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await AuthService.updateAvailability(payload);

      expect(apiService.post).toHaveBeenCalledWith('profile/availability', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });
});
