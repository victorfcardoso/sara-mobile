import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';

export type NotificationsStackParamList = {
  NotificationsScreen: undefined;
};

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

export const NotificationsStack = () => {
  return (
    <Stack.Navigator initialRouteName="NotificationsScreen">
      <Stack.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

