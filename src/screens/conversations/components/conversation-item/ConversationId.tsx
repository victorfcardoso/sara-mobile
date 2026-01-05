import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import { useSaraColors } from '@/hooks/useSaraColors';

type ConversationIdProps = {
  id: number;
};

export const ConversationId = (props: ConversationIdProps) => {
  const { id } = props;
  const colors = useSaraColors();
  return (
    <NativeView style={tailwind.style('flex flex-row items-center gap-0.5')}>
      <Text style={[tailwind.style('text-sm font-inter-420-20'), { color: colors.textMeta }]}>#</Text>
      <Text style={[tailwind.style('text-sm font-inter-420-20'), { color: colors.textMeta }]}>{id}</Text>
    </NativeView>
  );
};

ConversationId.displayName = 'ConversationId';
