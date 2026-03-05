import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useRef } from "react";
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Colors, FontSize, Radius, Spacing, getInviteUrl } from "../constants";
import { Language, t } from "../lib/i18n";

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
  const qrRef = useRef<any>(null);
  const inviteUrl = getInviteUrl(inviteCode);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
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
              <Ionicons name="close" size={22} color={Colors.text2} />
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
              <Ionicons name="copy-outline" size={14} color={Colors.accent2} />
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: Colors.surface3,
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
    color: Colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  groupName: {
    fontSize: FontSize.sm,
    color: Colors.text2,
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
    color: Colors.text2,
    fontWeight: "600",
  },
  codeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  codeText: {
    fontSize: FontSize.md,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: 2,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.text3,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  doneBtn: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  doneBtnText: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
  },
});
