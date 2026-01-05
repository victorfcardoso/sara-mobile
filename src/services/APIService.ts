import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

import { getStore } from '@/store/storeAccessor';
import I18n from '@/i18n';
import { showToast } from '@/utils/toastUtils';

const nonAccountRoutes = [
  'profile',
  'profile/availability',
  'notification_subscriptions',
  'profile/set_active_account',
];

class APIService {
  private static instance: APIService;
  private api = axios.create();

  private constructor() {
    this.setupInterceptors();
  }

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config: AxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        const store = getStore();
        const state = store.getState();
        const session = state.auth.chatwootSession;

        const baseUrl = session?.installationUrl ?? state.settings?.installationUrl;
        if (baseUrl) {
          config.baseURL = baseUrl;
        }

        const accountId = state.auth.user?.account_id ?? session?.accountId;
        const requestUrl = config.url ?? '';
        let resolvedUrl = requestUrl;

        if (!/^https?:\/\//i.test(requestUrl)) {
          if (accountId && !nonAccountRoutes.includes(requestUrl)) {
            resolvedUrl = `api/v1/accounts/${accountId}/${requestUrl}`;
          } else if (nonAccountRoutes.includes(requestUrl)) {
            resolvedUrl = `api/v1/${requestUrl}`;
          }
        }
        config.url = resolvedUrl;

        const mergedHeaders = {
          ...config.headers,
          ...(session?.apiAccessToken ? { api_access_token: session.apiAccessToken } : {}),
        };

        if (__DEV__) {
          console.log('[APIService] Request', {
            url: resolvedUrl,
            baseURL: config.baseURL,
            hasApiAccessToken: Boolean(session?.apiAccessToken),
          });
        }

        return {
          ...config,
          headers: mergedHeaders,
        } as InternalAxiosRequestConfig;
      },
      (error: AxiosError) => Promise.reject(error),
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          const store = getStore();
          store.dispatch({ type: 'auth/logout' });
        } else {
          showToast({ message: I18n.t('ERRORS.COMMON_ERROR') });
        }
        if (__DEV__) {
          console.log('[APIService] Response error', {
            status: error.response?.status,
            data: error.response?.data,
          });
        }
        return Promise.reject(error);
      },
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.get<T>(url, config);
  }
  public async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) {
    return this.api.post<T>(url, data, config);
  }

  public async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) {
    return this.api.put<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(url, config);
  }
}

export const apiService = APIService.getInstance();
