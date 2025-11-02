import {
  selectAuth,
  selectChatwootSession,
  selectSaraTokens,
  selectChatwootApiToken,
  selectUser,
  selectIsLoggingIn,
  selectAuthError,
  selectLoggedIn,
  selectUserId,
} from '@/store/auth/authSelectors';
import { mockUser, mockChatwootSession, mockSaraTokens } from './authMockData';
import { RootState } from '@/store';

describe('Auth Selectors', () => {
  const mockState = {
    auth: {
      user: mockUser,
      chatwootSession: mockChatwootSession,
      saraTokens: mockSaraTokens,
      uiFlags: {
        isLoggingIn: false,
        isResettingPassword: false,
      },
      error: null,
    },
  } as unknown as RootState; // Cast mockState to RootState

  it('should select auth state', () => {
    expect(selectAuth(mockState)).toEqual(mockState.auth);
  });

  it('should select chatwoot session', () => {
    expect(selectChatwootSession(mockState)).toEqual(mockChatwootSession);
  });

  it('should select sara tokens', () => {
    expect(selectSaraTokens(mockState)).toEqual(mockSaraTokens);
  });

  it('should select api access token', () => {
    expect(selectChatwootApiToken(mockState)).toEqual(mockChatwootSession.apiAccessToken);
  });

  it('should select user', () => {
    expect(selectUser(mockState)).toEqual(mockUser);
  });

  it('should select isLoggingIn flag', () => {
    expect(selectIsLoggingIn(mockState)).toBe(false);
  });

  it('should select auth error', () => {
    expect(selectAuthError(mockState)).toBeNull();
  });

  it('should select logged in status', () => {
    expect(selectLoggedIn(mockState)).toBe(true);
  });

  it('should select user id', () => {
    expect(selectUserId(mockState)).toBe(mockUser.id);
  });
});
