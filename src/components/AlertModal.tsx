import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors, FontSize, Radius, Spacing } from "../constants";

// ─── AlertModal ─────────────────────────────────────────────────────────────
// Reemplaza a Alert.alert para un UX consistente con la app.

export interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
  isLoading?: boolean;
}

interface AlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

/**
 * Modal de alerta nativo de la app.
 * Soporta: info (1 botón), confirmación (2 botones), destructivo (rojo).
 */
export function AlertModal({
  visible,
  title,
  message,
  buttons,
  onDismiss,
  icon,
  iconColor,
}: AlertModalProps) {
  const resolvedButtons = buttons?.length
    ? buttons
    : [{ text: "OK", style: "default" as const, onPress: onDismiss }];

  const cancelBtn = resolvedButtons.find((b) => b.style === "cancel");
  const actionBtns = resolvedButtons.filter((b) => b.style !== "cancel");

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onDismiss ?? cancelBtn?.onPress}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons
                name={icon}
                size={32}
                color={iconColor ?? Colors.accent}
              />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.buttonRow}>
            {cancelBtn && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={cancelBtn.onPress ?? onDismiss}
              >
                <Text style={styles.cancelText}>{cancelBtn.text}</Text>
              </TouchableOpacity>
            )}
            {actionBtns.map((btn, idx) => {
              const isDestructive = btn.style === "destructive";
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.button,
                    isDestructive
                      ? styles.destructiveButton
                      : styles.actionButton,
                    btn.isLoading && { opacity: 0.7 },
                  ]}
                  onPress={btn.onPress}
                  disabled={btn.isLoading}
                >
                  {btn.isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text
                      style={[
                        styles.actionText,
                        isDestructive && styles.destructiveText,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── SelectModal ────────────────────────────────────────────────────────────
// Modal de selección de lista (idioma, moneda, etc.)

export interface SelectOption {
  label: string;
  sublabel?: string;
  value: string;
}

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function SelectModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: SelectModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.selectHeader}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            style={{ maxHeight: 400 }}
            renderItem={({ item }) => {
              const isSelected = selectedValue === item.value;
              return (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                  ]}
                  onPress={() => onSelect(item.value)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.sublabel ? (
                      <Text style={styles.optionSublabel}>{item.sublabel}</Text>
                    ) : null}
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={Colors.accent}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  content: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.sm,
    color: Colors.text2,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: Colors.surface3,
  },
  cancelText: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: Colors.text2,
  },
  actionButton: {
    backgroundColor: Colors.accent,
  },
  destructiveButton: {
    backgroundColor: Colors.red,
  },
  actionText: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: "#fff",
  },
  destructiveText: {
    color: "#fff",
  },
  // Select modal
  selectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.bg,
  },
  optionItemSelected: {
    backgroundColor: Colors.accent + "18",
    borderWidth: 1,
    borderColor: Colors.accent + "40",
  },
  optionLabel: {
    fontSize: FontSize.base,
    fontWeight: "500",
    color: Colors.text,
  },
  optionLabelSelected: {
    color: Colors.accent,
    fontWeight: "700",
  },
  optionSublabel: {
    fontSize: FontSize.xs,
    color: Colors.text3,
    marginTop: 2,
  },
});
