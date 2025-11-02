import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { Button } from '@/components-next';
import { tailwind } from '@/theme';

const MFAScreen = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-white')}>
      <StatusBar translucent backgroundColor={tailwind.color('bg-white')} barStyle="dark-content" />
      <View style={tailwind.style('flex-1 justify-center px-6 gap-6')}>
        <Text style={tailwind.style('text-2xl font-inter-semibold-20 text-gray-950 text-center')}>
          Sara login now handles verification automatically.
        </Text>
        <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-700 text-center')}>
          If you reached this screen, return to the login page and sign in with your Sara email and
          password. Contact support if you continue to receive MFA prompts.
        </Text>
        <Button text="Return to Login" handlePress={handleGoBack} />
      </View>
    </SafeAreaView>
  );
};

export default MFAScreen;
