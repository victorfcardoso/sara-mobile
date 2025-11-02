import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppointmentsScreen from '@/screens/appointments/AppointmentsScreen';

export type AppointmentsStackParamList = {
  AppointmentsScreen: undefined;
};

const Stack = createNativeStackNavigator<AppointmentsStackParamList>();

export const AppointmentsStack = () => {
  return (
    <Stack.Navigator initialRouteName="AppointmentsScreen">
      <Stack.Screen
        options={{ headerShown: false }}
        name="AppointmentsScreen"
        component={AppointmentsScreen}
      />
    </Stack.Navigator>
  );
};
