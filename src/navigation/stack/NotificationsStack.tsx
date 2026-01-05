import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Use the inbox screen which fetches from both Chatwoot and Sara APIs
import InboxScreen from '@/screens/inbox/InboxScreen';
import NotificationDetailScreen from '@/screens/inbox/NotificationDetailScreen';

export type NotificationsStackParamList = {
  NotificationsScreen: undefined;
  NotificationDetail: { notificationId: number };
};

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

export const NotificationsStack = () => {
  return (
    <Stack.Navigator initialRouteName="NotificationsScreen">
      <Stack.Screen
        name="NotificationsScreen"
        component={InboxScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotificationDetail"
        component={NotificationDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
