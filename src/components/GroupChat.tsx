import { Ionicons } from "@expo/vector-icons";
import { isToday, isYesterday, format } from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontSize, Radius, Spacing } from "../constants";
import { useColors } from "../lib/useColors";
import { Language, t } from "../lib/i18n";
import {
  deleteGroupMessage,
  fetchGroupMessages,
  sendGroupMessage,
  subscribeToGroupMessages,
} from "../lib/supabase";
import { notifyGroup } from "../lib/pushNotify";
import { useAuthStore } from "../store/authStore";
import { useGroupsStore } from "../store/groupsStore";
import { useSettingsStore } from "../store/settingsStore";
import { impactAsync } from "../lib/haptics";
import { GroupMessage } from "../types";
import { Avatar } from "./UI";

interface GroupChatProps {
  groupId: string;
}

export function GroupChat({ groupId }: GroupChatProps) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const lang = settings.language || "es";
  const scrollRef = useRef<ScrollView>(null);
  const C = useColors();
  const styles = React.useMemo(() => createStyles(C), [C]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(
      (m) => m.message.toLowerCase().includes(q) || m.user?.name?.toLowerCase().includes(q),
    );
  }, [messages, searchQuery]);

  const loadingRef = useRef(false);
  const loadMessages = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const data = await fetchGroupMessages(groupId);
      setMessages(data as GroupMessage[]);
    } catch {
      // Silently handle — messages will retry on next subscription event
    } finally {
      loadingRef.current = false;
    }
  }, [groupId]);

  useEffect(() => {
    loadMessages();

    const channel = subscribeToGroupMessages(groupId, () => {
      loadMessages();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [groupId, loadMessages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    impactAsync("Light");

    setSending(true);
    setInput("");

    // Optimistic: show message immediately
    if (!user) return;
    const optimisticMsg: GroupMessage = {
      id: `temp-${Date.now()}`,
      group_id: groupId,
      user_id: user.id,
      message: text,
      created_at: new Date().toISOString(),
      user: { id: user.id, name: user.name, avatar_url: user.avatar_url, email: user.email, created_at: user.created_at, lifetime_points: user.lifetime_points ?? 0, best_streak: user.best_streak ?? 0 },
    };
    setMessages((prev) => [optimisticMsg, ...prev]);

    try {
      await sendGroupMessage(groupId, text);
      // Reload to get the real message with server ID
      await loadMessages();

      // Push notification to group members
      const group = useGroupsStore.getState().groups.find((g) => g.id === groupId);
      if (group) {
        notifyGroup({
          type: "chat_message",
          groupId,
          groupName: group.name,
          groupEmoji: group.emoji,
          data: { message: text },
        }).catch(() => {});
      }
    } catch {
      // Remove optimistic message and restore input on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await deleteGroupMessage(messageId);
    } catch {
      loadMessages(); // reload on failure
    }
  };

  const dateLocale = lang === "es" ? es : lang === "fr" ? fr : enUS;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return t("calendarToday", lang);
    if (isYesterday(d)) return t("yesterday", lang);
    return format(d, "d MMM yyyy", { locale: dateLocale });
  };

  const renderMessage = ({ item, index }: { item: GroupMessage; index: number }) => {
    const isOwn = item.user_id === user?.id;
    // Show date separator when date changes (list is inverted, so next = older)
    const currentDate = new Date(item.created_at).toDateString();
    const nextMsg = filteredMessages[index + 1];
    const showDateSep = !nextMsg || new Date(nextMsg.created_at).toDateString() !== currentDate;

    return (
      <>
        <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
          {!isOwn && (
            <Avatar
              name={item.user?.name ?? "?"}
              size={28}
              imageUrl={item.user?.avatar_url}
            />
          )}
          <View
            style={[styles.messageBubble, isOwn && styles.messageBubbleOwn]}
          >
            {!isOwn && (
              <Text style={styles.messageName}>{item.user?.name}</Text>
            )}
            <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
              {item.message}
            </Text>
            <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
          </View>
          {isOwn && (
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={14} color={C.text3} />
            </TouchableOpacity>
          )}
        </View>
        {showDateSep && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateLabel}>{formatDateLabel(item.created_at)}</Text>
            <View style={styles.dateLine} />
          </View>
        )}
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      {/* Search bar */}
      {showSearch && (
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={C.text3} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t("searchMessages", lang)}
            placeholderTextColor={C.text3}
            autoFocus
          />
          <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(""); }}>
            <Ionicons name="close" size={18} color={C.text2} />
          </TouchableOpacity>
        </View>
      )}
      {!showSearch && messages.length > 0 && (
        <TouchableOpacity
          onPress={() => setShowSearch(true)}
          style={styles.searchToggle}
        >
          <Ionicons name="search" size={16} color={C.text3} />
        </TouchableOpacity>
      )}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.list, { flexDirection: "column-reverse" }]}
        keyboardShouldPersistTaps="handled"
      >
        {filteredMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={40} color={C.text3} />
            <Text style={styles.emptyText}>{t("noMessages", lang)}</Text>
          </View>
        ) : (
          filteredMessages.map((item, index) => (
            <React.Fragment key={item.id}>
              {renderMessage({ item, index })}
            </React.Fragment>
          ))
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t("typeMessage", lang)}
          placeholderTextColor={C.text3}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          disabled={!input.trim() || sending}
        >
          <Ionicons
            name="send"
            size={18}
            color={input.trim() ? "#FFF" : C.text3}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (C: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: C.text3,
    textAlign: "center",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: Spacing.sm,
  },
  messageRowOwn: {
    flexDirection: "row-reverse",
  },
  messageBubble: {
    maxWidth: "75%",
    backgroundColor: C.surface2,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  messageBubbleOwn: {
    backgroundColor: "rgba(108,99,255,0.15)",
    borderColor: "rgba(108,99,255,0.3)",
  },
  messageName: {
    fontSize: 10,
    fontWeight: "700",
    color: C.accent2,
    marginBottom: 2,
  },
  messageText: {
    fontSize: FontSize.sm,
    color: C.text,
    lineHeight: 18,
  },
  messageTextOwn: {
    color: C.text,
  },
  messageTime: {
    fontSize: 9,
    color: C.text3,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  deleteBtn: {
    padding: 12,
    margin: -8,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.surface3,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.text3,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: C.surface3,
    backgroundColor: C.surface,
  },
  input: {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: C.text,
    fontSize: FontSize.sm,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: C.surface2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.surface3,
    backgroundColor: C.surface,
  },
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: FontSize.sm,
    paddingVertical: 4,
  },
  searchToggle: {
    alignSelf: "flex-end",
    padding: Spacing.sm,
    paddingRight: Spacing.lg,
  },
});
