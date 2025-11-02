import React from 'react';
import Animated from 'react-native-reanimated';
import { Avatar } from '@/components-next';
import { tailwind } from '@/theme';
import type { NotificationType } from '@/types/Notification';
import { ConversationPriority } from '@/types/common';
import { AnimatedNativeView, NativeView } from '@/components-next/native-components';
import { PriorityIndicator, ChannelIndicator } from '@/components-next/list-components';

import { Inbox } from '@/types/Inbox';
import { ConversationAdditionalAttributes } from '@/types/Conversation';
import { NotificationTypeIndicator } from './NotificationTypeIndicator';
import { Dimensions, StyleSheet } from 'react-native';

const SARA_COLORS = {
  primaryText: '#16273D',
  secondaryText: '#4B5D6E',
  metaText: '#6C778A',
  divider: '#E6E2DD',
  readOverlay: 'rgba(248, 245, 243, 0.65)',
};

type InboxItemProps = {
  isRead: boolean;
  conversationId: number;
  sender: {
    name: string;
    thumbnail: string;
  };
  assignee: {
    name: string;
    thumbnail: string;
  };
  lastActivityAt: () => string;
  priority?: ConversationPriority | null;
  inbox: Inbox | null;
  additionalAttributes: ConversationAdditionalAttributes;
  pushMessageTitle: string;
  notificationType: NotificationType;
};

const { width } = Dimensions.get('screen');

export const InboxItemComponent = (props: InboxItemProps) => {
  const {
    isRead,
    inbox,
    assignee,
    conversationId,
    sender,
    lastActivityAt,
    priority,
    additionalAttributes,
    pushMessageTitle,
    notificationType,
  } = props;

  const hasAssignee = assignee?.name || assignee?.thumbnail;

  return (
    <Animated.View style={[tailwind.style('ml-3 py-3 pr-4 border-b-[1px]'), styles.divider]}>
      <Animated.View>
        <AnimatedNativeView
          style={tailwind.style('flex flex-row justify-between items-center h-[24px]')}>
          <AnimatedNativeView
            style={tailwind.style('flex flex-row items-center h-[24px] gap-[5px]')}>
            <Animated.Text
              numberOfLines={1}
              style={[
                tailwind.style(
                  'text-base font-inter-medium-24 tracking-[0.24px] capitalize',
                  `max-w-[${width - 250}px]`,
                ),
                styles.primaryText,
              ]}>
              {sender.name || ''}
            </Animated.Text>
            <NativeView style={tailwind.style('flex flex-row items-center gap-0.5')}>
              <Animated.Text style={[tailwind.style('text-sm font-inter-420-20'), styles.metaText]}>
                #
              </Animated.Text>
              <Animated.Text style={[tailwind.style('text-sm font-inter-420-20'), styles.metaText]}>
                {conversationId}
              </Animated.Text>
            </NativeView>
          </AnimatedNativeView>
          <AnimatedNativeView style={tailwind.style('flex flex-row items-center gap-2')}>
            {priority ? <PriorityIndicator {...{ priority }} /> : null}
            {inbox && (
              <ChannelIndicator inbox={inbox} additionalAttributes={additionalAttributes} />
            )}
            <NativeView>
              <Animated.Text
                style={[
                  tailwind.style('text-sm font-inter-420-20 leading-[16px] tracking-[0.32px]'),
                  styles.metaText,
                ]}>
                {lastActivityAt()}
              </Animated.Text>
            </NativeView>
          </AnimatedNativeView>
        </AnimatedNativeView>

        <Animated.View style={tailwind.style('flex flex-row justify-between mt-1.5')}>
          <Animated.View style={tailwind.style('flex flex-row items-center gap-1.5 flex-1')}>
            {hasAssignee && (
              <Avatar
                src={assignee.thumbnail ? { uri: assignee.thumbnail } : undefined}
                size="md"
                name={assignee?.name || ''}
              />
            )}

            <Animated.Text
              style={[
                tailwind.style(
                  'font-inter-420-20 text-md leading-[17px] tracking-[0.32px] flex-shrink',
                ),
                styles.secondaryText,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {pushMessageTitle}
            </Animated.Text>
          </Animated.View>
          <NotificationTypeIndicator type={notificationType} />
        </Animated.View>
      </Animated.View>
      {isRead && (
        <Animated.View style={[tailwind.style('absolute inset-0 z-20'), styles.readOverlay]} />
      )}
    </Animated.View>
  );
};

InboxItemComponent.displayName = 'InboxItem';
export const InboxItem = React.memo(InboxItemComponent);

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: SARA_COLORS.divider,
  },
  primaryText: {
    color: SARA_COLORS.primaryText,
  },
  secondaryText: {
    color: SARA_COLORS.secondaryText,
  },
  metaText: {
    color: SARA_COLORS.metaText,
  },
  readOverlay: {
    backgroundColor: SARA_COLORS.readOverlay,
  },
});
