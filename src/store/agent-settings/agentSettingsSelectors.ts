import type { RootState } from '@/store';

export const selectAgentSettingsState = (state: RootState) => state.agentSettings;

export const selectAgentSettingsData = (state: RootState) => state.agentSettings.data;

export const selectAgentSettingsIntegrations = (state: RootState) =>
  state.agentSettings.data?.integrations ?? null;

export const selectAgentSettingsServices = (state: RootState) =>
  state.agentSettings.data?.services ?? [];

export const selectAgentSettingsIsFetching = (state: RootState) =>
  state.agentSettings.uiFlags.isFetching;

export const selectAgentSettingsIsUpdating = (state: RootState) =>
  state.agentSettings.uiFlags.isUpdating;

export const selectAgentSettingsError = (state: RootState) => state.agentSettings.error;
