import React from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '@/context';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { BottomSheetHeader, Icon } from '@/components-next';
import i18n from '@/i18n';
import { InboxSortTypes, InboxSortOptions } from '@/store/notification/notificationTypes';
import {
  selectSortOrder,
  setFilters,
  selectStatusFilter,
  setStatusFilter,
  StatusFilter,
} from '@/store/notification/notificationFilterSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';

type SortByCellProps = {
  value: string;
  index: number;
  onChange: (value: InboxSortTypes) => void;
  sortOrder: InboxSortTypes;
  isLast: boolean;
};

type StatusCellProps = {
  value: StatusFilter;
  label: string;
  index: number;
  onChange: (value: StatusFilter) => void;
  statusFilter: StatusFilter;
  isLast: boolean;
};

const sortByList = Object.keys(InboxSortOptions) as InboxSortTypes[];
const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

const SortByCell = (props: SortByCellProps) => {
  const { value, sortOrder, onChange, isLast } = props;

  const hapticSelection = useHaptic();

  const handlePreferredSortPress = () => {
    hapticSelection?.();
    onChange(value as InboxSortTypes);
  };

  return (
    <Pressable
      onPress={handlePreferredSortPress}
      style={tailwind.style('flex flex-row items-center')}>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          !isLast && 'border-b-[1px] border-blackA-A3',
        )}>
        <Animated.Text
          style={tailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
          )}>
          {i18n.t(`NOTIFICATION.FILTERS.SORT_BY.OPTIONS.${value.toUpperCase()}`)}
        </Animated.Text>
        {sortOrder === value ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

const StatusCell = (props: StatusCellProps) => {
  const { value, label, statusFilter, onChange, isLast } = props;

  const hapticSelection = useHaptic();

  const handleStatusPress = () => {
    hapticSelection?.();
    onChange(value);
  };

  return (
    <Pressable onPress={handleStatusPress} style={tailwind.style('flex flex-row items-center')}>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          !isLast && 'border-b-[1px] border-blackA-A3',
        )}>
        <Animated.Text
          style={tailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
          )}>
          {label}
        </Animated.Text>
        {statusFilter === value ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

export const InboxFilters = () => {
  const sortOrder = useAppSelector(selectSortOrder);
  const statusFilter = useAppSelector(selectStatusFilter);
  const dispatch = useAppDispatch();
  const { inboxFiltersSheetRef } = useRefsContext();

  const handleChangeFilters = (value: InboxSortTypes) => {
    dispatch(setFilters({ key: value }));
    setTimeout(() => inboxFiltersSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  const handleChangeStatus = (value: StatusFilter) => {
    dispatch(setStatusFilter(value));
    setTimeout(() => inboxFiltersSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  return (
    <Animated.View>
      {/* Status Filter Section */}
      <BottomSheetHeader headerText={i18n.t('NOTIFICATION.FILTERS.STATUS.TITLE', { defaultValue: 'Status' })} />
      <Animated.View style={tailwind.style('py-1 pl-3')}>
        {statusOptions.map((option, index) => (
          <StatusCell
            key={option.value}
            value={option.value}
            label={option.label}
            index={index}
            statusFilter={statusFilter}
            onChange={handleChangeStatus}
            isLast={index === statusOptions.length - 1}
          />
        ))}
      </Animated.View>

      {/* Divider */}
      <View style={tailwind.style('h-2 bg-gray-50')} />

      {/* Sort By Section */}
      <BottomSheetHeader headerText={i18n.t('CONVERSATION.FILTERS.SORT_BY.TITLE')} />
      <Animated.View style={tailwind.style('py-1 pl-3')}>
        {sortByList.map((value, index) => (
          <SortByCell
            key={index}
            value={value}
            index={index}
            sortOrder={sortOrder}
            onChange={handleChangeFilters}
            isLast={index === sortByList.length - 1}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
};
