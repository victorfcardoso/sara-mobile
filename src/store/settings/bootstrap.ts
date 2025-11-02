import Constants from 'expo-constants';

import { AppDispatch, RootState } from '@/store';
import { ensureInstallationDefaults } from './settingsSlice';
import { chatwootConfig } from '@/config/chatwootConfig';

/**
 * Seeds the installation URL from the Expo runtime configuration when the persisted state is empty.
 * This keeps first-launch behaviour aligned with our single-tenant deployment.
 */
export const bootstrapInstallationUrl =
  () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const hasInstallationUrl = Boolean(state.settings.installationUrl);
    const defaultInstallationUrl =
      (Constants?.expoConfig?.extra?.defaultInstallationUrl as string | undefined) ??
      chatwootConfig.installationUrl;

    if (!hasInstallationUrl && defaultInstallationUrl) {
      dispatch(ensureInstallationDefaults());
    } else if (!state.settings.webSocketUrl || !state.settings.baseUrl) {
      // If the persisted state is partially missing derived values, backfill them.
      dispatch(ensureInstallationDefaults());
    }
  };

