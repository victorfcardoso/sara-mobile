import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store';
import type { CrmCustomer } from './crmCustomersTypes';

export const selectCrmCustomersState = (state: RootState) => state.crmCustomers;

export const selectCrmCustomers = createSelector(selectCrmCustomersState, slice =>
  Object.values(slice.entities).filter(Boolean) as CrmCustomer[],
);

export const selectCrmCustomerById = (state: RootState, id: string) =>
  (state.crmCustomers.entities[id] ?? null) as CrmCustomer | null;

export const selectCrmCustomersUiFlags = createSelector(
  selectCrmCustomersState,
  slice => slice.uiFlags,
);

export const selectCrmCustomersError = createSelector(
  selectCrmCustomersState,
  slice => slice.error,
);

export const selectCrmCustomersPagination = createSelector(
  selectCrmCustomersState,
  slice => slice.pagination,
);

export const selectCrmCustomersSearchQuery = createSelector(
  selectCrmCustomersState,
  slice => slice.searchQuery,
);

export const selectCrmCustomersLastFetchedAt = createSelector(
  selectCrmCustomersState,
  slice => slice.lastFetchedAt,
);
