import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Theme } from '@/types/common/Theme';
import { TickIcon, SunIcon, MoonIcon, MonitorIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useSaraColors } from '@/hooks/useSaraColors';
import { useHaptic } from '@/utils';
import { Icon } from '@/components-next/common';
import i18n from 'i18n';

export type ThemeItemType = {
  title: string;
  key: Theme;
  icon: React.ReactNode;
};

type ThemeCellProps = {
  item: ThemeItemType;
  currentTheme: Theme;
  onChangeTheme: (theme: Theme) => void;
  isLastItem: boolean;
  colors: ReturnType<typeof useSaraColors>;
};

const getThemeOptions = (): ThemeItemType[] => [
  {
    title: i18n.t('SETTINGS.THEME_LIGHT'),
    key: 'light',
    icon: <SunIcon />,
  },
  {
    title: i18n.t('SETTINGS.THEME_DARK'),
    key: 'dark',
    icon: <MoonIcon />,
  },
  {
    title: i18n.t('SETTINGS.THEME_SYSTEM'),
    key: 'system',
    icon: <MonitorIcon />,
  },
];

const ThemeCell = (props: ThemeCellProps) => {
  const { item, currentTheme, onChangeTheme, isLastItem, colors } = props;
  const hapticSelection = useHaptic();

  const handlePress = () => {
    hapticSelection?.();
    onChangeTheme(item.key);
  };

  const isSelected = currentTheme === item.key;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View style={tailwind.style('pl-3')}>
          <Icon icon={item.icon} size={20} />
        </Animated.View>
        <Animated.View
          style={[
            tailwind.style(
              'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
              !isLastItem && 'border-b-[1px]',
            ),
            !isLastItem && { borderColor: colors.border },
          ]}>
          <Animated.Text
            style={[
              tailwind.style('text-base font-inter-420-20 leading-[21px] tracking-[0.16px]'),
              { color: colors.textPrimary },
            ]}>
            {item.title}
          </Animated.Text>
          {isSelected && <Icon icon={<TickIcon />} size={20} />}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

type ThemeListProps = {
  currentTheme: Theme;
  onChangeTheme: (theme: Theme) => void;
};

export const ThemeList = ({ currentTheme, onChangeTheme }: ThemeListProps) => {
  const themeOptions = getThemeOptions();
  const colors = useSaraColors();

  return (
    <Animated.View style={tailwind.style('pt-1 pb-4')}>
      {themeOptions.map((item, index) => {
        return (
          <ThemeCell
            key={item.key}
            item={item}
            currentTheme={currentTheme}
            onChangeTheme={onChangeTheme}
            isLastItem={index === themeOptions.length - 1}
            colors={colors}
          />
        );
      })}
    </Animated.View>
  );
};
