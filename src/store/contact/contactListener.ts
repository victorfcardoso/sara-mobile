// This listener adds the contacts to the store when there are new conversations are added to the store. It may be created in bulk or individually.

import { createListenerMiddleware } from '@reduxjs/toolkit';
import { conversationActions } from '../conversation/conversationActions';
import { notificationActions } from '../notification/notificationAction';
import { addNotification } from '../notification/notificationSlice';
import { addContact, addContacts } from './contactSlice';
import { Conversation } from '@/types/Conversation';
import { Notification } from '@/types/Notification';

export const contactListenerMiddleware = createListenerMiddleware();

contactListenerMiddleware.startListening({
  actionCreator: conversationActions.fetchConversations.fulfilled,
  effect: (action, listenerApi) => {
    const contacts = action.payload.conversations.map(
      (conversation: Conversation) => conversation.meta.sender,
    );
    if (contacts.length > 0) {
      listenerApi.dispatch(addContacts({ contacts }));
    }
  },
});

contactListenerMiddleware.startListening({
  actionCreator: conversationActions.fetchConversation.fulfilled,
  effect: (action, listenerApi) => {
    const conversation = action.payload.conversation as Conversation | undefined;
    const contact = conversation?.meta?.sender;
    if (contact) {
      listenerApi.dispatch(addContact(contact));
    }
  },
});

contactListenerMiddleware.startListening({
  actionCreator: notificationActions.fetchNotifications.fulfilled,
  effect: (action, listenerApi) => {
    const { payload: notifications } = action.payload;
    const conversationNotifications = notifications.filter(
      (notification: Notification) =>
        notification.primaryActorType === 'Conversation' && notification.primaryActor?.meta?.sender,
    );
    const contacts = conversationNotifications.map(
      (notification: Notification) => notification.primaryActor?.meta?.sender,
    );
    if (contacts.length > 0) {
      listenerApi.dispatch(addContacts({ contacts }));
    }
  },
});

contactListenerMiddleware.startListening({
  actionCreator: addNotification,
  effect: (action, listenerApi) => {
    const { notification } = action.payload;
    const contact = notification?.primaryActor?.meta?.sender;
    if (contact) {
      listenerApi.dispatch(addContact(contact));
    }
  },
});
