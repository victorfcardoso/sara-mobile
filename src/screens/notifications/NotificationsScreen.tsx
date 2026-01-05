import React, { useMemo, useState } from 'react';
import { FlatList, ListRenderItem, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { getNotificationColors, NotificationColors, TYPE_STYLES } from './constants';
import { NotificationDetailView } from './NotificationDetailView';
import { NotificationDetail, NotificationSummary } from './types';
import { NotificationGlyph } from './NotificationGlyph';
import { useIsDarkMode } from '@/hooks/useSaraColors';

type DetailLookup = Record<string, NotificationDetail>;

const mockNotifications: NotificationSummary[] = [
  {
    id: '1',
    type: 'handoff',
    title: 'Handoff to human',
    description: 'Customer requested to speak with an agent',
    time: '10m ago',
    customerName: 'Victor Cardoso',
  },
  {
    id: '2',
    type: 'confirmation',
    title: 'Needs confirmation',
    description: 'Appointment awaiting approval',
    time: '25m ago',
    customerName: 'Maria Silva',
  },
  {
    id: '3',
    type: 'payment',
    title: 'Awaiting payment',
    description: 'Payment link sent',
    time: '1h ago',
    customerName: 'João Santos',
  },
  {
    id: '4',
    type: 'handoff',
    title: 'Handoff to human',
    description: 'Bot could not understand customer request',
    time: '2h ago',
    customerName: 'Ana Costa',
  },
  {
    id: '5',
    type: 'confirmation',
    title: 'Needs confirmation',
    description: 'Rescheduling request pending',
    time: '3h ago',
    customerName: 'Bruno Lima',
  },
];

const mockDetailedNotifications: DetailLookup = {
  '1': {
    id: '1',
    type: 'handoff',
    title: 'Handoff to human',
    description: 'Customer requested to speak with an agent',
    time: '10m ago',
    timestamp: '2025-11-04T13:50:00Z',
    customerName: 'Victor Cardoso',
    customerPhone: '+55 71 99649-1359',
    priority: 'high',
    context: {
      conversationId: 'conv_123',
      lastMessage:
        'I need to speak with someone about changing my appointment time. The bot is not understanding me.',
      agentNotes: 'Customer has rescheduled 2 times in the past month',
    },
    relatedActions: [
      {
        id: 'a1',
        label: 'Customer requested human agent',
        timestamp: '10m ago',
      },
      {
        id: 'a2',
        label: 'Bot attempted to help with rescheduling',
        timestamp: '12m ago',
      },
      {
        id: 'a3',
        label: 'Customer started conversation',
        timestamp: '15m ago',
      },
    ],
  },
  '2': {
    id: '2',
    type: 'confirmation',
    title: 'Needs confirmation',
    description: 'Appointment awaiting approval',
    time: '25m ago',
    timestamp: '2025-11-04T13:35:00Z',
    customerName: 'Maria Silva',
    customerPhone: '+55 71 98765-4321',
    priority: 'medium',
    context: {
      conversationId: 'conv_124',
      appointmentId: 'apt_456',
      appointmentDate: '2025-11-06T14:00:00Z',
      appointmentService: 'Consulta de rotina',
      lastMessage: 'Is Wednesday at 2pm available?',
    },
    relatedActions: [
      {
        id: 'b1',
        label: 'Proposed appointment time',
        timestamp: '25m ago',
      },
      {
        id: 'b2',
        label: 'Customer requested new appointment',
        timestamp: '30m ago',
      },
    ],
  },
  '3': {
    id: '3',
    type: 'payment',
    title: 'Awaiting payment',
    description: 'Payment link sent',
    time: '1h ago',
    timestamp: '2025-11-04T13:00:00Z',
    customerName: 'João Santos',
    customerPhone: '+55 11 98765-4321',
    priority: 'medium',
    context: {
      conversationId: 'conv_125',
      appointmentId: 'apt_789',
      appointmentDate: '2025-11-05T10:00:00Z',
      appointmentService: 'Consulta especializada',
      paymentAmount: 'R$ 150,00',
      lastMessage: 'I will pay now',
    },
    relatedActions: [
      {
        id: 'c1',
        label: 'Payment link sent',
        timestamp: '1h ago',
      },
      {
        id: 'c2',
        label: 'Customer confirmed appointment',
        timestamp: '1h 15m ago',
      },
    ],
  },
  '4': {
    id: '4',
    type: 'handoff',
    title: 'Handoff to human',
    description: 'Bot could not understand customer request',
    time: '2h ago',
    timestamp: '2025-11-04T12:00:00Z',
    customerName: 'Ana Costa',
    customerPhone: '+55 71 99876-5432',
    priority: 'high',
    context: {
      conversationId: 'conv_126',
      lastMessage: 'Can I get a bulk discount for multiple appointments?',
    },
    relatedActions: [
      {
        id: 'd1',
        label: 'Bot escalated to human',
        timestamp: '2h ago',
      },
    ],
  },
  '5': {
    id: '5',
    type: 'confirmation',
    title: 'Needs confirmation',
    description: 'Rescheduling request pending',
    time: '3h ago',
    timestamp: '2025-11-04T11:00:00Z',
    customerName: 'Bruno Lima',
    customerPhone: '+55 11 99123-4567',
    priority: 'low',
    context: {
      conversationId: 'conv_127',
      appointmentId: 'apt_101',
      appointmentDate: '2025-11-08T16:00:00Z',
      appointmentService: 'Retorno',
      lastMessage: 'Can we move it to Friday instead?',
    },
    relatedActions: [
      {
        id: 'e1',
        label: 'Requested to reschedule',
        timestamp: '3h ago',
      },
    ],
  },
};

type NotificationsHeaderProps = {
  colors: NotificationColors;
};

const NotificationsHeader = ({ colors }: NotificationsHeaderProps) => {
  return (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Activity</Text>
      <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Items requiring attention</Text>
    </View>
  );
};

type NotificationCardProps = {
  notification: NotificationSummary;
  onSelect: (notificationId: string) => void;
  colors: NotificationColors;
};

const NotificationCard = ({ notification, onSelect, colors }: NotificationCardProps) => {
  const typeStyle = TYPE_STYLES[notification.type];
  const handlePress = () => onSelect(notification.id);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button">
      <View style={[styles.iconContainer, { backgroundColor: typeStyle.badgeBackground }]}>
        <NotificationGlyph type={notification.type} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{notification.title}</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{notification.description}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.metaCustomer, { color: colors.textPrimary }]}>{notification.customerName}</Text>
          <View style={[styles.metaSeparator, { backgroundColor: colors.textSecondary }]} />
          <Text style={[styles.metaTime, { color: colors.muted }]}>{notification.time}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const isDark = useIsDarkMode();
  const colors = getNotificationColors(isDark);
  const [selectedNotification, setSelectedNotification] = useState<NotificationDetail | null>(null);

  const detailLookup = useMemo(() => mockDetailedNotifications, []);

  const handleSelect = (notificationId: string) => {
    const detail = detailLookup[notificationId];
    if (detail) {
      setSelectedNotification(detail);
    }
  };

  if (selectedNotification) {
    return (
      <NotificationDetailView
        notification={selectedNotification}
        onBack={() => setSelectedNotification(null)}
        onResolve={() => {
          console.log('Resolved notification:', selectedNotification.id);
          setSelectedNotification(null);
        }}
        onDismiss={() => {
          console.log('Dismissed notification:', selectedNotification.id);
          setSelectedNotification(null);
        }}
      />
    );
  }

  const renderItem: ListRenderItem<NotificationSummary> = ({ item }) => (
    <NotificationCard notification={item} onSelect={handleSelect} colors={colors} />
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { paddingTop: Math.max(insets.top, 12), backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <FlatList
        data={mockNotifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={renderItem}
        ListHeaderComponent={<NotificationsHeader colors={colors} />}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
  },
  separator: {
    height: 16,
  },
  header: {
    marginBottom: 16,
    gap: 4,
  },
  headerTitle: {
    fontFamily: 'inter-semibold-20',
    fontSize: 24,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: 'inter-420-20',
    fontSize: 15,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 1,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontFamily: 'inter-semibold-20',
    fontSize: 17,
  },
  cardDescription: {
    fontFamily: 'inter-420-20',
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaCustomer: {
    fontFamily: 'inter-medium-24',
    fontSize: 13,
  },
  metaSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.4,
  },
  metaTime: {
    fontFamily: 'inter-420-20',
    fontSize: 13,
  },
});
