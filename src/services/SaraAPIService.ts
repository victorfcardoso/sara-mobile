import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import I18n from '@/i18n';
import { saraConfig } from '@/config/saraConfig';
import { getStore } from '@/store/storeAccessor';
import { showToast } from '@/utils/toastUtils';

export class SaraAPIService {
  private static instance: SaraAPIService;

  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: saraConfig.apiBaseUrl,
    });
    this.setupInterceptors();
  }

  public static getInstance(): SaraAPIService {
    if (!SaraAPIService.instance) {
      SaraAPIService.instance = new SaraAPIService();
    }
    return SaraAPIService.instance;
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async config => {
        const store = getStore();
        const state = store.getState();
        const tokens = state.auth.saraTokens;

        if (!tokens?.accessToken) {
          throw new Error('Sara authentication token missing.');
        }

        const tokenType = tokens.tokenType ?? 'Bearer';
        const headers = {
          Accept: 'application/json',
          ...config.headers,
          Authorization: `${tokenType.charAt(0).toUpperCase()}${tokenType.slice(1)} ${tokens.accessToken}`,
        };

        return {
          ...config,
          headers,
        } as AxiosRequestConfig;
      },
      error => Promise.reject(error),
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        const store = getStore();

        if (error.response?.status === 401) {
          store.dispatch({ type: 'auth/logout' });
        } else if (!axios.isCancel(error)) {
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
}

export const saraApiService = SaraAPIService.getInstance();
