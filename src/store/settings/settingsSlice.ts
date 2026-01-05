import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as RootNavigation from '@/utils/navigationUtils';
import { NotificationSettings } from './settingsTypes';
import { Theme } from '@/types/common/Theme';
import { chatwootConfig } from '@/config/chatwootConfig';
import { settingsActions } from './settingsActions';

interface SettingsState {
  baseUrl: string;
  installationUrl: string;
  uiFlags: {
    isSettingUrl: boolean;
    isUpdating: boolean;
    isLocaleSet: boolean;
  };
  notificationSettings: NotificationSettings;
  localeValue: string;
  webSocketUrl: string;
  theme: Theme;
  version: string;
  pushToken: string;
  rememberMe: boolean;
}
const initialState: SettingsState = {
  baseUrl: chatwootConfig.baseUrl,
  installationUrl: chatwootConfig.installationUrl,
  uiFlags: {
    isSettingUrl: false,
    isUpdating: false,
    isLocaleSet: false,
  },
  localeValue: 'en',
  notificationSettings: {
    account_id: 0,
    all_email_flags: [],
    all_push_flags: [],
    id: 0,
    selected_email_flags: [],
    selected_push_flags: [],
    user_id: 0,
  },
  webSocketUrl: chatwootConfig.webSocketUrl,
  theme: 'system',
  version: '',
  pushToken: '',
  rememberMe: false,
};
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    ensureInstallationDefaults: state => {
      if (!state.installationUrl) {
        state.installationUrl = chatwootConfig.installationUrl;
      }
      if (!state.baseUrl) {
        state.baseUrl = chatwootConfig.baseUrl;
      }
      if (!state.webSocketUrl) {
        state.webSocketUrl = chatwootConfig.webSocketUrl;
      }
    },
    resetSettings: state => {
      state.uiFlags.isSettingUrl = false;
      state.uiFlags.isUpdating = false;
    },
    setLocale: (state, action) => {
      state.localeValue = action.payload;
      state.uiFlags.isLocaleSet = true;
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },
    applyChatwootSession: (
      state,
      action: PayloadAction<{ installationUrl: string; webSocketUrl: string; baseUrl?: string }>,
    ) => {
      const { installationUrl, webSocketUrl, baseUrl } = action.payload;
      state.installationUrl = installationUrl;
      state.webSocketUrl = webSocketUrl;
      if (baseUrl) {
        state.baseUrl = baseUrl;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(settingsActions.setInstallationUrl.pending, state => {
        state.uiFlags.isSettingUrl = true;
      })
      .addCase(settingsActions.setInstallationUrl.fulfilled, (state, action) => {
        state.uiFlags.isSettingUrl = false;
        state.installationUrl = action.payload.installationUrl;
        state.baseUrl = action.payload.baseUrl;
        state.webSocketUrl = action.payload.webSocketUrl;
        RootNavigation.navigate('Login');
      })
      .addCase(settingsActions.setInstallationUrl.rejected, state => {
        state.uiFlags.isSettingUrl = false;
        state.installationUrl = '';
        state.baseUrl = '';
      })
      .addCase(settingsActions.getNotificationSettings.fulfilled, (state, action) => {
        state.notificationSettings = action.payload;
      })
      .addCase(settingsActions.updateNotificationSettings.pending, state => {
        state.uiFlags.isUpdating = true;
      })
      .addCase(settingsActions.updateNotificationSettings.fulfilled, (state, action) => {
        state.uiFlags.isUpdating = false;
        state.notificationSettings = action.payload;
      })
      .addCase(settingsActions.updateNotificationSettings.rejected, state => {
        state.uiFlags.isUpdating = false;
      })
      .addCase(settingsActions.getChatwootVersion.fulfilled, (state, action) => {
        const { version } = action.payload;
        state.version = version;
      })
      .addCase(settingsActions.saveDeviceDetails.fulfilled, (state, action) => {
        if (action?.payload?.fcmToken) {
          state.pushToken = action.payload.fcmToken;
        }
      })
      .addCase(settingsActions.saveDeviceDetails.rejected, (state, action) => {
        state.pushToken = '';
      });
  },
});
export const {
  ensureInstallationDefaults,
  resetSettings,
  setLocale,
  setTheme,
  setRememberMe,
  applyChatwootSession,
} = settingsSlice.actions;
export default settingsSlice.reducer;
