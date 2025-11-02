import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Image, Pressable, StatusBar, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
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
  Button,
  Icon,
} from '@/components-next';
import { selectInstallationUrl, selectLocale } from '@/store/settings/settingsSelectors';
import { selectIsLoggingIn } from '@/store/auth/authSelectors';
import { setLocale } from '@/store/settings/settingsSlice';
import { useRefsContext } from '@/context/RefsContext';

type FormData = {
  email: string;
  password: string;
};

const LoginScreen = () => {
  const navigation = useNavigation();
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
    ? 'Assistente WhatsApp para agendamentos'
    : 'WhatsApp assistant for scheduling';
  const brandSubtitle = isPortuguese
    ? 'Agende consultas, confirme por WhatsApp e aceite pagamentos. Tudo com a Sara AI.'
    : 'Schedule visits, confirm over WhatsApp, and accept payments. All with Sara AI.';

  const contentContainerStyles = [tailwind.style('px-6 pt-24'), styles.contentContainer];
  const heroSectionStyles = [tailwind.style('pt-6 gap-4'), styles.heroSection];
  const heroTitleStyles = [tailwind.style('text-3xl font-inter-semibold-20'), styles.heroTitle];
  const heroSubtitleStyles = [
    tailwind.style('font-inter-normal-20 leading-[22px] tracking-[0.32px]'),
    styles.heroSubtitle,
  ];
  const passwordToggleStyle = tailwind.style('absolute right-4 top-2.5');
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
  const bottomSheetProps = {
    backdropComponent: BottomSheetBackdrop,
    handleIndicatorStyle: tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]'),
    detached: true,
    enablePanDownToClose: true,
    animationConfigs,
    handleStyle: tailwind.style('p-0 h-4 pt-[5px]'),
    style: tailwind.style('rounded-[26px] overflow-hidden'),
    snapPoints: ['70%'] as const,
  } as const;

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
    // Clear any existing auth state before login
    dispatch(resetAuth());

    try {
      await dispatch(authActions.login({ email, password })).unwrap();
      // Successful login will switch navigation via Redux state listeners
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

  return (
    <SafeAreaView edges={['top']} style={[tailwind.style('flex-1'), styles.container]}>
      <StatusBar translucent backgroundColor="#F8F5F3" barStyle="dark-content" />
      <View style={[tailwind.style('flex-1'), styles.container]}>
        <Animated.ScrollView {...scrollViewProps}>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
            source={require('@/assets/images/sara_wordmark.png')}
            style={styles.wordmark}
            resizeMode="contain"
          />
          <View style={heroSectionStyles}>
            <Animated.Text style={heroTitleStyles}>{brandHeadline}</Animated.Text>
            <Animated.Text style={heroSubtitleStyles}>{brandSubtitle}</Animated.Text>
          </View>
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
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={tailwind.style('pt-2 gap-2')}>
                  <Animated.Text style={[tailwind.style('font-inter-420-20'), styles.label]}>
                    {i18n.t('LOGIN.EMAIL')}
                  </Animated.Text>
                  <TextInput
                    style={[
                      tailwind.style(
                        'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                        'py-2 px-3 rounded-xl',
                        'h-10',
                      ),
                      styles.inputField,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor="#6C778A"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email && (
                    <Animated.Text style={tailwind.style('font-inter-normal-20 text-ruby-900')}>
                      {errors.email.message}
                    </Animated.Text>
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
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={tailwind.style('pt-8 gap-2')}>
                  <Animated.Text style={[tailwind.style('font-inter-420-20'), styles.label]}>
                    {i18n.t('LOGIN.PASSWORD')}
                  </Animated.Text>
                  <View style={tailwind.style('relative')}>
                    <TextInput
                      style={[
                        tailwind.style(
                          'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px] android:leading-[18px]',
                          'py-2 pl-3 pr-10 rounded-xl',
                          'h-10',
                        ),
                        styles.inputField,
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholderTextColor="#6C778A"
                      secureTextEntry={!showPassword}
                    />
                    <Pressable style={passwordToggleStyle} onPress={handleTogglePasswordVisibility}>
                      <Icon size={20} icon={showPassword ? <EyeIcon /> : <EyeSlash />} />
                    </Pressable>
                  </View>
                  {errors.password && (
                    <Animated.Text style={tailwind.style('text-ruby-900')}>
                      {errors.password.message}
                    </Animated.Text>
                  )}
                </View>
              )}
              name="password"
            />

            <Pressable style={tailwind.style('pt-1 mb-8')} onPress={openResetPassword}>
              <Animated.Text style={forgotPasswordTextStyles}>
                {i18n.t('LOGIN.FORGOT_PASSWORD')}
              </Animated.Text>
            </Pressable>

            <Button
              text={isLoggingIn ? i18n.t('LOGIN.LOGIN_LOADING') : i18n.t('LOGIN.LOGIN')}
              handlePress={handleSubmit(onSubmit)}
              tone="brand"
            />

            <Pressable style={changeLanguageContainerStyle} onPress={openLanguagePicker}>
              <Animated.Text style={helperLinkTextStyles}>
                {i18n.t('LOGIN.CHANGE_LANGUAGE')}
              </Animated.Text>
            </Pressable>
          </View>
        </Animated.ScrollView>
      </View>
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
    backgroundColor: '#F8F5F3',
  },
  contentContainer: {
    paddingBottom: 48,
  },
  wordmark: {
    width: 216,
    height: 64,
  },
  heroSection: {
    marginTop: 8,
  },
  heroTitle: {
    color: '#16273D',
  },
  heroSubtitle: {
    color: '#4B5D6E',
  },
  formSection: {
    marginTop: 32,
  },
  label: {
    color: '#16273D',
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCE6DE',
    color: '#16273D',
  },
  forgotPassword: {
    color: '#4CB6AC',
  },
  helperLink: {
    color: '#566273',
  },
});

export default LoginScreen;
