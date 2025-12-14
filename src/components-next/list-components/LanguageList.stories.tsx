import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { LanguageList } from './LanguageList';

const meta = {
  title: 'LanguageList',
  component: LanguageList,
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: '#F8F5F3',
        }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof LanguageList>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default language selection (English)
export const EnglishSelected: Story = {
  args: {
    currentLanguage: 'en',
    onChangeLanguage: (locale: string) => {
      console.log('Language changed to:', locale);
    },
  },
};

// Portuguese (Brazil) selected - relevant for Sara
export const PortugueseBRSelected: Story = {
  args: {
    currentLanguage: 'pt_BR',
    onChangeLanguage: (locale: string) => {
      console.log('Language changed to:', locale);
    },
  },
};

// Spanish selected
export const SpanishSelected: Story = {
  args: {
    currentLanguage: 'es',
    onChangeLanguage: (locale: string) => {
      console.log('Language changed to:', locale);
    },
  },
};

// French selected
export const FrenchSelected: Story = {
  args: {
    currentLanguage: 'fr',
    onChangeLanguage: (locale: string) => {
      console.log('Language changed to:', locale);
    },
  },
};

// German selected
export const GermanSelected: Story = {
  args: {
    currentLanguage: 'de',
    onChangeLanguage: (locale: string) => {
      console.log('Language changed to:', locale);
    },
  },
};

// Interactive language selector
export const InteractiveSelector: Story = {
  render: () => {
    const [currentLanguage, setCurrentLanguage] = useState('en');

    return (
      <View>
        <View
          style={{
            padding: 12,
            backgroundColor: '#4CB6AC',
            borderRadius: 8,
            marginBottom: 16,
          }}>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}>
            Current Language: {currentLanguage}
          </Text>
        </View>
        <LanguageList currentLanguage={currentLanguage} onChangeLanguage={setCurrentLanguage} />
      </View>
    );
  },
};

// In settings screen context
export const InSettingsContext: Story = {
  render: () => {
    const [currentLanguage, setCurrentLanguage] = useState('pt_BR');

    return (
      <View style={{ backgroundColor: '#F8F5F3', padding: 0 }}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 13,
            overflow: 'hidden',
            shadowColor: '#00000040',
            shadowOffset: { width: 0, height: 0.15 },
            shadowRadius: 2,
            shadowOpacity: 0.35,
          }}>
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#E6E2DD',
            }}>
            <Text style={{ color: '#16273D', fontSize: 16, fontWeight: '600' }}>
              Language Settings
            </Text>
            <Text style={{ color: '#6C778A', fontSize: 12, marginTop: 4 }}>
              Select your preferred language
            </Text>
          </View>
          <LanguageList currentLanguage={currentLanguage} onChangeLanguage={setCurrentLanguage} />
        </View>
      </View>
    );
  },
};

// Common languages for Sara (Brazil focus)
export const SaraCommonLanguages: Story = {
  args: {
    currentLanguage: 'pt_BR',
    onChangeLanguage: (locale: string) => {
      console.log('Sara language changed to:', locale);
    },
  },
};
