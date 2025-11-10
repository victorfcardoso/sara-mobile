import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store';

export const selectManageableAgentsState = (state: RootState) => state.manageableAgents;

export const selectManageableAgents = createSelector(
  [selectManageableAgentsState],
  manageableAgents => manageableAgents.data,
);

export const selectManageableAgentsIsFetching = createSelector(
  [selectManageableAgentsState],
  manageableAgents => manageableAgents.uiFlags.isFetching,
);

export const selectManageableAgentsError = createSelector(
  [selectManageableAgentsState],
  manageableAgents => manageableAgents.uiFlags.error,
);
