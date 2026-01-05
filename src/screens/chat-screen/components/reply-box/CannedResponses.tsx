import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { selectAllCannedResponses } from '@/store/canned-response/cannedResponseSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useSaraColors } from '@/hooks/useSaraColors';
import { cannedResponseActions } from '@/store/canned-response/cannedResponseActions';
import { CannedResponse } from '@/types';
import { FlashList } from '@shopify/flash-list';
import type { SaraColors } from '@/hooks/useSaraColors';

type CannedResponsesProps = {
  searchKey: string;
  onSelect: (cannedResponse: CannedResponse) => void;
};

const CannedResponseItem = ({
  item,
  onSelect,
  colors,
}: {
  item: CannedResponse;
  onSelect: (cannedResponse: CannedResponse) => void;
  colors: SaraColors;
}) => {
  return (
    <Pressable
      onPress={() => onSelect(item)}
      style={[
        tailwind.style('w-full flex-row justify-between items-center py-3 px-4'),
        { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}>
      <Animated.Text numberOfLines={1} style={[tailwind.style('text-md flex-1'), { color: colors.textPrimary }]}>
        {item.content.replace(/\n/g, ' ')}
      </Animated.Text>
      <Animated.Text style={[tailwind.style('text-sm ml-2'), { color: colors.textSecondary }]}>
        {`/${item.shortCode}`}
      </Animated.Text>
    </Pressable>
  );
};

export const CannedResponses = (props: CannedResponsesProps) => {
  const dispatch = useAppDispatch();
  const cannedResponses = useAppSelector(selectAllCannedResponses);
  const colors = useSaraColors();

  useEffect(() => {
    const searchKey = props.searchKey.slice(1);
    dispatch(cannedResponseActions.index({ searchKey }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.searchKey]);

  if (!props.searchKey || cannedResponses.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        tailwind.style('left-0 right-0 max-h-[180px] relative bottom-0 h-[180px]'),
        { backgroundColor: colors.backgroundLight, borderTopWidth: 1, borderTopColor: colors.border },
      ]}>
      <FlashList
        data={cannedResponses}
        renderItem={({ item }) => <CannedResponseItem item={item} onSelect={props.onSelect} colors={colors} />}
        keyExtractor={item => item.id.toString()}
        keyboardShouldPersistTaps="always"
      />
    </Animated.View>
  );
};
