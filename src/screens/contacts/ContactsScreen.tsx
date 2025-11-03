import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  SectionListData,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { differenceInHours, format, isSameDay } from 'date-fns';
import { StackActions, useNavigation } from '@react-navigation/native';

import I18n from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { SearchBar } from '@/components-next/common/search/SearchBar';
import { Avatar } from '@/components-next/common/avatar/Avatar';
import { crmCustomersActions } from '@/store/crm-customers';
import {
  selectCrmCustomers,
  selectCrmCustomersError,
  selectCrmCustomersPagination,
  selectCrmCustomersSearchQuery,
  selectCrmCustomersUiFlags,
} from '@/store/crm-customers/crmCustomersSelectors';
import type { CrmCustomer } from '@/store/crm-customers/crmCustomersTypes';
import { selectAppointmentsList } from '@/store/appointments/appointmentsSelectors';
import type { Appointment } from '@/store/appointments/appointmentsTypes';
import { selectAllConversations } from '@/store/conversation/conversationSelectors';
import type { Conversation } from '@/types';
import { showToast } from '@/utils/toastUtils';

const SARA_COLORS = {
  background: '#F8F5F3',
  card: '#FFFFFF',
  textPrimary: '#16273D',
  textSecondary: '#4B5D6E',
  muted: '#8D9AA8',
  accent: '#4CB6AC',
  divider: '#E7E2DD',
  badgeAmberBg: '#FFEBD6',
  badgeAmberText: '#8A5A2E',
  badgeTealBg: '#CCE6DE',
  badgeTealText: '#0F4D49',
};

type ContactFilter = 'all' | 'has-thread' | 'upcoming';

type ContactSectionItem = {
  contact: CrmCustomer;
  upcomingAppointment?: Appointment | null;
  sectionId: string;
};

type ContactSection = SectionListData<ContactSectionItem> & {
  title?: string;
  key: string;
};

const normalizePhone = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }
  const digits = value.replace(/[^0-9+]/g, '');
  return digits.length ? digits : null;
};

const getContactDisplayName = (contact: CrmCustomer): string => {
  return contact.fullName || contact.whatsappPhone || I18n.t('CONTACTS.UNKNOWN_NAME');
};

const formatPhoneForDisplay = (value?: string | null): string => {
  if (!value) {
    return I18n.t('CONTACTS.UNKNOWN_PHONE');
  }
  return value;
};

const isTemplateRequired = (contact: CrmCustomer): boolean => {
  if (!contact.threadId) {
    return false;
  }
  if (!contact.latestSeen) {
    return true;
  }
  const lastSeen = new Date(contact.latestSeen);
  if (Number.isNaN(lastSeen.getTime())) {
    return false;
  }
  return differenceInHours(new Date(), lastSeen) >= 24;
};

const toDateOrNull = (value?: string | null): Date | null => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatUpcomingLabel = (appointment: Appointment): string => {
  if (!appointment.startAt) {
    return I18n.t('CONTACTS.UPCOMING_PLACEHOLDER');
  }
  const date = new Date(appointment.startAt);
  if (Number.isNaN(date.getTime())) {
    return I18n.t('CONTACTS.UPCOMING_PLACEHOLDER');
  }
  const timeLabel = format(date, 'HH:mm');
  const service = appointment.serviceName || I18n.t('CONTACTS.SERVICE_PLACEHOLDER');
  return `${timeLabel} • ${service}`;
};

const buildAppointmentIndex = (appointments: Appointment[]): Map<string, Appointment> => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const index = new Map<string, Appointment>();

  appointments.forEach(appointment => {
    if (!appointment.startAt) {
      return;
    }
    const date = new Date(appointment.startAt);
    if (Number.isNaN(date.getTime())) {
      return;
    }
    if (date < startOfDay || date > endOfDay) {
      return;
    }
    const phone = normalizePhone(appointment.customerPhone);
    if (!phone) {
      return;
    }
    const existing = index.get(phone);
    if (!existing) {
      index.set(phone, appointment);
      return;
    }
    const existingDate = new Date(existing.startAt ?? '');
    if (Number.isNaN(existingDate.getTime()) || date < existingDate) {
      index.set(phone, appointment);
    }
  });

  return index;
};

const buildSections = (
  contacts: CrmCustomer[],
  filter: ContactFilter,
  searchQuery: string,
  upcomingIndex: Map<string, Appointment>,
): ContactSection[] => {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filtered = contacts.filter(contact => {
    const nameMatch = getContactDisplayName(contact).toLowerCase().includes(normalizedSearch);
    const phone = contact.whatsappPhone ?? '';
    const phoneDigits = phone.replace(/\D/g, '');
    const searchDigits = normalizedSearch.replace(/\D/g, '');
    const phoneMatch =
      phone.toLowerCase().includes(normalizedSearch) ||
      (searchDigits.length > 0 && phoneDigits.includes(searchDigits));

    if (normalizedSearch && !nameMatch && !phoneMatch) {
      return false;
    }
    if (filter === 'has-thread' && !contact.threadId) {
      return false;
    }
    if (filter === 'upcoming') {
      const phoneKey = normalizePhone(contact.whatsappPhone);
      return phoneKey ? upcomingIndex.has(phoneKey) : false;
    }
    return true;
  });

  const recents = filtered
    .filter(contact => contact.latestSeen)
    .map(contact => ({ contact, date: toDateOrNull(contact.latestSeen) }))
    .filter(item => item.date)
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
    .slice(0, 3)
    .map(item => ({ contact: item.contact, upcomingAppointment: null, sectionId: 'recents' }));

  const upcomingToday = filtered
    .map(contact => {
      const phone = normalizePhone(contact.whatsappPhone);
      if (!phone || !upcomingIndex.has(phone)) {
        return null;
      }
      const appointment = upcomingIndex.get(phone) ?? null;
      return appointment
        ? {
            contact,
            appointmentDate: toDateOrNull(appointment.startAt),
            upcomingAppointment: appointment,
          }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => {
      const dateA = a?.appointmentDate?.getTime() ?? 0;
      const dateB = b?.appointmentDate?.getTime() ?? 0;
      return dateA - dateB;
    })
    .map(item => ({
      contact: item!.contact,
      upcomingAppointment:
        (item as { upcomingAppointment?: Appointment | null }).upcomingAppointment ?? null,
      sectionId: 'upcoming',
    }));

  const alphabeticallySorted = filtered
    .slice()
    .sort((a, b) => getContactDisplayName(a).localeCompare(getContactDisplayName(b)));

  const alphabeticalSectionsMap = new Map<string, ContactSectionItem[]>();
  alphabeticallySorted.forEach(contact => {
    const label = getContactDisplayName(contact).charAt(0).toUpperCase() || '#';
    if (!alphabeticalSectionsMap.has(label)) {
      alphabeticalSectionsMap.set(label, []);
    }
    const phone = normalizePhone(contact.whatsappPhone);
    const appointment = phone ? (upcomingIndex.get(phone) ?? null) : null;
    alphabeticalSectionsMap.get(label)?.push({
      contact,
      upcomingAppointment: appointment,
      sectionId: `alpha-${label}`,
    });
  });

  const sections: ContactSection[] = [];

  if (!normalizedSearch && recents.length > 0) {
    sections.push({
      key: 'recents',
      title: I18n.t('CONTACTS.SECTIONS.RECENTS'),
      data: recents,
    });
  }

  if (!normalizedSearch && upcomingToday.length > 0) {
    sections.push({
      key: 'upcoming',
      title: I18n.t('CONTACTS.SECTIONS.UPCOMING_TODAY'),
      data: upcomingToday,
    });
  }

  const alphabeticalSections = Array.from(alphabeticalSectionsMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([letter, data]) => ({ key: `alpha-${letter}`, title: letter, data }));

  sections.push(...alphabeticalSections);

  return sections;
};

export const ContactsScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const contacts = useAppSelector(selectCrmCustomers) as CrmCustomer[];
  const uiFlags = useAppSelector(selectCrmCustomersUiFlags);
  const pagination = useAppSelector(selectCrmCustomersPagination);
  const error = useAppSelector(selectCrmCustomersError);
  const serverSearchQuery = useAppSelector(selectCrmCustomersSearchQuery);
  const appointments = useAppSelector(selectAppointmentsList);
  const conversations = useAppSelector(selectAllConversations);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContactFilter>('all');

  const hasInitialized = useRef(false);
  const upcomingIndex = useMemo(() => buildAppointmentIndex(appointments), [appointments]);
  const conversationByPhone = useMemo(() => {
    const map = new Map<string, Conversation>();
    conversations.forEach(conversation => {
      const sender = conversation.meta?.sender;
      if (!sender) {
        return;
      }

      const customPhone =
        sender.customAttributes && typeof sender.customAttributes === 'object'
          ? normalizePhone((sender.customAttributes['phone_number'] as string) ?? null)
          : null;

      const candidates = [
        normalizePhone(sender.phoneNumber ?? null),
        normalizePhone((sender.identifier as string | null) ?? null),
        customPhone,
      ].filter(Boolean) as string[];

      candidates.forEach(candidate => {
        if (candidate && !map.has(candidate)) {
          map.set(candidate, conversation);
        }
      });
    });
    return map;
  }, [conversations]);

  useEffect(() => {
    if (!hasInitialized.current) {
      dispatch(crmCustomersActions.fetchCustomers(undefined));
      hasInitialized.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery === serverSearchQuery) {
      return;
    }
    const handler = setTimeout(() => {
      dispatch(crmCustomersActions.fetchCustomers({ search: searchQuery, refresh: true }));
    }, 300);
    return () => clearTimeout(handler);
  }, [dispatch, searchQuery, serverSearchQuery]);

  const sections = useMemo(
    () => buildSections(contacts, activeFilter, searchQuery, upcomingIndex),
    [contacts, activeFilter, searchQuery, upcomingIndex],
  );

  const isInitialLoading = uiFlags.isLoading && contacts.length === 0;
  const showEmptyState = !isInitialLoading && contacts.length === 0 && !error;

  const handleRefresh = useCallback(() => {
    dispatch(crmCustomersActions.fetchCustomers({ refresh: true, search: searchQuery }));
  }, [dispatch, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (!pagination?.hasMore || uiFlags.isLoadingMore) {
      return;
    }
    dispatch(crmCustomersActions.fetchCustomers({ append: true, search: searchQuery }));
  }, [dispatch, pagination?.hasMore, searchQuery, uiFlags.isLoadingMore]);

  const handleFilterChange = useCallback((value: ContactFilter) => {
    setActiveFilter(value);
  }, []);

  const renderSectionHeader = useCallback(({ section }: { section: ContactSection }) => {
    if (!section.title) {
      return null;
    }
    return (
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ContactSectionItem }) => {
      const { contact, upcomingAppointment, sectionId } = item;
      const displayName = getContactDisplayName(contact);
      const phoneLabel = formatPhoneForDisplay(contact.whatsappPhone);
      const templateRequired = isTemplateRequired(contact);
      const lastInteractionDate = toDateOrNull(contact.latestSeen);

      const upcomingLabel = upcomingAppointment ? formatUpcomingLabel(upcomingAppointment) : null;
      const showThreadBadge = Boolean(contact.threadId);

      const handlePress = () => {
        const phoneKey = normalizePhone(contact.whatsappPhone);
        const conversation = phoneKey ? conversationByPhone.get(phoneKey) : undefined;
        if (conversation) {
          const action = StackActions.push('ChatScreen', {
            conversationId: conversation.id,
            isConversationOpenedExternally: false,
          });
          navigation.dispatch(action);
          return;
        }
        showToast({ message: I18n.t('CONTACTS.NO_THREAD') });
      };

      return (
        <Pressable
          style={({ pressed }) => [styles.rowContainer, pressed && styles.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel={displayName}
          onPress={handlePress}
          key={`${sectionId}-${contact.id}`}>
          <Avatar size="lg" name={displayName} src={undefined} style={styles.avatar} />
          <View style={styles.rowContent}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowName} numberOfLines={1}>
                {displayName}
              </Text>
              {showThreadBadge ? <View style={styles.threadDot} /> : null}
              {templateRequired ? (
                <View style={styles.templateBadge}>
                  <Text style={styles.templateBadgeText}>{I18n.t('CONTACTS.BADGE_TEMPLATE')}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.rowPhone}>{phoneLabel}</Text>
            {upcomingLabel ? <Text style={styles.rowUpcoming}>{upcomingLabel}</Text> : null}
            {lastInteractionDate ? (
              <Text style={styles.rowMeta}>
                {isSameDay(lastInteractionDate, new Date())
                  ? I18n.t('CONTACTS.LAST_SEEN_TODAY', {
                      time: format(lastInteractionDate, 'HH:mm'),
                    })
                  : I18n.t('CONTACTS.LAST_SEEN_DATE', {
                      date: format(lastInteractionDate, 'dd MMM yyyy, HH:mm'),
                    })}
              </Text>
            ) : null}
          </View>
        </Pressable>
      );
    },
    [conversationByPhone, navigation],
  );

  const keyExtractor = useCallback(
    (item: ContactSectionItem, index: number) => `${item.sectionId}-${item.contact.id}-${index}`,
    [],
  );

  const listEmptyComponent = useMemo(() => {
    if (isInitialLoading) {
      return null;
    }
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{I18n.t('CONTACTS.ERROR_TITLE')}</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
        </View>
      );
    }
    if (showEmptyState) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{I18n.t('CONTACTS.EMPTY_TITLE')}</Text>
          <Text style={styles.emptySubtitle}>{I18n.t('CONTACTS.EMPTY_SUBTITLE')}</Text>
        </View>
      );
    }
    return null;
  }, [error, isInitialLoading, showEmptyState]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar translucent backgroundColor={SARA_COLORS.background} barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{I18n.t('CONTACTS.TITLE')}</Text>
        </View>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={I18n.t('CONTACTS.SEARCH_PLACEHOLDER')}
        />
        <View style={styles.filterRow}>
          <FilterChip
            label={I18n.t('CONTACTS.FILTER_ALL')}
            isActive={activeFilter === 'all'}
            onPress={() => handleFilterChange('all')}
          />
          <FilterChip
            label={I18n.t('CONTACTS.FILTER_HAS_THREAD')}
            isActive={activeFilter === 'has-thread'}
            onPress={() => handleFilterChange('has-thread')}
          />
          <FilterChip
            label={I18n.t('CONTACTS.FILTER_UPCOMING')}
            isActive={activeFilter === 'upcoming'}
            onPress={() => handleFilterChange('upcoming')}
          />
        </View>
      </View>
      {isInitialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={SARA_COLORS.accent} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={uiFlags.isRefreshing}
              onRefresh={handleRefresh}
              tintColor={SARA_COLORS.accent}
              colors={[SARA_COLORS.accent]}
            />
          }
          ListFooterComponent={
            uiFlags.isLoadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator color={SARA_COLORS.accent} />
              </View>
            ) : null
          }
          ListEmptyComponent={listEmptyComponent}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

type FilterChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

const FilterChip = ({ label, isActive, onPress }: FilterChipProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        isActive && styles.filterChipActive,
        pressed && styles.filterChipPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={label}>
      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SARA_COLORS.background,
  },
  headerContainer: {
    backgroundColor: SARA_COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-580-24',
    color: SARA_COLORS.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#E7E2DD',
  },
  filterChipActive: {
    backgroundColor: SARA_COLORS.textPrimary,
  },
  filterChipPressed: {
    opacity: 0.85,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter-500-24',
    color: SARA_COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 24,
    backgroundColor: SARA_COLORS.background,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: SARA_COLORS.background,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontFamily: 'Inter-420-20',
    color: SARA_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: SARA_COLORS.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SARA_COLORS.divider,
  },
  rowPressed: {
    backgroundColor: '#F1EBE4',
  },
  avatar: {
    marginRight: 16,
  },
  rowContent: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-500-24',
    color: SARA_COLORS.textPrimary,
  },
  threadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SARA_COLORS.accent,
  },
  templateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: SARA_COLORS.badgeAmberBg,
    marginLeft: 6,
  },
  templateBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-420-20',
    color: SARA_COLORS.badgeAmberText,
  },
  rowPhone: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: 'Inter-420-20',
    color: SARA_COLORS.textSecondary,
  },
  rowUpcoming: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: 'Inter-420-20',
    color: SARA_COLORS.badgeTealText,
    backgroundColor: SARA_COLORS.badgeTealBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rowMeta: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'Inter-400-20',
    color: SARA_COLORS.muted,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreContainer: {
    paddingVertical: 16,
  },
  emptyContainer: {
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-500-24',
    color: SARA_COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-420-20',
    color: SARA_COLORS.textSecondary,
    textAlign: 'center',
  },
});
