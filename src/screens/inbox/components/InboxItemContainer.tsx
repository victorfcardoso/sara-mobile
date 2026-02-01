/* eslint-disable react/display-name */
import React, { useCallback } from 'react';
import { SharedValue } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import { notificationActions } from '@/store/notification/notificationAction';
import { useAppDispatch } from '@/hooks';
import type { Notification } from '@/types/Notification';
import type { MarkAsReadPayload } from '@/store/notification/notificationTypes';
import { MarkAsRead, MarkAsUnRead, DeleteIcon } from '@/svg-icons';
import { InboxItem } from './InboxItem';
import { formatRelativeTime } from '@/utils/dateTimeUtils';
import { formatTimeToShortForm } from '@/utils/dateTimeUtils';
import { tailwind } from '@/theme';
import { Icon, Swipeable } from '@/components-next';
import i18n from '@/i18n';
import { showToast } from '@/utils/toastUtils';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NotificationsStackParamList } from '@/navigation/stack/NotificationsStack';

type InboxItemContainerProps = {
  item: Notification;
  index: number;
  openedRowIndex: SharedValue<number | null>;
};

const UnreadComponent = React.memo(() => {
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center')}>
      <Icon icon={<MarkAsRead />} size={24} />
    </Animated.View>
  );
});

const ReadComponent = React.memo(() => {
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center')}>
      <Icon icon={<MarkAsUnRead />} size={24} />
    </Animated.View>
  );
});

const DeleteComponent = React.memo(() => {
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center')}>
      <Icon icon={<DeleteIcon />} size={24} />
      <Animated.Text style={tailwind.style('text-sm font-inter-420-20 pt-[3px] text-white')}>
        {i18n.t('NOTIFICATION.DELETE')}
      </Animated.Text>
    </Animated.View>
  );
});

export const InboxItemContainerComponent = (props: InboxItemContainerProps) => {
  const { index, item, openedRowIndex } = props;
  const dispatch = useAppDispatch();

  const navigation = useNavigation<NativeStackNavigationProp<NotificationsStackParamList>>();
  const isRead = !!item.readAt;

  const onPressAction = async () => {
    // Navigate to notification detail screen
    navigation.navigate('NotificationDetail', { notificationId: item.id });
  };

  const markNotificationAsRead = useCallback(
    async ({ shouldShowToast = true } = {}) => {
      const payload: MarkAsReadPayload = {
        primaryActorId: item.primaryActorId,
        primaryActorType: item.primaryActorType,
        notifUlid: item.notifUlid, // Pass Sara ULID for proper API routing
      };
      await dispatch(notificationActions.markAsRead(payload));
      if (shouldShowToast) {
        showToast({ message: i18n.t('NOTIFICATION.ALERTS.MARK_AS_READ') });
      }
    },
    [dispatch, item.primaryActorId, item.primaryActorType, item.notifUlid],
  );

  const markNotificationAsUnread = async () => {
    await dispatch(notificationActions.markAsUnread(item.id));
    showToast({
      message: i18n.t('NOTIFICATION.ALERTS.MARK_AS_UNREAD'),
    });
  };

  const onSwipeRightAction = async () => {
    await dispatch(notificationActions.delete(item.id));
    showToast({
      message: i18n.t('NOTIFICATION.ALERTS.DELETE'),
    });
  };

  const onSwipeLeftAction = () => {
    if (isRead) {
      markNotificationAsUnread();
    } else {
      markNotificationAsRead();
    }
  };

  const lastActivityAt = useCallback(() => {
    const time = formatRelativeTime(item.lastActivityAt);
    return formatTimeToShortForm(time, true);
  }, [item.lastActivityAt]);

  const notificationType = item.notificationType;
  const pushTitle = i18n.t(`NOTIFICATION.TYPES.${notificationType.toUpperCase()}`, {
    defaultValue: item.pushMessageTitle,
  });

  return (
    <Swipeable
      spacing={27}
      leftElement={isRead ? <ReadComponent /> : <UnreadComponent />}
      rightElement={<DeleteComponent />}
      handleLeftElementPress={onSwipeLeftAction}
      handleOnLeftOverswiped={onSwipeLeftAction}
      handleRightElementPress={onSwipeRightAction}
      handleOnRightOverswiped={onSwipeRightAction}
      handlePress={onPressAction}
      triggerOverswipeOnFlick
      rightElementBgColor="bg-ruby-800"
      {...{ index, openedRowIndex }}>
      <InboxItem
        isRead={isRead}
        lastActivityAt={lastActivityAt}
        pushMessageTitle={pushTitle}
        notificationType={notificationType}
        payload={item.payload}
        onActionComplete={() => markNotificationAsRead({ shouldShowToast: false })}
      />
    </Swipeable>
  );
};

InboxItemContainerComponent.displayName = 'InboxItemContainer';
export const InboxItemContainer = React.memo(InboxItemContainerComponent);
