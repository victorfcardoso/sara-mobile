import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ContactsScreen } from '@/screens/contacts/ContactsScreen';
import { CrmContactDetailsScreen } from '@/screens/contacts/CrmContactDetailsScreen';

export type ContactsStackParamList = {
  ContactsScreen: undefined;
  ContactDetailsScreen: {
    contactId: string;
  };
};

const Stack = createNativeStackNavigator<ContactsStackParamList>();

export const ContactsStack = () => {
  return (
    <Stack.Navigator initialRouteName="ContactsScreen">
      <Stack.Screen
        name="ContactsScreen"
        component={ContactsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContactDetailsScreen"
        component={CrmContactDetailsScreen}
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};
