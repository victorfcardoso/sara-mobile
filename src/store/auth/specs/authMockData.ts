export const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  account_id: 123,
  type: 'user',
};

export const mockChatwootSession = {
  agentId: 'agent-1',
  accountId: 123,
  installationUrl: 'https://chat.example.com/',
  websocketUrl: 'wss://chat.example.com/cable',
  inboxId: 10,
  apiAccessToken: 'cw-token',
  ssoUrl: null,
  chatwootUserId: '500',
  chatwootAccountId: '123',
};

export const mockSaraTokens = {
  accessToken: 'sara-access',
  refreshToken: 'sara-refresh',
  tokenType: 'bearer',
};
