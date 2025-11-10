import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingsScreen from '@/screens/settings/SettingsScreen';
import OfficeHoursScreen from '@/screens/settings/OfficeHoursScreen';
import AgentProfileScreen from '@/screens/settings/AgentProfileScreen';
import ServiceCatalogScreen from '@/screens/settings/ServiceCatalogScreen';
import { FaqScreen } from '@/screens/settings/FaqScreen';
import { FaqEditorScreen } from '@/screens/settings/FaqEditorScreen';

export type SettingsStackParamList = {
  SettingsScreen: undefined;
  OfficeHoursScreen: undefined;
  AgentProfileScreen: undefined;
  ServiceCatalogScreen: undefined;
  FaqScreen: undefined;
  FaqEditorScreen: { faqId?: string } | undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsStack = () => {
  return (
    <Stack.Navigator initialRouteName="SettingsScreen">
      <Stack.Screen
        options={{ headerShown: false }}
        name="SettingsScreen"
        component={SettingsScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="OfficeHoursScreen"
        component={OfficeHoursScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="AgentProfileScreen"
        component={AgentProfileScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="ServiceCatalogScreen"
        component={ServiceCatalogScreen}
      />
      <Stack.Screen options={{ headerShown: false }} name="FaqScreen" component={FaqScreen} />
      <Stack.Screen
        options={{ headerShown: false }}
        name="FaqEditorScreen"
        component={FaqEditorScreen}
      />
    </Stack.Navigator>
  );
};
