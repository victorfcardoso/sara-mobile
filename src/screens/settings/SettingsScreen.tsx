import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StatusBar,
  Text,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  ActivityIndicator,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import * as WebBrowser from 'expo-web-browser';
import ChatWootWidget from '@chatwoot/react-native-widget';
import { useSelector } from 'react-redux';
import * as Application from 'expo-application';
import { Account, AvailabilityStatus } from '@/types';
import type { RootState } from '@/store';
import { clearAllConversations } from '@/store/conversation/conversationSlice';
import { resetNotifications } from '@/store/notification/notificationSlice';
import { clearAllContacts } from '@/store/contact/contactSlice';

import i18n from 'i18n';
import { HELP_URL } from '@/constants/url';
import { tailwind } from '@/theme';

import {
  BottomSheetBackdrop,
  BottomSheetHeader,
  BottomSheetWrapper,
  Button,
  LanguageList,
  AvailabilityStatusList,
  NotificationPreferences,
  SwitchAccount,
  SettingsList,
} from '@/components-next';

import { LANGUAGES, TAB_BAR_HEIGHT } from '@/constants';
import { useRefsContext } from '@/context';
import {
  CalendarIcon,
  ChatIcon,
  ChatwootIcon,
  CompanyIcon,
  CreditCardIcon,
  NotificationIcon,
  PhoneIcon,
  SwitchIcon,
  TranslateIcon,
  UserIcon,
  ZapIcon,
} from '@/svg-icons';
import { GenericListType } from '@/types';
import type { AgentPlanTier } from '@/store/agent-settings/agentSettingsTypes';

import { useHaptic } from '@/utils';
import { showToast } from '@/utils/toastUtils';
import { SettingsHeader } from './SettingsHeader';
import { DebugActions } from './components/DebugActions';
import {
  selectCurrentUserAvailability,
  selectUser,
  selectAccounts,
} from '@/store/auth/authSelectors';
import { logout, setAccount } from '@/store/auth/authSlice';
import { authActions } from '@/store/auth/authActions';
import { selectLocale, selectPushToken } from '@/store/settings/settingsSelectors';
import { settingsActions } from '@/store/settings/settingsActions';
import { setLocale } from '@/store/settings/settingsSlice';
import {
  agentSettingsActions,
  selectAgentSettingsData,
  selectAgentSettingsError,
  selectAgentSettingsIsFetching,
  selectAgentSettingsIsUpdating,
} from '@/store/agent-settings';
import { formatBrazilPhone } from '@/utils/phone';
import { parseFaqsFromInstructions } from '@/utils/faq';

import AnalyticsHelper from '@/utils/analyticsUtils';
import { PROFILE_EVENTS } from '@/constants/analyticsEvents';
import { getUserPermissions } from '@/utils/permissionUtils';
import { CONVERSATION_PERMISSIONS } from '@/constants/permissions';
import { useAppDispatch, useAppSelector } from '@/hooks';
import type { SettingsStackParamList } from '@/navigation/stack/SettingsStack';

const appName = Application.applicationName;
const appVersion = Application.nativeApplicationVersion;

const buildNumber = Application.nativeBuildVersion;
const appVersionDetails = buildNumber ? `${appVersion} (${buildNumber})` : appVersion;

const SARA_COLORS = {
  background: '#F8F5F3',
  textPrimary: '#16273D',
  textSecondary: '#4B5D6E',
  badgeBackground: '#CCE6DE',
  badgeText: '#16273D',
  footerText: '#566273',
  badgeMutedBackground: '#E7E2DD',
  badgeMutedText: '#4B5D6E',
  badgeWarningBackground: '#FFEBD6',
  badgeWarningText: '#8A5A2E',
  accent: '#0F4D49',
  errorText: '#B54747',
  switchTrackActive: '#4CB6AC',
  switchTrackInactive: '#D8D1C9',
  switchThumb: '#FFFFFF',
};

const SWITCH_TRACK_COLORS = {
  true: SARA_COLORS.switchTrackActive,
  false: SARA_COLORS.switchTrackInactive,
} as const;

type SettingsNavigation = NativeStackNavigationProp<SettingsStackParamList, 'SettingsScreen'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsNavigation>();
  const dispatch = useAppDispatch();
  const availabilityStatus =
    (useSelector(selectCurrentUserAvailability) as AvailabilityStatus) || 'offline';

  // const { bottom } = useSafeAreaInsets();

  const [showWidget, toggleWidget] = useState(false);
  const user = useSelector(selectUser);
  const {
    name,
    email,
    avatar_url: avatarUrl,
    identifier_hash: identifierHash,
    account_id: activeAccountId,
  } = user || {};

  useEffect(() => {
    dispatch(settingsActions.getNotificationSettings());
  }, [dispatch]);

  useEffect(() => {
    if (!agentId) {
      return;
    }
    dispatch(agentSettingsActions.fetchAgentSettings());
  }, [agentId, dispatch]);

  const pushToken = useAppSelector(selectPushToken);
  const agentId = useSelector((state: RootState) => state.auth.chatwootSession?.agentId);
  const agentSettings = useAppSelector(selectAgentSettingsData);
  const agentSettingsLoading = useAppSelector(selectAgentSettingsIsFetching);
  const agentSettingsUpdating = useAppSelector(selectAgentSettingsIsUpdating);
  const agentSettingsError = useAppSelector(selectAgentSettingsError);

  const userPermissions = user ? getUserPermissions(user, activeAccountId ?? null) : [];

  const hasConversationPermission = CONVERSATION_PERMISSIONS.some(permission =>
    userPermissions.includes(permission),
  );

  const planLabel = useMemo(() => {
    if (!agentSettings?.planTier) {
      return null;
    }
    const labelKey =
      agentSettings.planTier === 'premium' ? 'SETTINGS.PLAN_PREMIUM' : 'SETTINGS.PLAN_BASIC';
    return i18n.t(labelKey);
  }, [agentSettings?.planTier]);

  const servicesSummary = useMemo(() => {
    const count = agentSettings?.services.length ?? 0;
    if (count === 0) {
      return i18n.t('SETTINGS.SERVICES_EMPTY');
    }
    if (count === 1) {
      return i18n.t('SETTINGS.SERVICES_SINGLE', { count });
    }
    return i18n.t('SETTINGS.SERVICES_PLURAL', { count });
  }, [agentSettings?.services]);

  const parsedFaqs = useMemo(
    () => parseFaqsFromInstructions(agentSettings?.instructions),
    [agentSettings?.instructions],
  );
  const faqCountLabel = useMemo(() => {
    const count = parsedFaqs.length;
    if (count === 1) {
      return i18n.t('SETTINGS.FAQ_COUNT_SINGLE', { count });
    }
    return i18n.t('SETTINGS.FAQ_COUNT_PLURAL', { count });
  }, [parsedFaqs.length]);

  const renderBadge = useCallback(
    (label: string, variant: 'positive' | 'neutral' | 'warning' = 'neutral') => {
      const containerStyles = [styles.badgeBase];
      let textStyle = styles.badgeTextNeutral;
      if (variant === 'positive') {
        containerStyles.push(styles.badgePositive);
        textStyle = styles.badgeTextPositive;
      } else if (variant === 'warning') {
        containerStyles.push(styles.badgeWarning);
        textStyle = styles.badgeTextWarning;
      } else {
        containerStyles.push(styles.badgeNeutral);
      }
      return (
        <Animated.View style={containerStyles}>
          <Animated.Text
            style={[
              tailwind.style('text-xs font-inter-medium-24 tracking-[0.3px] uppercase'),
              textStyle,
            ]}>
            {label}
          </Animated.Text>
        </Animated.View>
      );
    },
    [],
  );

  const handleTogglePaymentRequired = useCallback(
    (value: boolean) => {
      if (!agentSettings || agentSettingsUpdating || agentSettings.paymentRequired === value) {
        return;
      }
      dispatch(agentSettingsActions.updateAgentSettings({ paymentRequired: value }));
    },
    [agentSettings, agentSettingsUpdating, dispatch],
  );

  const handleToggleDoctorConfirmation = useCallback(
    (value: boolean) => {
      if (
        !agentSettings ||
        agentSettingsUpdating ||
        agentSettings.doctorConfirmationRequired === value
      ) {
        return;
      }
      dispatch(agentSettingsActions.updateAgentSettings({ doctorConfirmationRequired: value }));
    },
    [agentSettings, agentSettingsUpdating, dispatch],
  );

  const renderValueAccessory = useCallback(
    (value: string, options?: { muted?: boolean; lines?: number }) => (
      <Animated.Text
        numberOfLines={options?.lines ?? 1}
        ellipsizeMode="tail"
        style={[
          styles.valueText,
          options?.muted ? styles.valueTextMuted : null,
          options?.lines && options.lines > 1 ? styles.valueTextMultiline : null,
        ]}>
        {value}
      </Animated.Text>
    ),
    [],
  );

  const workflowList = useMemo<GenericListType[]>(() => {
    if (!agentSettings) {
      return [];
    }
    return [
      {
        key: 'payment-required',
        title: i18n.t('SETTINGS.PAYMENT_REQUIRED'),
        icon: <CreditCardIcon />,
        renderAccessory: (
          <Switch
            value={Boolean(agentSettings.paymentRequired)}
            onValueChange={handleTogglePaymentRequired}
            disabled={agentSettingsUpdating}
            trackColor={{ false: SWITCH_TRACK_COLORS.false, true: SWITCH_TRACK_COLORS.true }}
            ios_backgroundColor={SWITCH_TRACK_COLORS.false}
            thumbColor={Platform.OS === 'android' ? SARA_COLORS.switchThumb : undefined}
          />
        ),
      },
      {
        key: 'doctor-confirmation',
        title: i18n.t('SETTINGS.DOCTOR_CONFIRMATION_REQUIRED'),
        icon: <CompanyIcon />,
        renderAccessory: (
          <Switch
            value={Boolean(agentSettings.doctorConfirmationRequired)}
            onValueChange={handleToggleDoctorConfirmation}
            disabled={agentSettingsUpdating}
            trackColor={{ false: SWITCH_TRACK_COLORS.false, true: SWITCH_TRACK_COLORS.true }}
            ios_backgroundColor={SWITCH_TRACK_COLORS.false}
            thumbColor={Platform.OS === 'android' ? SARA_COLORS.switchThumb : undefined}
          />
        ),
      },
    ];
  }, [
    agentSettings,
    agentSettingsUpdating,
    handleToggleDoctorConfirmation,
    handleTogglePaymentRequired,
  ]);

  const integrationsList = useMemo<GenericListType[]>(() => {
    if (!agentSettings) {
      return [];
    }
    const { meta, stripe } = agentSettings.integrations;
    return [
      {
        key: 'whatsapp',
        title: i18n.t('SETTINGS.WHATSAPP_BUSINESS'),
        icon: <ChatIcon />,
        subtitle: meta.phoneNumberId
          ? i18n.t('SETTINGS.WHATSAPP_PHONE_LABEL', { phoneNumberId: meta.phoneNumberId })
          : i18n.t('SETTINGS.WHATSAPP_PHONE_PLACEHOLDER'),
        subtitleType: 'light',
        renderAccessory: renderBadge(
          meta.connected
            ? i18n.t('SETTINGS.CONNECTED_BADGE')
            : i18n.t('SETTINGS.DISCONNECTED_BADGE'),
          meta.connected ? 'positive' : 'neutral',
        ),
      },
      {
        key: 'stripe',
        title: i18n.t('SETTINGS.STRIPE'),
        icon: <CreditCardIcon />,
        subtitle: stripe.accountId ?? i18n.t('SETTINGS.STRIPE_ACCOUNT_PLACEHOLDER'),
        subtitleType: 'light',
        renderAccessory: renderBadge(
          stripe.connected
            ? i18n.t('SETTINGS.CONNECTED_BADGE')
            : i18n.t('SETTINGS.DISCONNECTED_BADGE'),
          stripe.connected ? 'positive' : 'neutral',
        ),
      },
    ];
  }, [agentSettings, renderBadge]);

  const schedulingList = useMemo<GenericListType[]>(() => {
    if (!agentSettings) {
      return [];
    }
    return [
      {
        key: 'office-hours',
        title: i18n.t('SETTINGS.OFFICE_HOURS'),
        icon: <CalendarIcon />,
        hasChevron: true,
        onPressListItem: () => navigation.navigate('OfficeHoursScreen'),
      },
      {
        key: 'availability-blocks',
        title: i18n.t('SETTINGS.AVAILABILITY_BLOCKS'),
        icon: <SwitchIcon />,
        hasChevron: true,
      },
    ];
  }, [agentSettings, navigation]);

  const botConfigList = useMemo<GenericListType[]>(() => {
    if (!agentSettings) {
      return [];
    }
    return [
      {
        key: 'agents',
        title: i18n.t('SETTINGS.AGENTS'),
        icon: <UserIcon />,
        hasChevron: true,
        onPressListItem: () => navigation.navigate('AgentProfileScreen'),
      },
      {
        key: 'service-catalog',
        title: i18n.t('SETTINGS.SERVICE_CATALOG'),
        icon: <CompanyIcon />,
        subtitle: servicesSummary,
        subtitleType: 'light',
        hasChevron: true,
        onPressListItem: () => navigation.navigate('ServiceCatalogScreen'),
      },
      {
        key: 'instructions',
        title: i18n.t('SETTINGS.INSTRUCTIONS_FAQ'),
        icon: <ZapIcon />,
        subtitle: faqCountLabel,
        subtitleType: 'light',
        hasChevron: true,
        onPressListItem: () => navigation.navigate('FaqScreen'),
      },
    ];
  }, [agentSettings, faqCountLabel, navigation, servicesSummary]);

  const userDetails = {
    identifier: email,
    name,
    avatar_url: avatarUrl,
    email,
    identifier_hash: identifierHash,
  };

  const customAttributes = {
    originatedFrom: 'mobile-app',
    appName,
    appVersion: appVersionDetails,
    deviceId: DeviceInfo.getDeviceId(),
    packageName: appName,
    operatingSystem: Platform.OS, // android/ios
  };

  const footerLabel = 'Sara 0.1';

  const accounts = useSelector(selectAccounts) || [];

  const activeAccountName = accounts.length
    ? accounts.find((account: Account) => account.id === activeAccountId)?.name || ''
    : '';

  const enableAccountSwitch = accounts.length > 1;

  const activeLocale = useSelector(selectLocale);
  const planTierOptions = useMemo(
    () => [
      {
        tier: 'basic' as AgentPlanTier,
        title: i18n.t('SETTINGS.PLAN_BASIC', { locale: activeLocale }),
        description: i18n.t('SETTINGS.PLAN_BASIC_DESCRIPTION', { locale: activeLocale }),
      },
      {
        tier: 'premium' as AgentPlanTier,
        title: i18n.t('SETTINGS.PLAN_PREMIUM', { locale: activeLocale }),
        description: i18n.t('SETTINGS.PLAN_PREMIUM_DESCRIPTION', { locale: activeLocale }),
      },
    ],
    [activeLocale],
  );
  const {
    userAvailabilityStatusSheetRef,
    planTierSheetRef,
    languagesModalSheetRef,
    notificationPreferencesSheetRef,
    switchAccountSheetRef,
    debugActionsSheetRef,
  } = useRefsContext();

  const hapticSelection = useHaptic();

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const openSheet = useCallback(() => {
    hapticSelection?.();
    userAvailabilityStatusSheetRef.current?.present();
  }, [hapticSelection, userAvailabilityStatusSheetRef]);

  const openPlanTierSheet = useCallback(() => {
    if (!agentSettings) {
      return;
    }
    hapticSelection?.();
    planTierSheetRef.current?.present();
  }, [agentSettings, hapticSelection, planTierSheetRef]);

  const changeAvailabilityStatus = (updatedStatus: string) => {
    AnalyticsHelper.track(PROFILE_EVENTS.TOGGLE_AVAILABILITY_STATUS, {
      from: availabilityStatus,
      to: updatedStatus,
    });
    const payload = { profile: { availability: updatedStatus, account_id: activeAccountId } };
    // TODO: Fix this later
    // @ts-expect-error TODO: Fix typing for dispatch
    dispatch(authActions.updateAvailability(payload));
  };

  const onChangeLanguage = (locale: string) => {
    dispatch(setLocale(locale));
  };

  const changeAccount = (accountId: number) => {
    dispatch(clearAllContacts());
    dispatch(clearAllConversations());
    dispatch(resetNotifications());
    dispatch(setAccount(accountId));
    dispatch(authActions.setActiveAccount({ profile: { account_id: accountId } }));
    navigation.dispatch(StackActions.replace('Tab'));
  };

  const handleSelectPlanTier = useCallback(
    async (tier: AgentPlanTier) => {
      if (!agentSettings || agentSettingsUpdating) {
        return;
      }
      if (agentSettings.planTier === tier) {
        planTierSheetRef.current?.dismiss({
          overshootClamping: true,
        });
        return;
      }
      try {
        await dispatch(agentSettingsActions.updateAgentSettings({ planTier: tier })).unwrap();
        planTierSheetRef.current?.dismiss({
          overshootClamping: true,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : i18n.t('SETTINGS.ERROR_PLAN_TIER_UPDATE');
        showToast({ message });
      }
    },
    [agentSettings, agentSettingsUpdating, dispatch, planTierSheetRef],
  );

  const formattedAvailability =
    availabilityStatus && availabilityStatus.length
      ? availabilityStatus.charAt(0).toUpperCase() + availabilityStatus.slice(1)
      : '';

  useEffect(() => {
    userAvailabilityStatusSheetRef.current?.dismiss({
      overshootClamping: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityStatus]);

  useEffect(() => {
    languagesModalSheetRef.current?.dismiss({
      overshootClamping: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocale]);

  const openURL = async () => {
    await WebBrowser.openBrowserAsync(HELP_URL);
  };

  // const openSystemSettings = () => {
  //   if (Platform.OS === 'ios') {
  //     Linking.openURL('app-settings:');
  //   } else {
  //     Linking.openSettings();
  //   }
  // };

  const onClickLogout = useCallback(async () => {
    await AsyncStorage.removeItem('cwCookie');
    await dispatch(settingsActions.removeDevice({ pushToken }));
    dispatch(logout());
  }, [dispatch, pushToken]);

  const preferencesList = useMemo<GenericListType[]>(() => {
    const items: GenericListType[] = [];
    const formattedManagerWhatsapp =
      formatBrazilPhone(agentSettings?.managerWhatsappPhone) ??
      agentSettings?.managerWhatsappPhone ??
      '';
    const managerWhatsappDisplay =
      formattedManagerWhatsapp.trim().length > 0
        ? formattedManagerWhatsapp
        : i18n.t('SETTINGS.FIELD_NOT_CONFIGURED');

    const planSubtitle = planLabel ?? i18n.t('SETTINGS.FIELD_NOT_CONFIGURED');
    items.push({
      key: 'plan-tier',
      title: i18n.t('SETTINGS.PLAN_TIER'),
      icon: <UserIcon />,
      subtitle: planSubtitle,
      subtitleType: 'light',
      hasChevron: Boolean(agentSettings),
      disabled: !agentSettings,
      onPressListItem: openPlanTierSheet,
    });

    items.push(
      {
        key: 'change-availability',
        hasChevron: true,
        title: i18n.t('SETTINGS.CHANGE_AVAILABILITY'),
        icon: <SwitchIcon />,
        subtitle: '',
        subtitleType: 'light',
        onPressListItem: () => openSheet(),
      },
      {
        key: 'notifications',
        hasChevron: true,
        title: i18n.t('SETTINGS.NOTIFICATIONS'),
        icon: <NotificationIcon />,
        subtitle: '',
        subtitleType: 'light',
        disabled: !hasConversationPermission,
        onPressListItem: () => notificationPreferencesSheetRef.current?.present(),
      },
      {
        key: 'change-language',
        hasChevron: true,
        title: i18n.t('SETTINGS.CHANGE_LANGUAGE'),
        icon: <TranslateIcon />,
        subtitle: LANGUAGES[activeLocale as keyof typeof LANGUAGES],
        subtitleType: 'light',
        onPressListItem: () => languagesModalSheetRef.current?.present(),
      },
      {
        key: 'manager-whatsapp',
        hasChevron: false,
        title: i18n.t('SETTINGS.MANAGER_WHATSAPP'),
        icon: <PhoneIcon />,
        renderAccessory: renderValueAccessory(managerWhatsappDisplay),
      },
      {
        key: 'switch-account',
        hasChevron: enableAccountSwitch,
        title: i18n.t('SETTINGS.SWITCH_ACCOUNT'),
        icon: <SwitchIcon />,
        subtitle: activeAccountName,
        subtitleType: 'light',
        onPressListItem: () => {
          if (enableAccountSwitch) {
            switchAccountSheetRef.current?.present();
          }
        },
      },
    );

    return items;
  }, [
    activeAccountName,
    activeLocale,
    agentSettings,
    enableAccountSwitch,
    hasConversationPermission,
    languagesModalSheetRef,
    notificationPreferencesSheetRef,
    openSheet,
    openPlanTierSheet,
    planLabel,
    renderValueAccessory,
    switchAccountSheetRef,
  ]);

  const supportList: GenericListType[] = [
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.READ_DOCS'),
      icon: <SwitchIcon />,
      subtitle: '',
      subtitleType: 'light',
      onPressListItem: openURL,
    },
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.CHAT_WITH_US'),
      icon: <ChatwootIcon />,
      subtitle: '',
      subtitleType: 'light',
      onPressListItem: () => toggleWidget(true),
    },
  ];

  return (
    <SafeAreaView
      style={[tailwind.style('flex-1 font-inter-normal-20'), styles.container]}
      edges={['top', 'bottom']}>
      <StatusBar translucent backgroundColor={SARA_COLORS.background} barStyle={'dark-content'} />
      <SettingsHeader />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}>
        <Animated.View style={tailwind.style('flex justify-center items-center pt-4 gap-3')}>
          <Animated.View style={tailwind.style('flex flex-col items-center gap-2')}>
            <Animated.Text
              style={[
                tailwind.style('text-[22px] font-inter-580-24'),
                { color: SARA_COLORS.textPrimary },
              ]}>
              {name}
            </Animated.Text>
            <Animated.Text
              style={[
                tailwind.style('text-[15px] font-inter-420-20 leading-[17.25px]'),
                { color: SARA_COLORS.textSecondary },
              ]}>
              {email}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={tailwind.style('flex flex-row items-center gap-2')}>
            <Animated.View style={styles.statusPill}>
              <Animated.Text
                style={[
                  tailwind.style('text-xs font-inter-medium-24 tracking-[0.3px] uppercase'),
                  { color: SARA_COLORS.badgeText },
                ]}>
                {formattedAvailability}
              </Animated.Text>
            </Animated.View>
          </Animated.View>
        </Animated.View>
        {agentSettingsLoading ? (
          <Animated.View style={tailwind.style('pt-6 items-center')}>
            <ActivityIndicator color={SARA_COLORS.textSecondary} />
          </Animated.View>
        ) : null}
        {agentSettingsError ? (
          <Animated.View style={tailwind.style('pt-4 px-4')}>
            <Animated.Text
              style={[
                tailwind.style('text-sm font-inter-normal-20 text-center'),
                { color: SARA_COLORS.errorText },
              ]}>
              {agentSettingsError}
            </Animated.Text>
          </Animated.View>
        ) : null}
        {workflowList.length > 0 ? (
          <Animated.View style={tailwind.style('pt-6')}>
            <SettingsList sectionTitle={i18n.t('SETTINGS.WORKFLOW')} list={workflowList} />
          </Animated.View>
        ) : null}
        {integrationsList.length > 0 ? (
          <Animated.View style={tailwind.style('pt-6')}>
            <SettingsList sectionTitle={i18n.t('SETTINGS.INTEGRATIONS')} list={integrationsList} />
          </Animated.View>
        ) : null}
        {schedulingList.length > 0 ? (
          <Animated.View style={tailwind.style('pt-6')}>
            <SettingsList sectionTitle={i18n.t('SETTINGS.SCHEDULING')} list={schedulingList} />
          </Animated.View>
        ) : null}
        {botConfigList.length > 0 ? (
          <Animated.View style={tailwind.style('pt-6')}>
            <SettingsList
              sectionTitle={i18n.t('SETTINGS.BOT_CONFIGURATION')}
              list={botConfigList}
            />
          </Animated.View>
        ) : null}
        <Animated.View style={tailwind.style('pt-6')}>
          <SettingsList sectionTitle={i18n.t('SETTINGS.PREFERENCES')} list={preferencesList} />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-6')}>
          <SettingsList sectionTitle={i18n.t('SETTINGS.SUPPORT')} list={supportList} />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-6 mx-4')}>
          <Button
            variant="secondary"
            text={i18n.t('SETTINGS.LOGOUT')}
            isDestructive
            handlePress={onClickLogout}
          />
        </Animated.View>
        <Pressable
          style={tailwind.style('p-4 items-center')}
          onLongPress={() => debugActionsSheetRef.current?.present()}>
          <Text style={[tailwind.style('text-sm'), { color: SARA_COLORS.footerText }]}>
            {footerLabel}
          </Text>
        </Pressable>
      </Animated.ScrollView>
      <BottomSheetModal
        ref={userAvailabilityStatusSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        // TODO: Fix this later
        // bottomInset={bottom === 0 ? 12 : bottom}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={[190]}>
        <BottomSheetWrapper>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_AVAILABILITY')} />
          <AvailabilityStatusList
            changeAvailabilityStatus={changeAvailabilityStatus}
            availabilityStatus={availabilityStatus}
          />
        </BottomSheetWrapper>
      </BottomSheetModal>
      <BottomSheetModal
        ref={planTierSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={['45%']}>
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.CHANGE_PLAN_TIER')} />
          <View style={tailwind.style('px-5 pt-3 pb-3')}>
            <Text style={[tailwind.style('text-sm'), styles.planSheetSubtitle]}>
              {i18n.t('SETTINGS.PLAN_TIER_SHEET_DESCRIPTION')}
            </Text>
          </View>
          {planTierOptions.map(option => {
            const isActive = agentSettings?.planTier === option.tier;
            return (
              <Pressable
                key={option.tier}
                style={[
                  tailwind.style('mx-5 mb-3 flex-row items-start gap-4'),
                  styles.planOption,
                  isActive ? styles.planOptionActive : null,
                  agentSettingsUpdating ? styles.planOptionDisabled : null,
                ]}
                disabled={agentSettingsUpdating}
                onPress={() => handleSelectPlanTier(option.tier)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive, disabled: agentSettingsUpdating }}>
                <View style={styles.planOptionTextWrapper}>
                  <Text
                    style={[
                      tailwind.style('text-base font-inter-semibold-20'),
                      styles.planOptionTitle,
                    ]}>
                    {option.title}
                  </Text>
                  <Text
                    style={[tailwind.style('text-sm mt-1'), styles.planOptionDescription]}
                    numberOfLines={2}>
                    {option.description}
                  </Text>
                </View>
                <View
                  style={[styles.planOptionRadio, isActive ? styles.planOptionRadioActive : null]}
                />
              </Pressable>
            );
          })}
          {agentSettingsUpdating ? (
            <View style={tailwind.style('py-2 items-center')}>
              <ActivityIndicator color={SARA_COLORS.accent} />
            </View>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={languagesModalSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        // TODO: Fix this later
        // bottomInset={bottom === 0 ? 12 : bottom}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={['70%']}>
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_LANGUAGE')} />
          <LanguageList onChangeLanguage={onChangeLanguage} currentLanguage={activeLocale} />
        </BottomSheetScrollView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={notificationPreferencesSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        // TODO: Fix this later
        // bottomInset={bottom === 0 ? 12 : bottom}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={['52%']}>
        <BottomSheetWrapper>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.NOTIFICATION_PREFERENCES')} />
          <NotificationPreferences />
        </BottomSheetWrapper>
      </BottomSheetModal>
      <BottomSheetModal
        ref={switchAccountSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        // TODO: Fix this later
        // bottomInset={bottom === 0 ? 12 : bottom}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={['50%']}>
        <BottomSheetWrapper>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SWITCH_ACCOUNT')} />
          <SwitchAccount
            currentAccountId={activeAccountId}
            changeAccount={changeAccount}
            accounts={accounts}
          />
        </BottomSheetWrapper>
      </BottomSheetModal>
      <BottomSheetModal
        ref={debugActionsSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={['36%']}>
        <BottomSheetWrapper>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.DEBUG_ACTIONS')} />
          <DebugActions />
        </BottomSheetWrapper>
      </BottomSheetModal>
      {!!process.env.EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN &&
        !!process.env.EXPO_PUBLIC_CHATWOOT_BASE_URL &&
        !!showWidget && (
          <ChatWootWidget
            websiteToken={process.env.EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN}
            locale="en"
            baseUrl={process.env.EXPO_PUBLIC_CHATWOOT_BASE_URL}
            closeModal={() => toggleWidget(false)}
            isModalVisible={showWidget}
            user={userDetails}
            customAttributes={customAttributes}
          />
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: SARA_COLORS.background,
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: SARA_COLORS.badgeBackground,
  },
  badgeBase: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: SARA_COLORS.badgeMutedBackground,
  },
  badgePositive: {
    backgroundColor: SARA_COLORS.badgeBackground,
  },
  badgeNeutral: {
    backgroundColor: SARA_COLORS.badgeMutedBackground,
  },
  badgeWarning: {
    backgroundColor: SARA_COLORS.badgeWarningBackground,
  },
  badgeTextPositive: {
    color: SARA_COLORS.badgeText,
  },
  badgeTextNeutral: {
    color: SARA_COLORS.badgeMutedText,
  },
  badgeTextWarning: {
    color: SARA_COLORS.badgeWarningText,
  },
  valueText: {
    color: SARA_COLORS.textPrimary,
    textAlign: 'right',
    maxWidth: 200,
  },
  valueTextMuted: {
    color: SARA_COLORS.textSecondary,
  },
  valueTextMultiline: {
    textAlign: 'right',
  },
  planSheetSubtitle: {
    color: SARA_COLORS.textSecondary,
  },
  planOption: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1D9CF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  planOptionActive: {
    borderColor: SARA_COLORS.switchTrackActive,
    backgroundColor: '#EEF7F5',
  },
  planOptionDisabled: {
    opacity: 0.6,
  },
  planOptionTextWrapper: {
    flex: 1,
  },
  planOptionTitle: {
    color: SARA_COLORS.textPrimary,
  },
  planOptionDescription: {
    color: SARA_COLORS.textSecondary,
  },
  planOptionRadio: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#D5CBC0',
    marginTop: 2,
  },
  planOptionRadioActive: {
    borderColor: SARA_COLORS.switchTrackActive,
    backgroundColor: '#DFF4F0',
  },
});

export default SettingsScreen;
