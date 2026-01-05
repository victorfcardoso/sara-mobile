import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppointmentsScreen from '@/screens/appointments/AppointmentsScreen';

export type AppointmentsStackParamList = {
  AppointmentsScreen: undefined;
  // AppointmentDetail route for deep linking (sara://appointment/:appointmentId)
  // The detail view is handled as a bottom sheet in AppointmentsScreen,
  // but this route allows deep links to navigate with the appointmentId param
  AppointmentDetail: { appointmentId: string };
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
      {/* AppointmentDetail navigates to AppointmentsScreen with the appointmentId
          to open the detail bottom sheet automatically */}
      <Stack.Screen
        options={{ headerShown: false }}
        name="AppointmentDetail"
        component={AppointmentsScreen}
      />
    </Stack.Navigator>
  );
};
