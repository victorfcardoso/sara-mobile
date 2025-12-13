import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';

import { Icon } from '@/components-next/common/icon';
import { DoubleCheckIcon, InboxFilterIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { InboxFilters } from './InboxFilters';
import i18n from '@/i18n';
import { useRefsContext } from '@/context';
import { useAppSelector } from '@/hooks';
import { selectStatusFilter } from '@/store/notification/notificationFilterSlice';
import { selectNotificationsMetadata } from '@/store/notification/notificationSelectors';

type InboxHeaderProps = {
  markAllAsRead: () => void;
};

const SARA_COLORS = {
  primaryText: '#16273D',
  secondaryText: '#4B5D6E',
  accent: '#4CB6AC',
  border: '#E6E2DD',
};

export const InboxHeader = (props: InboxHeaderProps) => {
  const { markAllAsRead } = props;
  const { inboxFiltersSheetRef } = useRefsContext();
  const statusFilter = useAppSelector(selectStatusFilter);
  const { unreadCount } = useAppSelector(selectNotificationsMetadata);

  const handleToggleState = () => {
    inboxFiltersSheetRef.current?.present();
  };

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  // Check if filters are active (not default)
  const hasActiveFilters = statusFilter !== 'all';

  return (
    <Animated.View style={[tailwind.style('border-b-[1px]'), styles.container]}>
      <Animated.View
        style={[tailwind.style('flex flex-row justify-between items-center px-4 pt-2 pb-3')]}>
        {/* Mark all as read button */}
        <Animated.View style={tailwind.style('flex-1')}>
<Pressable
            hitSlop={16}
            onPress={markAllAsRead}
            style={({ pressed }) => tailwind.style(pressed && 'opacity-70')}>
            <Icon icon={<DoubleCheckIcon stroke={SARA_COLORS.accent} />} size={24} />
          </Pressable>
        </Animated.View>

        {/* Title with unread count */}
        <Animated.View style={tailwind.style('flex-1 flex-row items-center justify-center gap-2')}>
          <Animated.Text
style={[
              tailwind.style(
                'text-[17px] text-center leading-[17px] tracking-[0.32px] font-inter-medium-24',
              ),
              styles.titleText,
            ]}>
            {i18n.t('NOTIFICATION.INBOX')}
          </Animated.Text>
          {unreadCount > 0 && (
            <View style={tailwind.style('px-1.5 py-0.5 rounded-md bg-teal-100')}>
              <Animated.Text style={tailwind.style('text-xs font-inter-medium-24 text-teal-700')}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Animated.Text>
            </View>
          )}
        </Animated.View>

        {/* Filter button */}
        <Animated.View style={tailwind.style('flex-1 items-end')}>
<Pressable
            onPress={handleToggleState}
            hitSlop={16}
            style={({ pressed }) => tailwind.style('relative', pressed && 'opacity-70')}>
            <Icon icon={<InboxFilterIcon stroke={SARA_COLORS.accent} />} size={24} />
            {/* Active filter indicator dot */}
            {hasActiveFilters && (
              <View
                style={[
                  tailwind.style('absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full'),
                  { backgroundColor: SARA_COLORS.accent },
                ]}
              />
            )}
          </Pressable>
        </Animated.View>
      </Animated.View>
      <BottomSheetModal
        ref={inboxFiltersSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        animationConfigs={animationConfigs}
        enablePanDownToClose
        snapPoints={[320]}>
        <BottomSheetWrapper>
          <InboxFilters />
        </BottomSheetWrapper>
      </BottomSheetModal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomColor: SARA_COLORS.border,
  },
  titleText: {
    color: SARA_COLORS.primaryText,
  },
});
