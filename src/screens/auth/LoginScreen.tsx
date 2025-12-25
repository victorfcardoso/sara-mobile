import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Image, Pressable, StatusBar, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import type { BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EMAIL_REGEX } from '@/constants';
import { EyeIcon, EyeSlash } from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { resetAuth } from '@/store/auth/authSlice';
import { authActions } from '@/store/auth/authActions';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useSaraColors, useIsDarkMode } from '@/hooks/useSaraColors';

import {
  BottomSheetBackdrop,
  BottomSheetHeader,
  LanguageList,
  Button,
  Icon,
} from '@/components-next';
import {
  selectInstallationUrl,
  selectLocale,
  selectRememberMe,
} from '@/store/settings/settingsSelectors';
import { selectIsLoggingIn } from '@/store/auth/authSelectors';
import { setLocale, setRememberMe } from '@/store/settings/settingsSlice';
import { useRefsContext } from '@/context/RefsContext';

const saraIcon = require('@/assets/images/sara_icon.png');

type FormData = {
  email: string;
  password: string;
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const colors = useSaraColors();
  const isDark = useIsDarkMode();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const passwordInputRef = useRef<TextInput | null>(null);

  const { languagesModalSheetRef } = useRefsContext();

  // Simple fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const dispatch = useAppDispatch();
  const isLoggingIn = useAppSelector(selectIsLoggingIn);

  const installationUrl = useAppSelector(selectInstallationUrl);
  const activeLocale = useAppSelector(selectLocale);
  const rememberMe = useAppSelector(selectRememberMe);

  const isPortuguese = i18n.locale?.toLowerCase().startsWith('pt');
  const brandHeadline = isPortuguese
    ? 'Assistente WhatsApp para agendamentos'
    : 'WhatsApp assistant for scheduling';
  const brandSubtitle = isPortuguese
    ? 'Agende consultas, confirme por WhatsApp e aceite pagamentos. Tudo com a Sara AI.'
    : 'Schedule visits, confirm over WhatsApp, and accept payments. All with Sara AI.';

  const contentContainerStyles = [tailwind.style('px-6 pt-10'), styles.contentContainer];
  const heroSectionStyles = [tailwind.style('pt-6 gap-4'), styles.heroSection];
  const heroTitleStyles = [tailwind.style('text-3xl font-inter-semibold-20'), styles.heroTitle];
  const heroSubtitleStyles = [
    tailwind.style('font-inter-normal-20 leading-[22px] tracking-[0.32px]'),
    styles.heroSubtitle,
  ];
  const forgotPasswordTextStyles = [
    tailwind.style('font-inter-medium-24 text-right'),
    styles.forgotPassword,
  ];
  const helperLinkTextStyles = [tailwind.style('text-sm'), styles.helperLink];
  const changeLanguageContainerStyle = tailwind.style('flex-row justify-center items-center mt-4');
  const scrollViewProps = {
    showsVerticalScrollIndicator: false,
    contentContainerStyle: contentContainerStyles,
  } as const;
  const bottomSheetSnapPoints = useMemo<(string | number)[]>(() => ['70%'], []);
  const bottomSheetProps = {
    backdropComponent: BottomSheetBackdrop,
    handleIndicatorStyle: tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]'),
    detached: true,
    enablePanDownToClose: true,
    animationConfigs,
    handleStyle: tailwind.style('p-0 h-4 pt-[5px]'),
    style: tailwind.style('rounded-[26px] overflow-hidden'),
    snapPoints: bottomSheetSnapPoints,
  } satisfies Partial<BottomSheetModalProps>;

  useEffect(() => {
    languagesModalSheetRef.current?.dismiss({
      overshootClamping: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocale]);

  useEffect(() => {
    // Only reset auth if "Remember Me" was not checked
    if (!rememberMe) {
      dispatch(resetAuth());
    }
    if (!installationUrl) {
      navigation.navigate('ConfigureURL' as never);
    }
  }, [installationUrl, navigation, dispatch, rememberMe]);

  // Simple fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;
    if (__DEV__) {
      console.log('[LoginScreen] Attempting login with email:', email);
    }
    dispatch(resetAuth());

    try {
      await dispatch(authActions.login({ email, password })).unwrap();
      if (__DEV__) {
        console.log('[LoginScreen] Login successful');
      }
    } catch (error) {
      if (__DEV__) {
        console.log('[LoginScreen] Login failed:', error);
      }
      // Login error is handled by Redux and displayed in the UI
    }
  };

  const openResetPassword = () => {
    navigation.navigate('ResetPassword' as never);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(previous => !previous);
  };

  const openLanguagePicker = () => {
    languagesModalSheetRef.current?.present();
  };

  const onChangeLanguage = (locale: string) => {
    dispatch(setLocale(locale));
  };

  const handleToggleRememberMe = (value: boolean) => {
    dispatch(setRememberMe(value));
  };

  return (
    <SafeAreaView edges={['top']} style={[tailwind.style('flex-1'), { backgroundColor: colors.background }]}>
      <StatusBar
        translucent
        backgroundColor={colors.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      <Animated.View style={[tailwind.style('flex-1'), { backgroundColor: colors.background, opacity: fadeAnim }]}>
        <Animated.ScrollView {...scrollViewProps}>
          {/* Hero Section */}
          <View style={heroSectionStyles}>
            <View style={styles.logoContainer}>
              <Image
                source={saraIcon}
                style={styles.logoIcon}
                resizeMode="contain"
              />
              <Animated.Text style={[styles.logoText, { color: colors.textPrimary }]}>
                Sara
              </Animated.Text>
            </View>
            <Animated.Text style={[heroTitleStyles, { color: colors.textPrimary }]}>{brandHeadline}</Animated.Text>
            <Animated.Text style={[heroSubtitleStyles, { color: colors.textSecondary }]}>{brandSubtitle}</Animated.Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Controller
              control={control}
              rules={{
                required: i18n.t('LOGIN.EMAIL_REQUIRED'),
                pattern: {
                  value: EMAIL_REGEX,
                  message: i18n.t('LOGIN.EMAIL_ERROR'),
                },
              }}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <View style={styles.inputGroup}>
                  <Animated.Text style={[tailwind.style('font-inter-420-20'), { color: colors.textPrimary }]}>
                    {i18n.t('LOGIN.EMAIL')}
                  </Animated.Text>
                  <TextInput
                    ref={ref}
                    style={[
                      tailwind.style(
                        'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                      ),
                      styles.inputField,
                      { backgroundColor: colors.backgroundLight, borderColor: colors.border, color: colors.textPrimary },
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="email@example.com"
                    placeholderTextColor={colors.textMeta}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                  />
                  {errors.email && (
                    <Animated.Text style={styles.errorText}>{errors.email.message}</Animated.Text>
                  )}
                </View>
              )}
              name="email"
            />

            <Controller
              control={control}
              rules={{
                required: i18n.t('LOGIN.PASSWORD_REQUIRED'),
                minLength: {
                  value: 6,
                  message: i18n.t('LOGIN.PASSWORD_ERROR'),
                },
              }}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <View style={[styles.inputGroup, { marginTop: 20 }]}>
                  <Animated.Text style={[tailwind.style('font-inter-420-20'), { color: colors.textPrimary }]}>
                    {i18n.t('LOGIN.PASSWORD')}
                  </Animated.Text>
                  <View style={tailwind.style('relative')}>
                    <TextInput
                      ref={node => {
                        passwordInputRef.current = node;
                        ref?.(node);
                      }}
                      style={[
                        tailwind.style(
                          'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                        ),
                        styles.inputField,
                        styles.passwordInput,
                        { backgroundColor: colors.backgroundLight, borderColor: colors.border, color: colors.textPrimary },
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textMeta}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                    <Pressable
                      style={styles.passwordToggle}
                      onPress={handleTogglePasswordVisibility}>
                      <Icon size={20} icon={showPassword ? <EyeIcon /> : <EyeSlash />} />
                    </Pressable>
                  </View>
                  {errors.password && (
                    <Animated.Text style={styles.errorText}>
                      {errors.password.message}
                    </Animated.Text>
                  )}
                </View>
              )}
              name="password"
            />

            <View style={styles.rememberMeRow}>
              <Animated.Text style={[tailwind.style('font-inter-420-20'), { color: colors.textPrimary }]}>
                {i18n.t('LOGIN.REMEMBER_ME')}
              </Animated.Text>
              <Switch
                value={rememberMe}
                onValueChange={handleToggleRememberMe}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Pressable style={styles.forgotPasswordButton} onPress={openResetPassword}>
              <Animated.Text style={[forgotPasswordTextStyles, { color: colors.accent }]}>
                {i18n.t('LOGIN.FORGOT_PASSWORD')}
              </Animated.Text>
            </Pressable>

            <View style={styles.buttonContainer}>
              <Button
                text={isLoggingIn ? i18n.t('LOGIN.LOGIN_LOADING') : i18n.t('LOGIN.LOGIN')}
                handlePress={handleSubmit(onSubmit)}
                tone="brand"
              />
            </View>

            <Pressable style={changeLanguageContainerStyle} onPress={openLanguagePicker}>
              <Animated.Text style={[helperLinkTextStyles, { color: colors.textMeta }]}>
                {i18n.t('LOGIN.CHANGE_LANGUAGE')}
              </Animated.Text>
            </Pressable>
          </View>
        </Animated.ScrollView>
      </Animated.View>
      <BottomSheetModal ref={languagesModalSheetRef} {...bottomSheetProps}>
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_LANGUAGE')} />
          <LanguageList onChangeLanguage={onChangeLanguage} currentLanguage={activeLocale} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 48,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  logoIcon: {
    width: 64,
    height: 64,
  },
  logoText: {
    fontSize: 42,
    fontFamily: 'Inter-600-20',
    letterSpacing: -0.5,
  },
  heroSection: {
    marginTop: 16,
    gap: 12,
  },
  heroTitle: {
    lineHeight: 38,
  },
  heroSubtitle: {
    lineHeight: 24,
  },
  formSection: {
    marginTop: 32,
  },
  inputGroup: {
    gap: 6,
  },
  inputField: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 14,
    top: 12,
  },
  errorText: {
    color: '#D84356',
    fontSize: 13,
    fontFamily: 'Inter-400-20',
    marginTop: 2,
  },
  rememberMeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 4,
  },
  forgotPasswordButton: {
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 24,
  },
  forgotPassword: {},
  buttonContainer: {
    marginBottom: 16,
  },
  helperLink: {},
});

export default LoginScreen;
