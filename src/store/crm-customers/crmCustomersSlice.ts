import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { crmCustomersActions } from './crmCustomersActions';
import { CrmCustomersService } from './crmCustomersService';
import type { CrmCustomer, CrmCustomersState } from './crmCustomersTypes';

const crmCustomersAdapter = createEntityAdapter<CrmCustomer, string>({
  selectId: customer => customer.id,
  sortComparer: (a, b) => {
    const aTime = a.latestSeen ? new Date(a.latestSeen).getTime() : 0;
    const bTime = b.latestSeen ? new Date(b.latestSeen).getTime() : 0;
    if (aTime === bTime) {
      return (a.fullName || a.whatsappPhone).localeCompare(b.fullName || b.whatsappPhone);
    }
    return bTime - aTime;
  },
});

const initialState: CrmCustomersState = crmCustomersAdapter.getInitialState({
  uiFlags: {
    isLoading: false,
    isRefreshing: false,
    isLoadingMore: false,
  },
  pagination: {
    start: 0,
    end: -1,
    total: 0,
    hasMore: false,
    pageSize: CrmCustomersService.DEFAULT_PAGE_SIZE,
  },
  error: null,
  lastFetchedAt: null,
  searchQuery: '',
});

export const crmCustomersSlice = createSlice({
  name: 'crmCustomers',
  initialState,
  reducers: {
    clearCrmCustomers: state => {
      crmCustomersAdapter.removeAll(state);
      state.pagination = {
        start: 0,
        end: -1,
        total: 0,
        hasMore: false,
        pageSize: CrmCustomersService.DEFAULT_PAGE_SIZE,
      };
      state.error = null;
      state.lastFetchedAt = null;
      state.searchQuery = '';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(crmCustomersActions.fetchCustomers.pending, (state, action) => {
        state.error = null;
        state.uiFlags.isLoading = false;
        state.uiFlags.isRefreshing = false;
        state.uiFlags.isLoadingMore = false;

        const arg = action.meta.arg;
        if (arg?.append) {
          state.uiFlags.isLoadingMore = true;
        } else if (arg?.refresh) {
          state.uiFlags.isRefreshing = true;
        } else {
          state.uiFlags.isLoading = true;
        }
      })
      .addCase(crmCustomersActions.fetchCustomers.fulfilled, (state, action) => {
        state.uiFlags.isLoading = false;
        state.uiFlags.isRefreshing = false;
        state.uiFlags.isLoadingMore = false;
        state.error = null;
        state.lastFetchedAt = new Date().toISOString();
        state.searchQuery = action.payload.search ?? state.searchQuery;
        state.pagination = action.payload.pagination;

        if (action.payload.append) {
          crmCustomersAdapter.upsertMany(state, action.payload.customers);
        } else {
          crmCustomersAdapter.setAll(state, action.payload.customers);
        }
      })
      .addCase(crmCustomersActions.fetchCustomers.rejected, (state, action) => {
        state.uiFlags.isLoading = false;
        state.uiFlags.isRefreshing = false;
        state.uiFlags.isLoadingMore = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Unknown error';
      });
  },
});

export const { clearCrmCustomers } = crmCustomersSlice.actions;
export const crmCustomersReducer = crmCustomersSlice.reducer;
export const crmCustomersAdapterSelectors = crmCustomersAdapter.getSelectors<{
  crmCustomers: CrmCustomersState;
}>(state => state.crmCustomers);
