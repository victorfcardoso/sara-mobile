import {
  getLastMessage,
  shouldApplyFilters,
  filterDuplicateSourceMessages,
  getReadMessages,
  getUnreadMessages,
  findPendingMessageIndex,
  extractConversationIdFromUrl,
} from '@/utils/conversationUtils';
import { ContentType, Conversation, Message, MessageStatus } from '@/types';
import type { FilterState } from '@/store/conversation/conversationFilterSlice';

export const conversation: Conversation = {
  id: 250,
  accountId: 1,
  additionalAttributes: {},
  agentLastSeenAt: 1,
  assigneeLastSeenAt: 1,
  canReply: true,
  contactLastSeenAt: 1,
  createdAt: 1,
  customAttributes: {},
  firstReplyCreatedAt: 1,
  inboxId: 1,
  labels: [],
  lastActivityAt: 1,
  muted: false,
  priority: 'low',
  snoozedUntil: null,
  status: 'open',
  unreadCount: 1,
  uuid: '123',
  waitingSince: 1,
  lastNonActivityMessage: null,
  meta: {
    sender: {
      id: 1,
      name: 'Test Sender',
      thumbnail: '',
      email: '',
      phoneNumber: null,
      additionalAttributes: {},
      customAttributes: {},
      createdAt: 1,
      identifier: null,
      lastActivityAt: 1,
      type: 'contact',
    },
    assignee: {
      id: 1,
      name: 'Test Assignee',
      thumbnail: '',
      email: '',
      customAttributes: {},
    },
    team: null,
    hmacVerified: false,
    channel: 'Channel::Whatsapp',
  },
  timestamp: 1,
  slaPolicyId: null,
  appliedSla: null,
  slaEvents: [],
  messages: [
    {
      id: 438072,
      content:
        'Chatwoot enables your team to be more productive, faster, and collaborate without switching apps.',
      inboxId: 37,
      conversationId: 5811,
      messageType: 1,
      createdAt: 1620980262,
      private: false,
      status: 'sent',
      sourceId: null,
      attachments: [],
      contentAttributes: null,
      contentType: 'text',
      echoId: null,
      sender: null,
      lastNonActivityMessage: null,
      conversation: null,
      shouldRenderAvatar: false,
      senderId: 0,
    },
    {
      id: 438100,
      content: 'Hey, how are you?',
      inboxId: 37,
      conversationId: 5812,
      messageType: 0,
      createdAt: 1621145476,
      private: false,
      status: 'sent',
      sourceId: null,
      attachments: [],
      contentAttributes: null,
      contentType: 'text',
      echoId: null,
      sender: null,
      lastNonActivityMessage: null,
      conversation: null,
      shouldRenderAvatar: false,
      senderId: 0,
    },
  ],
};

const lastMessage = {
  id: 438100,
  content: 'Hey, how are you?',
  inboxId: 37,
  conversationId: 5812,
  messageType: 0,
  createdAt: 1621145476,
  private: false,
  status: 'sent' as MessageStatus,
  sourceId: null,
  attachments: [],
  contentAttributes: null,
  contentType: 'text' as ContentType,
  echoId: null,
  sender: null,
  lastNonActivityMessage: null,
  conversation: null,
  shouldRenderAvatar: false,
  senderId: 0,
};

describe('getLastMessage', () => {
  it("should return last activity message if both api and store doesn't have other messages", () => {
    expect(getLastMessage(conversation)).toEqual(lastMessage);
  });
  it('should return message from store if store has latest message', () => {
    const testConversation = {
      ...conversation,
      messages: [],
      lastNonActivityMessage: lastMessage,
    };
    expect(getLastMessage(testConversation)).toEqual(lastMessage);
  });

  it('should return last non activity message from store if api value is empty', () => {
    const testConversation = {
      ...conversation,
      messages: [lastMessage],
    };
    expect(getLastMessage(testConversation)).toEqual(lastMessage);
  });

  it("should return last non activity message from store if store doesn't have any messages", () => {
    const testConversation = {
      ...conversation,
      messages: [lastMessage],
    };
    expect(getLastMessage(testConversation)).toEqual(lastMessage);
  });
});

describe('shouldApplyFilters', () => {
  const baseConversation: Conversation = {
    ...conversation,
    status: 'open',
    inboxId: 1,
  };

  it('should return true when filter status is "all"', () => {
    const filters: FilterState = { status: 'all', inbox_id: '0' };
    expect(shouldApplyFilters(baseConversation, filters)).toBe(true);
  });

  it('should return true when conversation status matches filter status', () => {
    const filters: FilterState = { status: 'open', inbox_id: '0' };
    expect(shouldApplyFilters(baseConversation, filters)).toBe(true);
  });

  it('should return false when conversation status does not match filter status', () => {
    const filters: FilterState = { status: 'resolved', inbox_id: '0' };
    expect(shouldApplyFilters(baseConversation, filters)).toBe(false);
  });

  it('should filter by inbox when inbox_id is set', () => {
    const filters: FilterState = { status: 'all', inbox_id: '1' };
    expect(shouldApplyFilters(baseConversation, filters)).toBe(true);
  });

  it('should return false when inbox does not match', () => {
    const filters: FilterState = { status: 'all', inbox_id: '999' };
    expect(shouldApplyFilters(baseConversation, filters)).toBe(false);
  });

  it('should apply both status and inbox filters', () => {
    const filters: FilterState = { status: 'open', inbox_id: '1' };
    expect(shouldApplyFilters(baseConversation, filters)).toBe(true);

    const mismatchFilters: FilterState = { status: 'open', inbox_id: '999' };
    expect(shouldApplyFilters(baseConversation, mismatchFilters)).toBe(false);
  });
});

describe('filterDuplicateSourceMessages', () => {
  const createMessage = (id: number, sourceId: string | null): Message => ({
    id,
    content: `Message ${id}`,
    inboxId: 1,
    conversationId: 1,
    messageType: 0,
    createdAt: 1620980262,
    private: false,
    status: 'sent' as MessageStatus,
    sourceId,
    attachments: [],
    contentAttributes: null,
    contentType: 'text' as ContentType,
    echoId: null,
    sender: null,
    lastNonActivityMessage: null,
    conversation: null,
    shouldRenderAvatar: false,
    senderId: 0,
  });

  it('should return empty array for empty input', () => {
    expect(filterDuplicateSourceMessages([])).toEqual([]);
  });

  it('should return empty array for undefined input', () => {
    expect(filterDuplicateSourceMessages(undefined)).toEqual([]);
  });

  it('should keep messages without sourceId', () => {
    const messages = [createMessage(1, null), createMessage(2, null)];
    expect(filterDuplicateSourceMessages(messages)).toHaveLength(2);
  });

  it('should filter duplicate sourceId messages', () => {
    const messages = [
      createMessage(1, 'source-1'),
      createMessage(2, 'source-1'),
      createMessage(3, 'source-2'),
    ];
    const result = filterDuplicateSourceMessages(messages);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should keep first occurrence of duplicate sourceId', () => {
    const messages = [createMessage(1, 'source-1'), createMessage(2, 'source-1')];
    const result = filterDuplicateSourceMessages(messages);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });
});

describe('getReadMessages', () => {
  const createMessage = (id: number, createdAt: number): Message => ({
    id,
    content: `Message ${id}`,
    inboxId: 1,
    conversationId: 1,
    messageType: 0,
    createdAt,
    private: false,
    status: 'sent' as MessageStatus,
    sourceId: null,
    attachments: [],
    contentAttributes: null,
    contentType: 'text' as ContentType,
    echoId: null,
    sender: null,
    lastNonActivityMessage: null,
    conversation: null,
    shouldRenderAvatar: false,
    senderId: 0,
  });

  it('should return messages created before or at agentLastSeenAt', () => {
    const messages = [createMessage(1, 1000), createMessage(2, 2000), createMessage(3, 3000)];
    const result = getReadMessages(messages, 2000);
    expect(result).toHaveLength(2);
    expect(result.map(m => m.id)).toEqual([1, 2]);
  });

  it('should return empty array when no messages are read', () => {
    const messages = [createMessage(1, 3000), createMessage(2, 4000)];
    const result = getReadMessages(messages, 1000);
    expect(result).toHaveLength(0);
  });

  it('should return all messages when all are read', () => {
    const messages = [createMessage(1, 1000), createMessage(2, 2000)];
    const result = getReadMessages(messages, 5000);
    expect(result).toHaveLength(2);
  });
});

describe('getUnreadMessages', () => {
  const createMessage = (id: number, createdAt: number): Message => ({
    id,
    content: `Message ${id}`,
    inboxId: 1,
    conversationId: 1,
    messageType: 0,
    createdAt,
    private: false,
    status: 'sent' as MessageStatus,
    sourceId: null,
    attachments: [],
    contentAttributes: null,
    contentType: 'text' as ContentType,
    echoId: null,
    sender: null,
    lastNonActivityMessage: null,
    conversation: null,
    shouldRenderAvatar: false,
    senderId: 0,
  });

  it('should return messages created after agentLastSeenAt', () => {
    const messages = [createMessage(1, 1000), createMessage(2, 2000), createMessage(3, 3000)];
    const result = getUnreadMessages(messages, 2000);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it('should return all messages when none are read', () => {
    const messages = [createMessage(1, 3000), createMessage(2, 4000)];
    const result = getUnreadMessages(messages, 1000);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when all messages are read', () => {
    const messages = [createMessage(1, 1000), createMessage(2, 2000)];
    const result = getUnreadMessages(messages, 5000);
    expect(result).toHaveLength(0);
  });
});

describe('findPendingMessageIndex', () => {
  it('should find message by id', () => {
    const testConversation = {
      ...conversation,
      messages: conversation.messages,
    };
    const message = { id: 438072, echoId: null } as Message;
    expect(findPendingMessageIndex(testConversation, message)).toBe(0);
  });

  it('should find message by echoId', () => {
    const testConversation = {
      ...conversation,
      messages: [{ ...conversation.messages[0], id: 'temp-123' as unknown as number }],
    };
    const message = { id: 999, echoId: 'temp-123' } as unknown as Message;
    expect(findPendingMessageIndex(testConversation, message)).toBe(0);
  });

  it('should return -1 when message not found', () => {
    const testConversation = {
      ...conversation,
      messages: conversation.messages,
    };
    const message = { id: 999999, echoId: null } as Message;
    expect(findPendingMessageIndex(testConversation, message)).toBe(-1);
  });
});

describe('extractConversationIdFromUrl', () => {
  it('should extract conversation ID from valid URL', () => {
    expect(extractConversationIdFromUrl({ url: 'https://example.com/conversations/123' })).toBe(
      123,
    );
  });

  it('should extract conversation ID from URL with additional path', () => {
    expect(
      extractConversationIdFromUrl({ url: 'https://example.com/app/conversations/456/messages' }),
    ).toBe(456);
  });

  it('should return null for URL without conversation ID', () => {
    expect(extractConversationIdFromUrl({ url: 'https://example.com/inbox' })).toBeNull();
  });

  it('should return null for malformed URL pattern', () => {
    expect(extractConversationIdFromUrl({ url: 'https://example.com/conversations/' })).toBeNull();
  });

  it('should handle URL with large conversation ID', () => {
    expect(extractConversationIdFromUrl({ url: 'https://example.com/conversations/9999999' })).toBe(
      9999999,
    );
  });
});
