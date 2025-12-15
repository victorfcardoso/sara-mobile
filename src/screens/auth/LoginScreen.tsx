import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
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

import {
  BottomSheetBackdrop,
  BottomSheetHeader,
  LanguageList,
  Icon,
  SaraLogo,
} from '@/components-next';
import { selectInstallationUrl, selectLocale } from '@/store/settings/settingsSelectors';
import { selectIsLoggingIn } from '@/store/auth/authSelectors';
import { setLocale } from '@/store/settings/settingsSlice';
import { useRefsContext } from '@/context/RefsContext';

type FormData = {
  email: string;
  password: string;
};

// Sara brand colors
const colors = {
  background: '#F8F5F3',
  surface: '#FFFFFF',
  accent: '#4CB6AC',
  accentLight: '#E6F5F4',
  accentMuted: 'rgba(76, 182, 172, 0.15)',
  textPrimary: '#16273D',
  textSecondary: '#4B5D6E',
  textMeta: '#6C778A',
  border: '#E6E2DD',
  borderFocus: '#4CB6AC',
  inputBorder: '#D1CCC6',
  error: '#D84356',
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-20)).current;
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineTranslateY = useRef(new Animated.Value(20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const orbScale = useRef(new Animated.Value(0.8)).current;
  const orbOpacity = useRef(new Animated.Value(0)).current;

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

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const dispatch = useAppDispatch();
  const isLoggingIn = useAppSelector(selectIsLoggingIn);

  const installationUrl = useAppSelector(selectInstallationUrl);
  const activeLocale = useAppSelector(selectLocale);

  const isPortuguese = i18n.locale?.toLowerCase().startsWith('pt');
  const brandHeadline = isPortuguese
    ? 'Assistente WhatsApp\npara agendamentos'
    : 'WhatsApp assistant\nfor scheduling';
  const brandSubtitle = isPortuguese
    ? 'Agende consultas, confirme por WhatsApp e aceite pagamentos.'
    : 'Schedule visits, confirm over WhatsApp, and accept payments.';

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

  // Run entrance animations on mount
  useEffect(() => {
    const staggerDelay = 120;

    // Decorative orb animation
    Animated.parallel([
      Animated.timing(orbOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(orbScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoTranslateY, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Headline entrance (staggered)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(headlineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(headlineTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, staggerDelay);

    // Form entrance (staggered further)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(formTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, staggerDelay * 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    languagesModalSheetRef.current?.dismiss({
      overshootClamping: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocale]);

  useEffect(() => {
    dispatch(resetAuth());
    if (!installationUrl) {
      navigation.navigate('ConfigureURL' as never);
    }
  }, [installationUrl, navigation, dispatch]);

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;
    dispatch(resetAuth());

    try {
      await dispatch(authActions.login({ email, password })).unwrap();
    } catch {
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar translucent backgroundColor={colors.background} barStyle="dark-content" />

      {/* Decorative orb - top right */}
      <Animated.View
        style={[
          styles.decorativeOrb,
          {
            opacity: orbOpacity,
            transform: [{ scale: orbScale }],
          },
        ]}
      />

      {/* Secondary orb - bottom left */}
      <Animated.View
        style={[
          styles.decorativeOrbSecondary,
          {
            opacity: orbOpacity,
            transform: [{ scale: orbScale }],
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            {/* Logo Section */}
            <Animated.View
              style={[
                styles.logoSection,
                {
                  opacity: logoOpacity,
                  transform: [{ translateY: logoTranslateY }],
                },
              ]}>
              <SaraLogo variant="wordmark" size={56} />
            </Animated.View>

            {/* Hero Section */}
            <Animated.View
              style={[
                styles.heroSection,
                {
                  opacity: headlineOpacity,
                  transform: [{ translateY: headlineTranslateY }],
                },
              ]}>
              <Animated.Text style={styles.headline}>{brandHeadline}</Animated.Text>
              <Animated.Text style={styles.subtitle}>{brandSubtitle}</Animated.Text>
            </Animated.View>

            {/* Form Card */}
            <Animated.View
              style={[
                styles.formCard,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                },
              ]}>
              {/* Email Field */}
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
                  <View style={styles.fieldContainer}>
                    <Animated.Text style={styles.fieldLabel}>{i18n.t('LOGIN.EMAIL')}</Animated.Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        emailFocused && styles.inputWrapperFocused,
                        errors.email && styles.inputWrapperError,
                      ]}>
                      <TextInput
                        ref={ref}
                        style={styles.textInput}
                        onBlur={() => {
                          setEmailFocused(false);
                          onBlur();
                        }}
                        onFocus={() => setEmailFocused(true)}
                        onChangeText={onChange}
                        value={value}
                        placeholder={isPortuguese ? 'seu@email.com' : 'you@email.com'}
                        placeholderTextColor={colors.textMeta}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                      />
                    </View>
                    {errors.email && (
                      <Animated.Text style={styles.errorText}>{errors.email.message}</Animated.Text>
                    )}
                  </View>
                )}
                name="email"
              />

              {/* Password Field */}
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
                  <View style={styles.fieldContainer}>
                    <Animated.Text style={styles.fieldLabel}>
                      {i18n.t('LOGIN.PASSWORD')}
                    </Animated.Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        passwordFocused && styles.inputWrapperFocused,
                        errors.password && styles.inputWrapperError,
                      ]}>
                      <TextInput
                        ref={node => {
                          passwordInputRef.current = node;
                          ref?.(node);
                        }}
                        style={[styles.textInput, styles.passwordInput]}
                        onBlur={() => {
                          setPasswordFocused(false);
                          onBlur();
                        }}
                        onFocus={() => setPasswordFocused(true)}
                        onChangeText={onChange}
                        value={value}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textMeta}
                        secureTextEntry={!showPassword}
                        autoComplete="password"
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit(onSubmit)}
                      />
                      <Pressable
                        style={styles.passwordToggle}
                        onPress={handleTogglePasswordVisibility}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Icon
                          size={20}
                          icon={showPassword ? <EyeIcon /> : <EyeSlash />}
                          color={colors.textMeta}
                        />
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

              {/* Forgot Password Link */}
              <Pressable
                style={styles.forgotPasswordContainer}
                onPress={openResetPassword}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Animated.Text style={styles.forgotPasswordText}>
                  {i18n.t('LOGIN.FORGOT_PASSWORD')}
                </Animated.Text>
              </Pressable>

              {/* Login Button */}
              <Pressable
                style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed]}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoggingIn}>
                <Animated.Text style={styles.loginButtonText}>
                  {isLoggingIn ? i18n.t('LOGIN.LOGIN_LOADING') : i18n.t('LOGIN.LOGIN')}
                </Animated.Text>
              </Pressable>
            </Animated.View>

            {/* Change Language Link */}
            <Animated.View
              style={[
                styles.languageContainer,
                {
                  opacity: formOpacity,
                },
              ]}>
              <Pressable
                style={styles.languageButton}
                onPress={openLanguagePicker}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Animated.Text style={styles.languageText}>
                  {i18n.t('LOGIN.CHANGE_LANGUAGE')}
                </Animated.Text>
              </Pressable>
            </Animated.View>
          </Animated.ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  // Decorative elements
  decorativeOrb: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(76, 182, 172, 0.12)',
  },
  decorativeOrbSecondary: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(76, 182, 172, 0.08)',
  },
  // Logo section
  logoSection: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  // Hero section
  heroSection: {
    marginBottom: 32,
  },
  headline: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: 'Inter-600-20',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-400-20',
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  // Form card
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Inter-500-24',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
  },
  inputWrapperFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  textInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-400-20',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Inter-400-20',
    color: colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-500-24',
    color: colors.accent,
    letterSpacing: 0.1,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-600-20',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  // Language section
  languageContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  languageText: {
    fontSize: 14,
    fontFamily: 'Inter-400-20',
    color: colors.textMeta,
    letterSpacing: 0.2,
  },
});

export default LoginScreen;
