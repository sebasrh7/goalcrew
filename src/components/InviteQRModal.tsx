import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useMemo, useRef, useState } from "react";
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { FontSize, Radius, Spacing, getInviteUrl } from "../constants";
import { Language, t } from "../lib/i18n";
import { useColors } from "../lib/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
  inviteCode: string;
  groupName: string;
  lang: Language;
}

export function InviteQRModal({
  visible,
  onClose,
  inviteCode,
  groupName,
  lang,
}: Props) {
  const C = useColors();
  const qrRef = useRef<any>(null);
  const inviteUrl = getInviteUrl(inviteCode);
  const [copied, setCopied] = useState(false);
  const styles = useMemo(() => createStyles(C), [C]);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("inviteMembers", lang)}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={C.text2} />
            </TouchableOpacity>
          </View>

          <Text style={styles.groupName}>{groupName}</Text>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <View style={styles.qrBg}>
              {Platform.OS === "web" ? (
                <QRCode
                  value={inviteUrl}
                  size={200}
                  backgroundColor="#FFFFFF"
                  color="#0b0f1a"
                />
              ) : (
                <QRCode
                  value={inviteUrl}
                  size={200}
                  backgroundColor="#FFFFFF"
                  color="#0b0f1a"
                  getRef={(ref: any) => (qrRef.current = ref)}
                />
              )}
            </View>
          </View>

          {/* Invite code display */}
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>{t("code", lang)}</Text>
            <TouchableOpacity
              onPress={handleCopyCode}
              style={styles.codeBadge}
              activeOpacity={0.7}
            >
              <Text style={styles.codeText}>{inviteCode}</Text>
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={14}
                color={copied ? C.green : C.accent2}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>{t("qrScanHint", lang)}</Text>

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.doneBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.doneBtnText}>{t("close", lang)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (C: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  container: {
    backgroundColor: C.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "900",
    color: C.text,
  },
  closeBtn: {
    padding: 4,
  },
  groupName: {
    fontSize: FontSize.sm,
    color: C.text2,
    marginBottom: Spacing.lg,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  qrBg: {
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  codeLabel: {
    fontSize: FontSize.sm,
    color: C.text2,
    fontWeight: "600",
  },
  codeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.surface2,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  codeText: {
    fontSize: FontSize.md,
    fontWeight: "900",
    color: C.text,
    letterSpacing: 2,
  },
  hint: {
    fontSize: FontSize.xs,
    color: C.text3,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  doneBtn: {
    backgroundColor: C.surface2,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.surface3,
  },
  doneBtnText: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: C.text,
  },
});
