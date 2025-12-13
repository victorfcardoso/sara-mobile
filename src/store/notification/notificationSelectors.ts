import { createDraftSafeSelector, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { notificationsAdapter } from './notificationSlice';
import { SortTypes, StatusFilter } from './notificationFilterSlice';
import { Notification } from '@/types/Notification';
export const selectNotificationsState = (state: RootState) => state.notifications;

export const {
  selectAll: selectAllNotifications,
  selectById: selectNotificationById,
  selectIds: selectNotificationIds,
} = notificationsAdapter.getSelectors<RootState>(selectNotificationsState);

export const selectNotificationsMetadata = createSelector(selectNotificationsState, state => ({
  unreadCount: state.unreadCount,
  totalCount: state.totalCount,
  currentPage: state.currentPage,
  isLoading: state.uiFlags.isLoading,
  error: state.error,
}));

export const selectUnreadNotifications = createSelector(selectAllNotifications, notifications =>
  notifications.filter(notification => !notification.readAt),
);

export const selectIsLoadingNotifications = createSelector(
  selectNotificationsState,
  state => state.uiFlags.isLoading,
);

export const selectNotificationsError = createSelector(
  selectNotificationsState,
  state => state.error,
);

export const selectNotificationsCurrentPage = createSelector(
  selectNotificationsState,
  state => state.currentPage,
);

export const selectIsAllNotificationsFetched = createSelector(
  selectNotificationsState,
  state => state.uiFlags.isAllNotificationsFetched,
);

export const getFilteredNotifications = createDraftSafeSelector(
  [
    selectAllNotifications,
    (_, sortOrder: SortTypes) => sortOrder,
    (_, _sortOrder: SortTypes, statusFilter: StatusFilter) => statusFilter,
  ],
  (notifications, sortOrder, statusFilter) => {
    // Filter by status
    let filtered = notifications;
    if (statusFilter === 'unread') {
      filtered = notifications.filter(n => !n.readAt);
    } else if (statusFilter === 'read') {
      filtered = notifications.filter(n => !!n.readAt);
    }

    // Sort
    type SortComparator = {
      asc: (a: Notification, b: Notification) => number;
      desc: (a: Notification, b: Notification) => number;
    };
    const comparator: SortComparator = {
      asc: (a, b) => a.createdAt - b.createdAt,
      desc: (a, b) => b.createdAt - a.createdAt,
    };
    return [...filtered].sort(comparator[sortOrder]);
  },
);
