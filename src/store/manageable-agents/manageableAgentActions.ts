import { createAsyncThunk } from '@reduxjs/toolkit';

import { ManageableAgentService } from './manageableAgentService';
import type { ManageableAgent } from './manageableAgentTypes';

export const manageableAgentActions = {
  fetchAgents: createAsyncThunk<ManageableAgent[], void, { rejectValue: string }>(
    'manageableAgents/fetchAgents',
    async (_, { rejectWithValue }) => {
      try {
        return await ManageableAgentService.fetchAgents();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to load agents for this account.';
        return rejectWithValue(message);
      }
    },
  ),
};
