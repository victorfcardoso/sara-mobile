import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomSheetModal, BottomSheetFlatList } from '@gorhom/bottom-sheet';

import i18n from 'i18n';
import { tailwind } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  agentSettingsActions,
  selectAgentSettingsData,
  selectAgentSettingsIsFetching,
  selectAgentSettingsIsUpdating,
} from '@/store/agent-settings';
import {
  manageableAgentActions,
  selectManageableAgents,
  selectManageableAgentsError,
  selectManageableAgentsIsFetching,
} from '../../store/manageable-agents';
import { formatBrazilPhone } from '../../utils/phone';
import {
  selectChatwootSession,
  selectIsSwitchingAgent,
  selectUserName,
} from '@/store/auth/authSelectors';
import { authActions } from '@/store/auth/authActions';
import type { SettingsStackParamList } from '@/navigation/stack/SettingsStack';
import { Icon } from '@/components-next/common/icon';
import { ChevronLeft } from '@/svg-icons/common/ChevronLeft';
import { BottomSheetBackdrop } from '@/components-next/common/bottomsheet';
import { showToast } from '@/utils/toastUtils';
import { useSaraColors, useIsDarkMode } from '@/hooks/useSaraColors';

type SettingsNavigation = NativeStackNavigationProp<SettingsStackParamList, 'AgentProfileScreen'>;

export const AgentProfileScreen = (): JSX.Element => {
  const navigation = useNavigation<SettingsNavigation>();
  const dispatch = useAppDispatch();
  const colors = useSaraColors();
  const isDark = useIsDarkMode();

  const agentSettings = useAppSelector(selectAgentSettingsData);
  const agentSettingsLoading = useAppSelector(selectAgentSettingsIsFetching);
  const agentSettingsUpdating = useAppSelector(selectAgentSettingsIsUpdating);
  const manageableAgents = useAppSelector(selectManageableAgents);
  const manageableAgentsLoading = useAppSelector(selectManageableAgentsIsFetching);
  const manageableAgentsError = useAppSelector(selectManageableAgentsError);
  const chatwootSession = useAppSelector(selectChatwootSession);
  const isSwitchingAgent = useAppSelector(selectIsSwitchingAgent);
  const operatorName = useAppSelector(selectUserName);

  const activeAgentId = chatwootSession?.agentId ?? null;
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [nameValue, setNameValue] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(agentSettingsActions.fetchAgentSettings());
      dispatch(manageableAgentActions.fetchAgents());
    }, [dispatch]),
  );

  const snapPoints = useMemo(() => ['45%'], []);

  const openAgentSwitcher = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const closeAgentSwitcher = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSelectAgent = useCallback(
    async (agentId: string) => {
      if (!agentId) {
        return;
      }
      if (agentId === activeAgentId) {
        closeAgentSwitcher();
        return;
      }

      try {
        await dispatch(authActions.switchAgent(agentId)).unwrap();
        await Promise.all([
          dispatch(agentSettingsActions.fetchAgentSettings()).unwrap(),
          dispatch(manageableAgentActions.fetchAgents()).unwrap(),
        ]);
        showToast({ message: i18n.t('AGENT_PROFILE_PAGE.SWITCH_SUCCESS') });
        closeAgentSwitcher();
      } catch (error) {
        const message = error instanceof Error ? error.message : i18n.t('ERRORS.COMMON_ERROR');
        showToast({ message });
      }
    },
    [activeAgentId, closeAgentSwitcher, dispatch],
  );

  const activeAgent = useMemo(() => {
    if (!activeAgentId) {
      return null;
    }
    return manageableAgents.find(agent => agent.id === activeAgentId) ?? null;
  }, [activeAgentId, manageableAgents]);

  const fallbackName = activeAgent?.name || operatorName || activeAgentId || '';
  const persistedName = agentSettings?.name || fallbackName;

  useEffect(() => {
    setNameValue(persistedName);
    setIsEditingName(false);
  }, [persistedName]);

  const trimmedNameValue = nameValue.trim();
  const agentDisplayName = trimmedNameValue || fallbackName || activeAgentId || '—';

  const originalNameComparable = (persistedName || '').trim();
  const isNameChanged = trimmedNameValue !== originalNameComparable;

  const agentIdLabel = agentSettings?.id ?? activeAgentId ?? '—';
  const publicWhatsapp = agentSettings?.publicWhatsappPhone ?? activeAgent?.publicWhatsappPhone;
  const managerWhatsapp = agentSettings?.managerWhatsappPhone ?? activeAgent?.managerWhatsappPhone;
  const displayPublicWhatsapp = formatBrazilPhone(publicWhatsapp);
  const displayManagerWhatsapp = formatBrazilPhone(managerWhatsapp);

  const renderInfoRow = (label: string, value: string | null, testID?: string) => (
    <View
      style={[tailwind.style('py-3'), { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
      key={label}>
      <Text
        style={[
          tailwind.style('text-xs uppercase tracking-[1px]'),
          { color: colors.textSecondary },
        ]}>
        {label}
      </Text>
      <Text
        style={[tailwind.style('text-base font-medium mt-1'), { color: colors.textPrimary }]}
        testID={testID}>
        {value && value.trim().length > 0 ? value : i18n.t('SETTINGS.FIELD_NOT_CONFIGURED')}
      </Text>
    </View>
  );

  const resetNameField = useCallback(() => {
    setNameValue(persistedName);
  }, [persistedName]);

  const commitNameChange = useCallback(async () => {
    if (isSavingName) {
      return;
    }
    if (!trimmedNameValue) {
      resetNameField();
      setIsEditingName(false);
      return;
    }
    if (!isNameChanged) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      await dispatch(
        agentSettingsActions.updateAgentSettings({
          name: trimmedNameValue,
        }),
      ).unwrap();
      showToast({ message: i18n.t('AGENT_PROFILE_PAGE.SAVE_NAME_SUCCESS') });
      setIsEditingName(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : i18n.t('AGENT_PROFILE_PAGE.SAVE_NAME_ERROR');
      showToast({ message });
      setIsEditingName(true);
    } finally {
      setIsSavingName(false);
    }
  }, [dispatch, isNameChanged, isSavingName, resetNameField, trimmedNameValue]);

  const nameInputEditable = !agentSettingsLoading && !agentSettingsUpdating && !isSavingName;

  const handleStartEditingName = useCallback(() => {
    if (!nameInputEditable) {
      return;
    }
    setIsEditingName(true);
  }, [nameInputEditable]);

  return (
    <SafeAreaView style={[tailwind.style('flex-1'), { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View
        style={[
          tailwind.style('flex-row items-center px-4 py-3'),
          { borderBottomWidth: 1, borderBottomColor: colors.border },
        ]}>
        <Pressable
          accessibilityHint={i18n.t('AGENT_PROFILE_PAGE.BACK_HINT')}
          accessibilityRole="button"
          onPress={handleGoBack}
          style={tailwind.style('h-10 w-10 items-center justify-center mr-2')}>
          <Icon icon={<ChevronLeft stroke={colors.textPrimary} />} size={20} />
        </Pressable>
        <Text style={[tailwind.style('text-lg font-semibold'), { color: colors.textPrimary }]}>
          {i18n.t('SETTINGS.AGENT_PROFILE')}
        </Text>
      </View>

      <ScrollView
        style={tailwind.style('flex-1')}
        contentContainerStyle={tailwind.style('px-4 py-6 gap-6')}>
        <View
          style={[
            tailwind.style('rounded-2xl p-5'),
            { backgroundColor: colors.backgroundLight, borderColor: colors.border, borderWidth: 1 },
          ]}>
          <Text
            style={[
              tailwind.style('text-sm uppercase tracking-[1px]'),
              { color: colors.textSecondary },
            ]}>
            {i18n.t('AGENT_PROFILE_PAGE.ACTIVE_AGENT')}
          </Text>
          <Text
            style={[tailwind.style('text-2xl font-semibold mt-2'), { color: colors.textPrimary }]}>
            {agentDisplayName}
          </Text>
          <Text style={[tailwind.style('text-sm mt-1'), { color: colors.textSecondary }]}>
            {i18n.t('AGENT_PROFILE_PAGE.AGENT_ID_LABEL', { id: agentIdLabel })}
          </Text>
          <Pressable
            onPress={openAgentSwitcher}
            disabled={
              isSwitchingAgent || (manageableAgentsLoading && manageableAgents.length === 0)
            }
            style={({ pressed }) => [
              tailwind.style('mt-4 rounded-[13px] py-[11px] items-center justify-center'),
              {
                backgroundColor: colors.accent,
                opacity:
                  isSwitchingAgent || (manageableAgentsLoading && manageableAgents.length === 0)
                    ? 0.5
                    : pressed
                      ? 0.9
                      : 1,
              },
            ]}>
            {isSwitchingAgent ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text
                style={[tailwind.style('text-base font-medium'), { color: colors.textPrimary }]}>
                {i18n.t('AGENT_PROFILE_PAGE.SWITCH_BUTTON')}
              </Text>
            )}
          </Pressable>
        </View>

        <View
          style={[
            tailwind.style('rounded-2xl p-5'),
            { backgroundColor: colors.backgroundLight, borderColor: colors.border, borderWidth: 1 },
          ]}>
          <Text
            style={[tailwind.style('text-base font-semibold mb-3'), { color: colors.textPrimary }]}>
            {i18n.t('AGENT_PROFILE_PAGE.IDENTITY_SECTION')}
          </Text>
          {agentSettingsLoading && !agentSettings ? (
            <View style={tailwind.style('py-6 items-center justify-center')}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <>
              <View
                style={[
                  tailwind.style('py-3'),
                  { borderBottomColor: colors.border, borderBottomWidth: 1 },
                ]}>
                <Text
                  style={[
                    tailwind.style('text-xs uppercase tracking-[1px]'),
                    { color: colors.textSecondary },
                  ]}>
                  {i18n.t('AGENT_PROFILE_PAGE.NAME_LABEL')}
                </Text>
                {isEditingName ? (
                  <TextInput
                    value={nameValue}
                    onChangeText={setNameValue}
                    editable={nameInputEditable}
                    placeholder={i18n.t('AGENT_PROFILE_PAGE.NAME_PLACEHOLDER')}
                    placeholderTextColor={colors.textMeta}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={commitNameChange}
                    onBlur={commitNameChange}
                    autoFocus
                    selectTextOnFocus
                    style={[
                      styles.inlineInput,
                      { color: colors.textPrimary },
                      !nameInputEditable ? styles.inlineInputDisabled : null,
                    ]}
                  />
                ) : (
                  <Pressable
                    onPress={handleStartEditingName}
                    disabled={!nameInputEditable}
                    style={styles.editableValue}>
                    <Text
                      style={[
                        tailwind.style('text-base font-medium'),
                        { color: colors.textPrimary },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {agentDisplayName}
                    </Text>
                  </Pressable>
                )}
              </View>
              <View>
                {renderInfoRow(
                  i18n.t('AGENT_PROFILE_PAGE.PUBLIC_WHATSAPP'),
                  displayPublicWhatsapp ?? publicWhatsapp,
                  'agent-public-whatsapp',
                )}
                {renderInfoRow(
                  i18n.t('AGENT_PROFILE_PAGE.MANAGER_WHATSAPP'),
                  displayManagerWhatsapp ?? managerWhatsapp,
                  'agent-manager-whatsapp',
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={props => <BottomSheetBackdrop {...props} />}
        backgroundStyle={{ backgroundColor: colors.backgroundLight }}
        handleIndicatorStyle={{ backgroundColor: colors.textMeta }}
        enablePanDownToClose>
        <View style={tailwind.style('px-5 pt-4 pb-2')}>
          <Text style={[tailwind.style('text-lg font-semibold'), { color: colors.textPrimary }]}>
            {i18n.t('AGENT_PROFILE_PAGE.SWITCH_SHEET_TITLE')}
          </Text>
          <Text style={[tailwind.style('text-sm mt-1'), { color: colors.textSecondary }]}>
            {i18n.t('AGENT_PROFILE_PAGE.SWITCH_SHEET_DESCRIPTION')}
          </Text>
        </View>
        {manageableAgentsLoading && manageableAgents.length === 0 ? (
          <View style={tailwind.style('py-8 items-center justify-center')}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : manageableAgents.length === 0 ? (
          <View style={tailwind.style('py-8 px-5')}>
            <Text style={[tailwind.style('text-sm text-center'), { color: colors.textSecondary }]}>
              {manageableAgentsError ?? i18n.t('AGENT_PROFILE_PAGE.EMPTY_STATE')}
            </Text>
          </View>
        ) : (
          <BottomSheetFlatList
            data={manageableAgents}
            keyExtractor={item => item.id}
            contentContainerStyle={tailwind.style('pb-6')}
            renderItem={({ item }) => {
              const isActive = item.id === activeAgentId;
              return (
                <Pressable
                  onPress={() => handleSelectAgent(item.id)}
                  disabled={isSwitchingAgent}
                  style={[
                    tailwind.style('px-5 py-3'),
                    {
                      backgroundColor: isActive ? colors.accentLight : 'transparent',
                    },
                  ]}>
                  <Text
                    style={[
                      tailwind.style('text-base font-medium'),
                      { color: colors.textPrimary },
                    ]}>
                    {item.name}
                  </Text>
                  <Text style={[tailwind.style('text-xs mt-1'), { color: colors.textSecondary }]}>
                    {i18n.t('AGENT_PROFILE_PAGE.AGENT_ID_LABEL', { id: item.id })}
                  </Text>
                  {item.publicWhatsappPhone ? (
                    <Text style={[tailwind.style('text-xs mt-1'), { color: colors.textSecondary }]}>
                      {formatBrazilPhone(item.publicWhatsappPhone) ?? item.publicWhatsappPhone}
                    </Text>
                  ) : null}
                </Pressable>
              );
            }}
          />
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inlineInput: {
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  inlineInputDisabled: {
    opacity: 0.6,
  },
  editableValue: {
    marginTop: 4,
  },
});

export default AgentProfileScreen;
