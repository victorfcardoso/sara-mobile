import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@/store';

import { AgentSettingsService } from './agentSettingsService';
import type { AgentSettings, AgentSettingsUpdateInput } from './agentSettingsTypes';

export const agentSettingsActions = {
  fetchAgentSettings: createAsyncThunk<
    AgentSettings,
    void,
    { state: RootState; rejectValue: string }
  >('agentSettings/fetchAgentSettings', async (_: void, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const agentId = state.auth.chatwootSession?.agentId;

      if (!agentId) {
        return rejectWithValue('Active agent is not configured for this session.');
      }

      return await AgentSettingsService.fetchAgentSettings(agentId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load agent settings.';
      return rejectWithValue(message);
    }
  }),
  updateAgentSettings: createAsyncThunk<
    AgentSettings,
    AgentSettingsUpdateInput,
    { state: RootState; rejectValue: string }
  >('agentSettings/updateAgentSettings', async (payload, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const agentId = state.auth.chatwootSession?.agentId;

      if (!agentId) {
        return rejectWithValue('Active agent is not configured for this session.');
      }

      return await AgentSettingsService.updateAgentSettings(agentId, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update agent settings.';
      return rejectWithValue(message);
    }
  }),
};
