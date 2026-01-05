import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from 'axios';
import type { CognitoUserSession } from 'amazon-cognito-identity-js';

import I18n from '@/i18n';
import { saraConfig } from '@/config/saraConfig';
import { getStore } from '@/store/storeAccessor';
import { showToast } from '@/utils/toastUtils';
import { getCurrentSession } from '@/services/cognitoAuth';
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

export class SaraAPIService {
  private static instance: SaraAPIService;

  private api: AxiosInstance;

  private isRefreshing = false;

  private refreshSubscribers: Array<(token: string) => void> = [];

  private constructor() {
    this.api = axios.create({
      baseURL: saraConfig.apiBaseUrl,
    });
    this.setupInterceptors();
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async refreshTokens(): Promise<SaraTokens | null> {
    try {
      const session = await getCurrentSession();
      if (!session) {
        return null;
      }

      const tokens = extractTokensFromSession(session);
      if (tokens) {
        const store = getStore();
        // Dispatch by action type to avoid require cycle with authSlice
        store.dispatch({ type: 'auth/updateSaraTokens', payload: tokens });
      }
      return tokens;
    } catch (error) {
      if (__DEV__) {
        console.log('[SaraAPIService] Token refresh failed:', error);
      }
      return null;
    }
  }

  public static getInstance(): SaraAPIService {
    if (!SaraAPIService.instance) {
      SaraAPIService.instance = new SaraAPIService();
    }
    return SaraAPIService.instance;
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const store = getStore();
        const state = store.getState();
        const tokens = state.auth.saraTokens;
        const activeAgentId = state.auth.chatwootSession?.agentId?.trim();

        if (!tokens?.accessToken) {
          throw new Error('Sara authentication token missing.');
        }

        const tokenType = tokens.tokenType ?? 'Bearer';
        const headers = new AxiosHeaders(config.headers);
        headers.set('Accept', 'application/json');
        headers.set(
          'Authorization',
          `${tokenType.charAt(0).toUpperCase()}${tokenType.slice(1)} ${tokens.accessToken}`,
        );

        const hasAgentHeader = headers.has('X-Agent-Id');
        if (!hasAgentHeader) {
          if (!activeAgentId) {
            throw new Error('Active agent not selected. Please log in again.');
          }
          headers.set('X-Agent-Id', activeAgentId);
        }

        config.headers = headers;

        return config;
      },
      error => Promise.reject(error),
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const store = getStore();
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise(resolve => {
              this.addRefreshSubscriber((token: string) => {
                originalRequest.headers.set('Authorization', `Bearer ${token}`);
                resolve(this.api(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const tokens = await this.refreshTokens();

            if (tokens) {
              if (__DEV__) {
                console.log('[SaraAPIService] Token refreshed successfully');
              }
              this.onTokenRefreshed(tokens.accessToken);
              originalRequest.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            if (__DEV__) {
              console.log('[SaraAPIService] Token refresh error:', refreshError);
            }
          } finally {
            this.isRefreshing = false;
          }

          // Token refresh failed, logout user
          store.dispatch({ type: 'auth/logout' });
          return Promise.reject(error);
        }

        // Show toast for non-401 errors that weren't cancelled
        if (!axios.isCancel(error)) {
          showToast({ message: I18n.t('ERRORS.COMMON_ERROR') });
        }

        return Promise.reject(error);
      },
    );
  }

  public async get<T>(path: string, config?: AxiosRequestConfig) {
    return this.api.get<T>(path, config);
  }

  public async post<T, D = unknown>(path: string, data?: D, config?: AxiosRequestConfig) {
    return this.api.post<T>(path, data, config);
  }

  public async patch<T, D = unknown>(path: string, data?: D, config?: AxiosRequestConfig) {
    return this.api.patch<T>(path, data, config);
  }

  public async put<T, D = unknown>(path: string, data?: D, config?: AxiosRequestConfig) {
    return this.api.put<T>(path, data, config);
  }

  public async delete<T>(path: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(path, config);
  }
}

export const saraApiService = SaraAPIService.getInstance();
