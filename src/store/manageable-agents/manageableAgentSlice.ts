import { createSlice } from '@reduxjs/toolkit';

import { manageableAgentActions } from './manageableAgentActions';
import type { ManageableAgentsState } from './manageableAgentTypes';

const initialState: ManageableAgentsState = {
  data: [],
  uiFlags: {
    isFetching: false,
    error: null,
  },
  lastFetchedAt: null,
};

export const manageableAgentSlice = createSlice({
  name: 'manageableAgents',
  initialState,
  reducers: {
    clearManageableAgents: state => {
      state.data = [];
      state.uiFlags.isFetching = false;
      state.uiFlags.error = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(manageableAgentActions.fetchAgents.pending, state => {
        state.uiFlags.isFetching = true;
        state.uiFlags.error = null;
      })
      .addCase(manageableAgentActions.fetchAgents.fulfilled, (state, action) => {
        state.uiFlags.isFetching = false;
        state.uiFlags.error = null;
        state.data = action.payload;
        state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(manageableAgentActions.fetchAgents.rejected, (state, action) => {
        state.uiFlags.isFetching = false;
        state.uiFlags.error = action.payload ?? 'Unable to load agents for this account.';
      });
  },
});

export const { clearManageableAgents } = manageableAgentSlice.actions;
export const manageableAgentReducer = manageableAgentSlice.reducer;
