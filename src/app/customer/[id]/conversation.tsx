import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import agentData from '@/mocks/agent.json';
import { useApp } from '@/store/app';
import { demoNow } from '@/store/clock';
import { useCustomer } from '@/store/selectors';
import type { ChatItem, ChatMessage } from '@/store/types';
import { colors, fonts, radius } from '@/theme/tokens';
import { dateBanner, dateShort, sameDay, time } from '@/utils/format';

/**
 * A14 · Conversation — a fake, in-app chat. Sending succeeds after a short delay and the
 * manager replies with a canned message. Any message containing "fail" fails first so the
 * retry state can be demoed.
 */
export default function ConversationScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customer = useCustomer(id);
  const items = useApp((s) => s.conversations[id]?.items) ?? EMPTY;
  const unread = useApp((s) => s.conversations[id]?.unread ?? 0);
  const sendMessage = useApp((s) => s.sendMessage);
  const retryMessage = useApp((s) => s.retryMessage);
  const markRead = useApp((s) => s.markConversationRead);
  const [draft, setDraft] = useState('');
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  // Reading the thread clears the "1 new" badge, including replies that arrive while open.
  useEffect(() => {
    if (unread) markRead(id);
  }, [unread, id, markRead]);

  if (!customer) return null;

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(customer.id, text);
    setDraft('');
  };

  const { agent, manager } = agentData;
  const firstMessage = items.find((i) => i.type === 'message');

  return (
    <Screen header={<ScreenHeader title={t('chat.title')} />} scroll={false}>
      <View style={styles.context}>
        <AppText variant="label">{`${customer.name} · ${customer.loanId}`}</AppText>
        <AppText variant="caption" color={colors.muted}>
          {t('chat.participants', { me: agent.firstName, manager: manager.name })}
        </AppText>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="title">{t('chat.emptyTitle')}</AppText>
          <AppText variant="body">{t('chat.emptyBody')}</AppText>
        </View>
      ) : (
        <ScrollView
          ref={scroll}
          style={styles.flex}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {firstMessage && (
            <AppText variant="caption" color={colors.muted} upper>
              {dateBanner(new Date(items[items.length - 1].at))}
            </AppText>
          )}
          {items.map((item) => (
            <ChatRow key={item.id} item={item} onRetry={(mid) => retryMessage(customer.id, mid)} />
          ))}
        </ScrollView>
      )}

      <View style={[styles.composer, { paddingBottom: 12 + insets.bottom }]}>
        <View style={styles.composerRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={colors.subtle}
            style={styles.input}
            multiline
            accessibilityLabel={t('chat.placeholder')}
          />
          <Button label={t('chat.send')} onPress={send} disabled={!draft.trim()} style={styles.send} />
        </View>
        <AppText variant="caption" color={colors.muted}>
          {t('chat.visibility')}
        </AppText>
      </View>
    </Screen>
  );
}

const EMPTY: ChatItem[] = [];

function ChatRow({ item, onRetry }: { item: ChatItem; onRetry: (id: string) => void }) {
  const { t } = useTranslation();
  const at = new Date(item.at);

  if (item.type === 'event') {
    return (
      <View style={styles.event}>
        <AppText variant="caption" color={colors.muted}>
          {`${dateShort(at)} · ${item.text}`}
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          {item.detail}
        </AppText>
      </View>
    );
  }

  if (item.mine && item.status === 'failed') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.text}. ${t('chat.notSent')}`}
        onPress={() => onRetry(item.id)}
        style={styles.failed}
      >
        <AppText variant="body">{item.text}</AppText>
        <AppText variant="label" color={colors.red}>
          {t('chat.notSent')}
        </AppText>
      </Pressable>
    );
  }

  return (
    <View style={[styles.bubble, item.mine ? styles.mine : styles.theirs]}>
      <AppText variant="label">{`${item.author.name} · ${item.author.role}`}</AppText>
      <AppText variant="body">{item.text}</AppText>
      <AppText variant="caption" color={colors.muted}>
        {stamp(item, at, t)}
      </AppText>
    </View>
  );
}

function stamp(item: ChatMessage, at: Date, t: (k: string) => string) {
  const base = sameDay(at, demoNow()) ? time(at) : `${dateShort(at)} · ${time(at)}`;
  if (!item.mine) return base;
  return `${base} · ${item.status === 'sending' ? t('chat.sending') : t('chat.sent')}`;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  context: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 2,
  },
  thread: { padding: 16, gap: 16 },
  empty: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, gap: 8 },
  event: { paddingHorizontal: 8, gap: 2 },
  bubble: { maxWidth: '82%', borderRadius: radius[12], padding: 12, gap: 4 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.greenSoft },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.white },
  failed: { backgroundColor: colors.redSoft, padding: 12, gap: 6 },
  composer: { backgroundColor: colors.white, paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 120,
    borderRadius: radius[12],
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  send: { minHeight: 50, paddingHorizontal: 20 },
});
