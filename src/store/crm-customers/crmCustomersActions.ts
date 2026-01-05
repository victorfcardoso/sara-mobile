import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@/store';

import {
  FetchCrmCustomersArgs,
  FetchCrmCustomersResult,
  CrmCustomersPagination,
} from './crmCustomersTypes';
import { CrmCustomersService } from './crmCustomersService';

const deriveNextSearch = (current: string, incoming?: string): string => {
  if (incoming === undefined || incoming === null) {
    return current;
  }
  return incoming.trim();
};

const buildPagination = (
  start: number,
  end: number,
  total: number,
  pageSize: number,
): CrmCustomersPagination => {
  const safeStart = Number.isFinite(start) ? start : 0;
  const safeEnd = Number.isFinite(end) ? end : safeStart - 1;
  const safeTotal = Number.isFinite(total) ? total : Math.max(safeEnd + 1, 0);
  const boundedEnd = safeEnd < safeStart ? safeStart - 1 : safeEnd;

  return {
    start: safeStart,
    end: boundedEnd,
    total: safeTotal,
    hasMore: boundedEnd >= 0 && boundedEnd < safeTotal - 1,
    pageSize,
  };
};

export const crmCustomersActions = {
  fetchCustomers: createAsyncThunk<
    FetchCrmCustomersResult,
    FetchCrmCustomersArgs | undefined,
    { rejectValue: string; state: RootState }
  >('crmCustomers/fetchCustomers', async (args, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const sliceState = state.crmCustomers;

      const previousSearch = sliceState?.searchQuery ?? '';
      const nextSearch = deriveNextSearch(previousSearch, args?.search);
      const searchChanged = nextSearch !== previousSearch;

      const pageSize =
        args?.limit ?? sliceState?.pagination?.pageSize ?? CrmCustomersService.DEFAULT_PAGE_SIZE;
      const shouldReset = Boolean(args?.refresh || searchChanged || !sliceState?.ids?.length);

      const baseOffset = shouldReset ? 0 : (sliceState?.pagination?.end ?? -1) + 1;
      const offset = args?.append && !shouldReset ? Math.max(baseOffset, 0) : 0;

      const apiResult = await CrmCustomersService.fetchCustomers({
        offset,
        limit: pageSize,
        search: nextSearch.length > 0 ? nextSearch : undefined,
      });

      const pagination = buildPagination(apiResult.start, apiResult.end, apiResult.total, pageSize);

      return {
        customers: apiResult.customers,
        pagination,
        search: nextSearch,
        append: !shouldReset && Boolean(args?.append),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load contacts';
      return rejectWithValue(message);
    }
  }),
};
