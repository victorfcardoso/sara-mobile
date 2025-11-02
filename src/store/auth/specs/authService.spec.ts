import axios from 'axios';

import { AuthService } from '@/store/auth/authService';
import { apiService } from '@/services/APIService';
import { mockUser, mockChatwootSession, mockSaraTokens } from './authMockData';

jest.mock('axios');

jest.mock('@/services/APIService', () => ({
  apiService: {
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
  });

  describe('login', () => {
    it('authenticates with Sara, fetches Chatwoot session, and hydrates profile', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          status: 'SUCCESSFUL',
          data: {
            access_token: mockSaraTokens.accessToken,
            refresh_token: mockSaraTokens.refreshToken,
            token_type: mockSaraTokens.tokenType,
          },
        },
      });

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

      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('/auth/login'),
        credentials,
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        2,
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

    it('throws when Sara login fails', async () => {
      const credentials = { email: 'test@example.com', password: 'wrong' };
      const failure = new Error('Invalid credentials');

      mockedAxios.post.mockRejectedValueOnce(failure);

      await expect(AuthService.login(credentials)).rejects.toThrow(failure);
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
    it('delegates to apiService.post', async () => {
      const payload = { email: 'test@example.com' };
      const mockResponse = { data: { message: 'Password reset email sent' } };

      (apiService.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await AuthService.resetPassword(payload);

      expect(apiService.post).toHaveBeenCalledWith('auth/password', payload);
      expect(result).toEqual(mockResponse.data);
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
}
