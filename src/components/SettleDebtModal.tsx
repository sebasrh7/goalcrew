import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FontSize, Radius, Spacing } from "../constants";
import { CURRENCIES } from "../lib/currency";
import { Language, t } from "../lib/i18n";
import { useColors } from "../lib/useColors";
import { SimplifiedDebt } from "../types";
import { Avatar, Button } from "./UI";

interface SettleDebtModalProps {
  visible: boolean;
  onClose: () => void;
  debt: SimplifiedDebt | null;
  currency: string;
  lang: Language;
  isLoading: boolean;
  onConfirm: (amount: number) => void;
}

export function SettleDebtModal({ visible, onClose, debt, currency, lang, isLoading, onConfirm }: SettleDebtModalProps) {
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const [amount, setAmount] = useState("");
  const currencySymbol = CURRENCIES[currency]?.symbol || "$";

  const handleOpen = () => {
    if (debt) setAmount(String(debt.amount));
  };

  const amountExceedsDebt = debt ? parseFloat(amount) > debt.amount : false;

  const handleConfirm = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || !debt) return;
    if (val > debt.amount) return;
    onConfirm(val);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.modalBg}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {debt && (
              <>
                <View style={styles.header}>
                  <Avatar name={debt.from_user.name} size={36} imageUrl={debt.from_user.avatar_url} />
                  <Ionicons name="arrow-forward" size={20} color={C.text3} />
                  <Avatar name={debt.to_user.name} size={36} imageUrl={debt.to_user.avatar_url} />
                </View>
                <Text style={styles.title}>
                  {debt.from_user.name} → {debt.to_user.name}
                </Text>

                <Text style={styles.label}>{t("settleAmount", lang)}</Text>
                <View style={styles.amountWrap}>
                  <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    autoFocus
                    placeholder={String(debt.amount)}
                    placeholderTextColor={C.text3}
                  />
                </View>

                {amountExceedsDebt && (
                  <Text style={{ fontSize: 12, color: "#FF3B30", fontWeight: "700" }}>
                    {t("amountExceedsDebt", lang)}
                  </Text>
                )}
                <Button
                  title={t("confirmSettle", lang)}
                  onPress={handleConfirm}
                  isLoading={isLoading}
                  disabled={!amount || parseFloat(amount) <= 0 || amountExceedsDebt}
                />
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (C: any) => StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.surface3,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: C.text,
    textAlign: "center",
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: C.text2,
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface2,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  currencySymbol: {
    fontSize: FontSize.xl,
    fontWeight: "900",
    color: C.text3,
  },
  amountInput: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: "900",
    color: C.text,
    paddingVertical: Spacing.md,
    marginLeft: Spacing.sm,
  },
});
