import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { Icon } from '@/components-next/common';
import { CheckedIcon, CloseIcon, FilterIcon, UncheckedIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { useScaleAnimation } from '@/utils';
import { useHeaderAnimation } from '@/hooks/useHeaderAnimation';
import { useSaraColors, SaraColors } from '@/hooks/useSaraColors';

type HeaderState = 'Search' | 'Filter' | 'Select' | 'none';

type ConversationHeaderPresenterProps = {
  currentState: HeaderState;
  isSelectedAll: boolean;
  filtersAppliedCount: number;
  onLeftIconPress: () => void;
  onRightIconPress: () => void;
  onClearFilter: () => void;
};

type LeftSectionProps = {
  currentState: HeaderState;
  isSelectedAll: boolean;
  onLeftIconPress: () => void;
  colors: SaraColors;
};

type FilterSectionProps = {
  filtersAppliedCount: number;
  onClearFilter: () => void;
  handlers: Record<string, unknown>;
  animatedStyle: ViewStyle | AnimatedStyle<ViewStyle>;
  colors: SaraColors;
};

type RightSectionProps = {
  currentState: HeaderState;
  filtersAppliedCount: number;
  onRightIconPress: () => void;
  colors: SaraColors;
};

const HeaderTitle = ({ colors }: { colors: SaraColors }) => (
  <Animated.View style={tailwind.style('flex-1')}>
    <Text
      style={[
        tailwind.style('text-[17px] font-inter-medium-24 tracking-[0.32px] leading-[17px] text-center'),
        { color: colors.textPrimary },
      ]}>
      {i18n.t('CONVERSATION.HEADER.TITLE')}
    </Text>
  </Animated.View>
);

const LeftSection = ({ currentState, isSelectedAll, onLeftIconPress, colors }: LeftSectionProps) => {
  const { entering, exiting } = useHeaderAnimation();

  if (currentState === 'Filter' || currentState === 'Search') return null;
  if (currentState !== 'Select') {
    return (
      <Animated.View style={tailwind.style('flex-1 items-start')}>
        <Pressable hitSlop={16}>
          <Animated.View exiting={exiting} entering={entering} />
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={tailwind.style('flex-1 items-start')}>
      <Pressable onPress={onLeftIconPress} hitSlop={16}>
        <Animated.View exiting={exiting} entering={entering}>
          <Icon
            size={24}
            icon={isSelectedAll ? <CheckedIcon /> : <UncheckedIcon stroke={colors.textMeta} />}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const FilterSection = ({
  filtersAppliedCount,
  onClearFilter,
  handlers,
  animatedStyle,
  colors,
}: FilterSectionProps) => {
  const { entering, exiting } = useHeaderAnimation();

  return (
    <Animated.View
      style={[tailwind.style('flex-1'), animatedStyle]}
      exiting={exiting}
      entering={entering}>
      <Pressable onPress={onClearFilter} disabled={filtersAppliedCount === 0} {...handlers}>
        <Text
          style={[
            tailwind.style('text-md font-inter-medium-24 leading-[17px] tracking-[0.24px]'),
            { color: filtersAppliedCount === 0 ? colors.textMeta : colors.accent },
          ]}>
          {i18n.t('CONVERSATION.HEADER.CLEAR_FILTER')}
          {filtersAppliedCount > 0 ? ` (${filtersAppliedCount})` : ''}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const RightSection = ({
  currentState,
  filtersAppliedCount,
  onRightIconPress,
  colors,
}: RightSectionProps) => {
  const { entering, exiting } = useHeaderAnimation();

  return (
    <Animated.View style={tailwind.style('flex-1 items-end')}>
      <Pressable onPress={onRightIconPress} hitSlop={16}>
        {currentState === 'Filter' || currentState === 'Select' ? (
          <Animated.View exiting={exiting} entering={entering}>
            <Icon size={24} icon={<CloseIcon stroke={colors.textPrimary} />} />
          </Animated.View>
        ) : (
          <Animated.View exiting={exiting} entering={entering}>
            {filtersAppliedCount > 0 && (
              <Animated.View
                style={[
                  tailwind.style('absolute z-10 -right-0.5 h-2.5 w-2.5 rounded-full'),
                  { backgroundColor: colors.accent },
                ]}
              />
            )}
            <Icon size={24} icon={<FilterIcon stroke={colors.accent} />} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export const ConversationHeaderPresenter = ({
  currentState,
  isSelectedAll,
  filtersAppliedCount,
  onLeftIconPress,
  onRightIconPress,
  onClearFilter,
}: ConversationHeaderPresenterProps) => {
  const { handlers, animatedStyle } = useScaleAnimation();
  const colors = useSaraColors();

  return (
    <Animated.View
      style={[tailwind.style('flex flex-row justify-between items-center px-4 pt-2 pb-[12px]')]}>
      <LeftSection
        currentState={currentState}
        isSelectedAll={isSelectedAll}
        onLeftIconPress={onLeftIconPress}
        colors={colors}
      />
      {currentState === 'Filter' && (
        <FilterSection
          filtersAppliedCount={filtersAppliedCount}
          onClearFilter={onClearFilter}
          handlers={handlers}
          animatedStyle={animatedStyle}
          colors={colors}
        />
      )}
      <HeaderTitle colors={colors} />
      <RightSection
        currentState={currentState}
        filtersAppliedCount={filtersAppliedCount}
        onRightIconPress={onRightIconPress}
        colors={colors}
      />
    </Animated.View>
  );
};
