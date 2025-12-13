import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Use the inbox screen which fetches from both Chatwoot and Sara APIs
import InboxScreen from '@/screens/inbox/InboxScreen';

export type NotificationsStackParamList = {
  NotificationsScreen: undefined;
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
    </Stack.Navigator>
  );
};

