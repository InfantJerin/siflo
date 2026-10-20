import { create } from 'zustand';

import activityData from '@/mocks/activities.json';
import conversationData from '@/mocks/conversations.json';
import customerData from '@/mocks/customers.json';
import { demoNow, toLocalIso } from './clock';
import type {
  Activity,
  ChatMessage,
  CollectionActivity,
  Conversation,
  Customer,
  PaymentMethod,
  VisitActivity,
  VisitOutcome,
} from './types';

export type Language = 'en' | 'ta' | 'hi';

interface AppState {
  customers: Customer[];
  activities: Activity[];
  conversations: Record<string, Conversation>;
  nextReference: number;
  language: Language;

  recordCollection: (input: {
    customerId: string;
    amount: number;
    method: PaymentMethod;
    note: string;
  }) => CollectionActivity;
  recordIssue: (input: {
    customerId: string;
    outcome: VisitOutcome;
    amount?: number;
    note: string;
    followUp?: string;
    photoUri?: string;
    voiceUri?: string;
    voiceSeconds?: number;
  }) => VisitActivity;
  sendMessage: (customerId: string, text: string) => void;
  retryMessage: (customerId: string, messageId: string) => void;
  markConversationRead: (customerId: string) => void;
  setLanguage: (language: Language) => void;
}

const MANAGER = { name: 'Suresh', role: 'Manager' };
const ME = { name: 'Arun', role: 'Agent' };
const SEND_DELAY_MS = 700;
const REPLY_DELAY_MS = 3000;

let idCounter = 0;
const newId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

export const useApp = create<AppState>((set, get) => {
  function updateConversation(customerId: string, fn: (c: Conversation) => Conversation) {
    set((s) => {
      const current = s.conversations[customerId] ?? { unread: 0, items: [] };
      return { conversations: { ...s.conversations, [customerId]: fn(current) } };
    });
  }

  function setMessageStatus(customerId: string, messageId: string, status: ChatMessage['status']) {
    updateConversation(customerId, (c) => ({
      ...c,
      items: c.items.map((i) => (i.id === messageId && i.type === 'message' ? { ...i, status } : i)),
    }));
  }

  function scheduleManagerReply(customerId: string) {
    setTimeout(() => {
      const replies = conversationData.cannedManagerReplies;
      const text = replies[Math.floor(Math.random() * replies.length)];
      updateConversation(customerId, (c) => ({
        ...c,
        unread: c.unread + 1,
        items: [
          ...c.items,
          { id: newId('m'), type: 'message', author: MANAGER, mine: false, text, at: toLocalIso(demoNow()) },
        ],
      }));
    }, REPLY_DELAY_MS);
  }

  function deliver(customerId: string, messageId: string, forceSuccess: boolean) {
    setTimeout(() => {
      const msg = get().conversations[customerId]?.items.find((i) => i.id === messageId);
      if (!msg || msg.type !== 'message') return;
      // Demo hook: a message containing "fail" fails on first send so the retry state can be seen.
      if (!forceSuccess && /fail/i.test(msg.text)) {
        setMessageStatus(customerId, messageId, 'failed');
        return;
      }
      setMessageStatus(customerId, messageId, 'sent');
      scheduleManagerReply(customerId);
    }, SEND_DELAY_MS);
  }

  return {
    customers: customerData.customers as Customer[],
    activities: activityData.activities as Activity[],
    conversations: conversationData.conversations as Record<string, Conversation>,
    nextReference: activityData.nextReferenceNumber,
    language: 'en',

    recordCollection: ({ customerId, amount, method, note }) => {
      const ref = get().nextReference;
      const activity: CollectionActivity = {
        id: newId('a'),
        customerId,
        kind: 'collection',
        amount,
        method,
        note,
        at: toLocalIso(demoNow()),
        reference: `SIF–COL–${String(ref).padStart(4, '0')}`,
        recordedInApp: true,
      };
      set((s) => ({ activities: [...s.activities, activity], nextReference: ref + 1 }));
      return activity;
    },

    recordIssue: ({ customerId, outcome, amount, note, followUp, photoUri, voiceUri, voiceSeconds }) => {
      const activity: VisitActivity = {
        id: newId('a'),
        customerId,
        kind: 'visit',
        outcome,
        amount,
        note,
        followUp,
        photo: photoUri ? { uri: photoUri } : undefined,
        voice: voiceUri,
        voiceSeconds,
        at: toLocalIso(demoNow()),
        recordedInApp: true,
      };
      set((s) => ({ activities: [...s.activities, activity] }));
      return activity;
    },

    sendMessage: (customerId, text) => {
      const message: ChatMessage = {
        id: newId('m'),
        type: 'message',
        author: ME,
        mine: true,
        text,
        at: toLocalIso(demoNow()),
        status: 'sending',
      };
      updateConversation(customerId, (c) => ({ ...c, items: [...c.items, message] }));
      deliver(customerId, message.id, false);
    },

    retryMessage: (customerId, messageId) => {
      setMessageStatus(customerId, messageId, 'sending');
      deliver(customerId, messageId, true);
    },

    markConversationRead: (customerId) => {
      if (!get().conversations[customerId]?.unread) return;
      updateConversation(customerId, (c) => ({ ...c, unread: 0 }));
    },

    setLanguage: (language) => set({ language }),
  };
});
