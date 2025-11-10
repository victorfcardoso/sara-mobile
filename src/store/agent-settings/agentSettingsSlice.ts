import { createSlice } from '@reduxjs/toolkit';

import { agentSettingsActions } from './agentSettingsActions';
import type { AgentSettingsState } from './agentSettingsTypes';

const initialState: AgentSettingsState = {
  data: null,
  uiFlags: {
    isFetching: false,
    isUpdating: false,
  },
  error: null,
  lastFetchedAt: null,
};

export const agentSettingsSlice = createSlice({
  name: 'agentSettings',
  initialState,
  reducers: {
    clearAgentSettings: state => {
      state.data = null;
      state.uiFlags.isFetching = false;
      state.uiFlags.isUpdating = false;
      state.error = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(agentSettingsActions.fetchAgentSettings.pending, state => {
        state.uiFlags.isFetching = true;
        state.error = null;
      })
      .addCase(agentSettingsActions.fetchAgentSettings.fulfilled, (state, action) => {
        state.uiFlags.isFetching = false;
        state.error = null;
        state.data = action.payload;
        state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(agentSettingsActions.fetchAgentSettings.rejected, (state, action) => {
        state.uiFlags.isFetching = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Failed to load agent settings.';
      })
      .addCase(agentSettingsActions.updateAgentSettings.pending, state => {
        state.uiFlags.isUpdating = true;
        state.error = null;
      })
      .addCase(agentSettingsActions.updateAgentSettings.fulfilled, (state, action) => {
        state.uiFlags.isUpdating = false;
        state.error = null;
        state.data = action.payload;
        state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(agentSettingsActions.updateAgentSettings.rejected, (state, action) => {
        state.uiFlags.isUpdating = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Failed to update agent settings.';
      });
  },
});

export const { clearAgentSettings } = agentSettingsSlice.actions;
export const agentSettingsReducer = agentSettingsSlice.reducer;
