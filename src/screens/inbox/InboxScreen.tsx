import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, StatusBar, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  LinearTransition,
  runOnJS,
  SharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';

import { TAB_BAR_HEIGHT } from '@/constants';
import { InboxListStateProvider } from '@/context';
import type { Notification } from '@/types/Notification';
import { tailwind } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { notificationActions } from '@/store/notification/notificationAction';
import {
  selectIsAllNotificationsFetched,
  selectIsLoadingNotifications,
  getFilteredNotifications,
} from '@/store/notification/notificationSelectors';
import { InboxHeader, InboxItemContainer } from './components';
import { useInboxListStateContext } from '@/context';
import { resetNotifications } from '@/store/notification/notificationSlice';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';
import { selectSortOrder, selectStatusFilter } from '@/store/notification/notificationFilterSlice';
import { InboxSortTypes } from '@/store/notification/notificationTypes';
import { useSaraColors, useIsDarkMode } from '@/hooks/useSaraColors';

// Empty state icon (checkmark in circle)
const EmptyInboxIcon = ({ color }: { color: string }) => (
  <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <Circle cx="16" cy="16" r="14" stroke={color} strokeWidth="2.5" />
    <Path
      d="M10 16L14 20L22 12"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AnimatedFlashlist = Animated.createAnimatedComponent(FlashList<Notification>);

const InboxList = () => {
  const [pageNumber, setPageNumber] = useState(1);

  const [isFlashListReady, setFlashListReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const colors = useSaraColors();

  const isNotificationsLoading = useAppSelector(selectIsLoadingNotifications);
  const isAllNotificationsFetched = useAppSelector(selectIsAllNotificationsFetched);
  const sortOrder = useAppSelector(selectSortOrder);
  const statusFilter = useAppSelector(selectStatusFilter);

  const notifications = useAppSelector(state =>
    getFilteredNotifications(state, sortOrder, statusFilter),
  );

  const previousSortOrder = useRef(sortOrder);
  const previousStatusFilter = useRef(statusFilter);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (previousSortOrder.current !== sortOrder) {
      previousSortOrder.current = sortOrder;
      clearAndFetchNotifications(sortOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  useEffect(() => {
    // Status filter is client-side only, no need to refetch
    previousStatusFilter.current = statusFilter;
  }, [statusFilter]);

  // eslint-disable-next-line react/display-name
  const ListFooterComponent = React.memo(() => {
    if (isAllNotificationsFetched) return null;
    return (
      <Animated.View
        style={tailwind.style(
          'flex-1 items-center justify-center pt-8',
          `pb-[${TAB_BAR_HEIGHT}px]`,
        )}>
        {isAllNotificationsFetched ? null : (
          <ActivityIndicator size="small" color={colors.accent} />
        )}
      </Animated.View>
    );
  });

  const fetchNotifications = useCallback(
    (sortOrder: InboxSortTypes, page: number = 1) =>
      dispatch(notificationActions.fetchNotifications({ page, sort_order: sortOrder })),
    [dispatch],
  );

  const clearAndFetchNotifications = useCallback(
    (sortOrder: InboxSortTypes) => {
      setPageNumber(1);
      dispatch(resetNotifications());
      return fetchNotifications(sortOrder, 1);
    },
    [dispatch, fetchNotifications],
  );

  const refreshNotifications = useCallback(
    (sortOrder: InboxSortTypes) => {
      setPageNumber(1);
      fetchNotifications(sortOrder, 1);
    },
    [fetchNotifications],
  );

  useFocusEffect(
    useCallback(() => {
      refreshNotifications(sortOrder);
    }, [refreshNotifications, sortOrder]),
  );

  const onChangePageNumber = () => {
    const nextPageNumber = pageNumber + 1;
    setPageNumber(nextPageNumber);
    fetchNotifications(sortOrder, nextPageNumber);
  };

  const handleOnEndReached = () => {
    const shouldLoadMoreConversations =
      isFlashListReady && !isAllNotificationsFetched && !isNotificationsLoading;
    if (shouldLoadMoreConversations) {
      onChangePageNumber();
    }
  };

  const handleRefresh = useCallback(() => {
    setFlashListReady(false);
    setIsRefreshing(true);
    clearAndFetchNotifications(sortOrder).finally(() => {
      setIsRefreshing(false);
    });
  }, [clearAndFetchNotifications, sortOrder]);

  const { openedRowIndex } = useInboxListStateContext();

  const handleRender: ListRenderItem<Notification> = ({ item, index }) => {
    return (
      <InboxItemContainer
        item={item}
        index={index}
        openedRowIndex={openedRowIndex as SharedValue<number | null>}
      />
    );
  };

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      openedRowIndex.value = -1;
      if (!isFlashListReady) {
        runOnJS(setFlashListReady)(true);
      }
    },
  });

  const shouldShowEmptyLoader = isNotificationsLoading && notifications.length === 0;

  return shouldShowEmptyLoader ? (
    <Animated.View
      style={tailwind.style('flex-1 items-center justify-center', `pb-[${TAB_BAR_HEIGHT}px]`)}>
      <ActivityIndicator color={colors.accent} />
    </Animated.View>
  ) : notifications.length === 0 ? (
    <Animated.ScrollView
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      contentContainerStyle={tailwind.style(
        'flex-1 items-center justify-center px-4',
        `pb-[${TAB_BAR_HEIGHT}px]`,
      )}>
      {/* Icon container */}
      <View
        style={[
          tailwind.style('w-16 h-16 rounded-2xl items-center justify-center mb-4'),
          { backgroundColor: colors.accentLight },
        ]}>
        <EmptyInboxIcon color={colors.accent} />
      </View>
      {/* Title */}
      <Animated.Text
        style={[
          tailwind.style('text-lg font-inter-semibold-20 mb-1'),
          { color: colors.textPrimary },
        ]}>
        {i18n.t('NOTIFICATION.EMPTY_TITLE', { defaultValue: 'All caught up!' })}
      </Animated.Text>
      {/* Subtitle */}
      <Animated.Text
        style={[
          tailwind.style('text-base font-inter-normal-20 text-center'),
          { color: colors.textSecondary },
        ]}>
        {i18n.t('NOTIFICATION.EMPTY_SUBTITLE', {
          defaultValue: 'New bookings, payments, and messages will appear here.',
        })}
      </Animated.Text>
    </Animated.ScrollView>
  ) : (
    <AnimatedFlashlist
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      layout={LinearTransition.springify().damping(18).stiffness(120)}
      showsVerticalScrollIndicator={false}
      data={notifications}
      estimatedItemSize={120}
      onScroll={scrollHandler}
      onEndReached={handleOnEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooterComponent}
      renderItem={handleRender}
      contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}
    />
  );
};

const InboxScreen = () => {
  const dispatch = useAppDispatch();
  const colors = useSaraColors();
  const isDark = useIsDarkMode();

  // Memoize the markAllAsRead callback
  const markAllAsRead = useCallback(async () => {
    await dispatch(notificationActions.markAllAsRead());
    showToast({
      message: i18n.t('NOTIFICATION.ALERTS.MARK_ALL_READ'),
    });
  }, [dispatch]);

  return (
    <SafeAreaView
      edges={['top']}
      style={[tailwind.style('flex-1'), { backgroundColor: colors.background }]}>
      <StatusBar
        translucent
        backgroundColor={colors.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <InboxListStateProvider>
        <InboxHeader markAllAsRead={markAllAsRead} />
        <InboxList />
      </InboxListStateProvider>
    </SafeAreaView>
  );
};

export default InboxScreen;
