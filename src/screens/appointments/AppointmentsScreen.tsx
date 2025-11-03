import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, formatDistanceToNow } from 'date-fns';

import I18n from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { EmptyStateIcon } from '@/svg-icons';
import { appointmentsActions } from '@/store/appointments/appointmentsActions';
import {
  selectAppointmentsAgentId,
  selectAppointmentsError,
  selectAppointmentsLastUpdated,
  selectAppointmentsList,
  selectAppointmentsPagination,
  selectAppointmentsUiFlags,
} from '@/store/appointments/appointmentsSelectors';
import type { Appointment } from '@/store/appointments/appointmentsTypes';

const DEFAULT_LIMIT = 25;

const SARA_COLORS = {
  background: '#F8F5F3',
  textPrimary: '#16273D',
  textSecondary: '#4B5D6E',
  cardShadow: '#16273D',
  accent: '#4CB6AC',
};

const STATUS_COLORS: Record<
  string,
  {
    backgroundColor: string;
    textColor: string;
  }
> = {
  CONFIRMED: { backgroundColor: '#CCE6DE', textColor: '#0F4D49' },
  PENDING: { backgroundColor: '#FFF1D6', textColor: '#8A5A2E' },
  AWAITING_PAYMENT: { backgroundColor: '#FFE6E0', textColor: '#9F4E2F' },
  CANCELLED: { backgroundColor: '#F8E6E6', textColor: '#8A3B3B' },
  NO_SHOW: { backgroundColor: '#E5E7F2', textColor: '#3B4770' },
};

const DEFAULT_STATUS_STYLE = { backgroundColor: '#E2E6EB', textColor: '#3D4A5C' };

const formatAppointmentTime = (appointment: Appointment): string => {
  if (appointment.startAt) {
    const date = new Date(appointment.startAt);
    if (!Number.isNaN(date.getTime())) {
      return format(date, 'EEE, MMM d • HH:mm');
    }
  }
  return I18n.t('APPOINTMENTS.TIME_PLACEHOLDER');
};

const getStatusLabel = (status: string): string => {
  const key = status.toUpperCase();
  const translationKey = `APPOINTMENTS.STATUS.${key}`;
  const translated = I18n.t(translationKey);
  return translated === translationKey ? status : translated;
};

const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  const statusKey = (appointment.status || '').toUpperCase();
  const badgeStyle = STATUS_COLORS[statusKey] ?? DEFAULT_STATUS_STYLE;

  const displayName = appointment.customerName || I18n.t('APPOINTMENTS.CUSTOMER_PLACEHOLDER');
  const displayService = appointment.serviceName || I18n.t('APPOINTMENTS.SERVICE_PLACEHOLDER');

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTime}>{formatAppointmentTime(appointment)}</Text>
        <View style={[styles.statusPill, { backgroundColor: badgeStyle.backgroundColor }]}>
          <Text style={[styles.statusPillText, { color: badgeStyle.textColor }]}>
            {getStatusLabel(statusKey)}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{displayService}</Text>
      <Text style={styles.cardSubtitle}>{displayName}</Text>

      {appointment.customerPhone ? (
        <Text style={styles.cardMeta}>{appointment.customerPhone}</Text>
      ) : null}

      {appointment.location ? <Text style={styles.cardMeta}>{appointment.location}</Text> : null}

      {/* Payment badge removed – the status pill now reflects payment state */}
    </View>
  );
};

const AppointmentsScreen = () => {
  const dispatch = useAppDispatch();

  const appointments = useAppSelector(selectAppointmentsList);
  const pagination = useAppSelector(selectAppointmentsPagination);
  const uiFlags = useAppSelector(selectAppointmentsUiFlags);
  const error = useAppSelector(selectAppointmentsError);
  const lastUpdated = useAppSelector(selectAppointmentsLastUpdated);
  const loadedAgentId = useAppSelector(selectAppointmentsAgentId);
  const sessionAgentId = useAppSelector(state => state.auth.chatwootSession?.agentId ?? null);

  const bootstrappedAgentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionAgentId) {
      bootstrappedAgentRef.current = null;
      return;
    }

    const isFetching = uiFlags.isLoading || uiFlags.isRefreshing;
    if (isFetching) {
      return;
    }

    if (bootstrappedAgentRef.current === sessionAgentId) {
      return;
    }

    dispatch(appointmentsActions.fetchAppointments({ limit: DEFAULT_LIMIT }));
    bootstrappedAgentRef.current = sessionAgentId;
  }, [dispatch, sessionAgentId, uiFlags.isLoading, uiFlags.isRefreshing]);

  useEffect(() => {
    if (!sessionAgentId) {
      bootstrappedAgentRef.current = null;
    }
  }, [sessionAgentId]);

  useEffect(() => {
    if (!sessionAgentId) {
      return;
    }
    if (
      loadedAgentId &&
      sessionAgentId !== loadedAgentId &&
      !uiFlags.isLoading &&
      !uiFlags.isRefreshing
    ) {
      dispatch(appointmentsActions.fetchAppointments({ limit: DEFAULT_LIMIT }));
      bootstrappedAgentRef.current = sessionAgentId;
    }
  }, [dispatch, loadedAgentId, sessionAgentId, uiFlags.isLoading, uiFlags.isRefreshing]);

  const handleRefresh = useCallback(() => {
    if (!sessionAgentId) {
      return;
    }
    dispatch(
      appointmentsActions.fetchAppointments({
        refresh: true,
        limit: DEFAULT_LIMIT,
      }),
    );
  }, [dispatch, sessionAgentId]);

  const handleRetry = useCallback(() => {
    dispatch(
      appointmentsActions.fetchAppointments({
        refresh: true,
        limit: DEFAULT_LIMIT,
      }),
    );
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!pagination?.hasMore || !pagination.nextCursor || uiFlags.isLoadingMore) {
      return;
    }
    dispatch(
      appointmentsActions.fetchAppointments({
        append: true,
        cursor: pagination.nextCursor,
        limit: DEFAULT_LIMIT,
      }),
    );
  }, [dispatch, pagination?.hasMore, pagination?.nextCursor, uiFlags.isLoadingMore]);

  const isInitialLoading = uiFlags.isLoading && appointments.length === 0;

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) {
      return null;
    }
    const parsed = new Date(lastUpdated);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return formatDistanceToNow(parsed, { addSuffix: true });
  }, [lastUpdated]);

  const renderItem = useCallback(
    ({ item }: { item: Appointment }) => <AppointmentCard appointment={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Appointment) => item.id, []);

  const listFooter =
    uiFlags.isLoadingMore && appointments.length > 0 ? (
      <View style={styles.footer}>
        <ActivityIndicator color={SARA_COLORS.accent} />
      </View>
    ) : null;

  const emptyComponent =
    uiFlags.isLoading || uiFlags.isRefreshing ? null : (
      <View style={styles.emptyState}>
        <EmptyStateIcon stroke={SARA_COLORS.accent} />
        <Text style={styles.emptyTitle}>{I18n.t('APPOINTMENTS.EMPTY_TITLE')}</Text>
        <Text style={styles.emptySubtitle}>{I18n.t('APPOINTMENTS.EMPTY_SUBTITLE')}</Text>
      </View>
    );

  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar translucent backgroundColor={SARA_COLORS.background} barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={SARA_COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const header = (
    <View style={styles.hero}>
      <Text style={styles.title}>{I18n.t('APPOINTMENTS.TITLE')}</Text>
      {lastUpdatedLabel ? (
        <Text style={styles.updatedText}>
          {I18n.t('APPOINTMENTS.UPDATED', { time: lastUpdatedLabel })}
        </Text>
      ) : null}
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error || I18n.t('APPOINTMENTS.ERROR')}</Text>
          <TouchableOpacity onPress={handleRetry}>
            <Text style={styles.retryText}>{I18n.t('APPOINTMENTS.RETRY')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar translucent backgroundColor={SARA_COLORS.background} barStyle="dark-content" />
      <FlatList
        data={appointments}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListFooterComponent={listFooter}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshing={uiFlags.isRefreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default AppointmentsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SARA_COLORS.background,
  },
  list: {
    flex: 1,
    backgroundColor: SARA_COLORS.background,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  hero: {
    marginBottom: 16,
    gap: 8,
  },
  title: {
    color: SARA_COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  updatedText: {
    color: '#566273',
    fontSize: 13,
  },
  errorBanner: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FDEBEC',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  errorText: {
    color: '#9F3A3A',
    fontSize: 14,
    flex: 1,
  },
  retryText: {
    color: '#9F3A3A',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 16,
    shadowColor: SARA_COLORS.cardShadow,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTime: {
    color: SARA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardTitle: {
    color: SARA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: SARA_COLORS.textSecondary,
    fontSize: 15,
  },
  cardMeta: {
    color: '#6F7A85',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: SARA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtitle: {
    color: SARA_COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  footer: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
