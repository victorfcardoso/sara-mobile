import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

export type SortTypes = 'asc' | 'desc';
export type StatusFilter = 'all' | 'unread' | 'read';

export type FilterState = {
  sortOrder: SortTypes;
  statusFilter: StatusFilter;
};

export const defaultFilterState: FilterState = {
  sortOrder: 'desc',
  statusFilter: 'all',
};

const notificationFilterSlice = createSlice({
  name: 'notificationFilter',
  initialState: defaultFilterState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ key: SortTypes }>) => {
      state.sortOrder = action.payload.key;
    },
    setStatusFilter: (state, action: PayloadAction<StatusFilter>) => {
      state.statusFilter = action.payload;
    },
    resetFilters: state => {
      state.sortOrder = defaultFilterState.sortOrder;
      state.statusFilter = defaultFilterState.statusFilter;
    },
  },
});

export const { setFilters, setStatusFilter, resetFilters } = notificationFilterSlice.actions;

export const selectSortOrder = (state: RootState) => state.notificationFilter.sortOrder;
export const selectStatusFilter = (state: RootState) => state.notificationFilter.statusFilter;

export default notificationFilterSlice.reducer;
