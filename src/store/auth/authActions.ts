import { createAsyncThunk } from '@reduxjs/toolkit';

import I18n from '@/i18n';
import { applyChatwootSession } from '@/store/settings/settingsSlice';

import { AuthService } from './authService';
import type {
  LoginPayload,
  LoginResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  AvailabilityPayload,
  ProfileResponse,
  ApiErrorResponse,
  SetActiveAccountPayload,
} from './authTypes';
import { handleApiError } from './authUtils';

const createAuthThunk = <TResponse, TPayload>(
  type: string,
  handler: (payload: TPayload) => Promise<TResponse>,
  errorMessage?: string,
) => {
  return createAsyncThunk<TResponse, TPayload, { rejectValue: ApiErrorResponse }>(
    type,
    async (payload, { rejectWithValue }) => {
      try {
        return await handler(payload);
      } catch (error) {
        return rejectWithValue(handleApiError(error, errorMessage));
      }
    },
  );
};

const deriveBaseUrl = (installationUrl: string): string => {
  try {
    const parsed = new URL(installationUrl);
    return parsed.host;
  } catch {
    return installationUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }
};

export const authActions = {
  login: createAsyncThunk<LoginResponse, LoginPayload, { rejectValue: ApiErrorResponse }>(
    'auth/login',
    async (payload, { rejectWithValue, dispatch }) => {
      try {
        const result = await AuthService.login(payload);
        const { chatwootSession } = result;
        dispatch(
          applyChatwootSession({
            installationUrl: chatwootSession.installationUrl,
            webSocketUrl: chatwootSession.websocketUrl,
            baseUrl: deriveBaseUrl(chatwootSession.installationUrl),
          }),
        );
        return result;
      } catch (error) {
        return rejectWithValue(handleApiError(error, I18n.t('ERRORS.AUTH')));
      }
    },
  ),

  getProfile: createAuthThunk<ProfileResponse, void>('auth/getProfile', () =>
    AuthService.getProfile(),
  ),

  resetPassword: createAuthThunk<ResetPasswordResponse, ResetPasswordPayload>(
    'auth/resetPassword',
    AuthService.resetPassword,
  ),

  updateAvailability: createAuthThunk<ProfileResponse, AvailabilityPayload>(
    'auth/updateAvailability',
    AuthService.updateAvailability,
  ),

  setActiveAccount: createAuthThunk<ProfileResponse, SetActiveAccountPayload>(
    'auth/setActiveAccount',
    AuthService.setActiveAccount,
  ),
};
