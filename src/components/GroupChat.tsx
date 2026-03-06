import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontSize, Radius, Spacing } from "../constants";
import { useColors } from "../lib/useColors";
import { t } from "../lib/i18n";
import {
  deleteGroupMessage,
  fetchGroupMessages,
  sendGroupMessage,
  subscribeToGroupMessages,
} from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { useSettingsStore } from "../store/settingsStore";
import { GroupMessage } from "../types";
import { Avatar } from "./UI";

interface GroupChatProps {
  groupId: string;
}

export function GroupChat({ groupId }: GroupChatProps) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const lang = settings.language || "es";
  const flatListRef = useRef<FlatList>(null);
  const C = useColors();
  const styles = React.useMemo(() => createStyles(C), [C]);

  const loadMessages = useCallback(async () => {
    const data = await fetchGroupMessages(groupId);
    setMessages(data as GroupMessage[]);
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

    setSending(true);
    setInput("");

    // Optimistic: show message immediately
    const optimisticMsg: GroupMessage = {
      id: `temp-${Date.now()}`,
      group_id: groupId,
      user_id: user!.id,
      message: text,
      created_at: new Date().toISOString(),
      user: user ? { id: user.id, name: user.name, avatar_url: user.avatar_url, email: user.email, created_at: user.created_at } : undefined,
    };
    setMessages((prev) => [optimisticMsg, ...prev]);

    try {
      await sendGroupMessage(groupId, text);
      // Reload to get the real message with server ID
      await loadMessages();
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

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item }: { item: GroupMessage }) => {
    const isOwn = item.user_id === user?.id;

    return (
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
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={40} color={C.text3} />
            <Text style={styles.emptyText}>{t("noMessages", lang)}</Text>
          </View>
        }
      />

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
    transform: [{ scaleY: -1 }], // un-invert for empty state
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
    padding: 4,
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
});
