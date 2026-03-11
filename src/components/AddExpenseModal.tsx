import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontSize, Radius, Spacing } from "../constants";
import { CURRENCIES } from "../lib/currency";
import { computeSplitAmounts } from "../lib/expenses";
import { impactAsync } from "../lib/haptics";
import { Language, t } from "../lib/i18n";
import { formatCurrency } from "../lib/currency";
import { useColors } from "../lib/useColors";
import { ExpenseSplitType, GroupMember, User } from "../types";
import { Avatar, Button } from "./UI";

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  members: GroupMember[];
  currentUserId: string;
  currency: string;
  lang: Language;
  isLoading: boolean;
  onSubmit: (data: {
    paidBy: string;
    amount: number;
    description: string;
    splitType: ExpenseSplitType;
    splits: { user_id: string; amount: number }[];
    receiptUri?: string;
  }) => void;
}

export function AddExpenseModal({
  visible,
  onClose,
  members,
  currentUserId,
  currency,
  lang,
  isLoading,
  onSubmit,
}: AddExpenseModalProps) {
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const currencySymbol = CURRENCIES[currency]?.symbol || "$";

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [splitType, setSplitType] = useState<ExpenseSplitType>("equal_all");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(members.map((m) => m.user_id)),
  );
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [showPayerPicker, setShowPayerPicker] = useState(false);

  const resetForm = useCallback(() => {
    setAmount("");
    setDescription("");
    setPaidBy(currentUserId);
    setSplitType("equal_all");
    setSelectedMembers(new Set(members.map((m) => m.user_id)));
    setCustomAmounts({});
    setReceiptUri(null);
    setShowPayerPicker(false);
  }, [currentUserId, members]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleMember = (userId: string) => {
    impactAsync("Light");
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handlePickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const customSplitTotal = useMemo(() => {
    if (splitType !== "custom") return 0;
    return Array.from(selectedMembers).reduce(
      (sum, uid) => sum + (parseFloat(customAmounts[uid] ?? "0") || 0),
      0,
    );
  }, [splitType, selectedMembers, customAmounts]);

  const customSplitMismatch =
    splitType === "custom" &&
    parseFloat(amount) > 0 &&
    Math.abs(customSplitTotal - parseFloat(amount)) > 0.01;

  const handleSubmit = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || !description.trim()) return;

    const targetMembers =
      splitType === "equal_all"
        ? members.map((m) => m.user_id)
        : Array.from(selectedMembers);

    if (targetMembers.length === 0) return;

    const customMap = splitType === "custom"
      ? Object.fromEntries(
          Object.entries(customAmounts)
            .filter(([k]) => selectedMembers.has(k))
            .map(([k, v]) => [k, parseFloat(v) || 0]),
        )
      : undefined;

    // Validate custom splits sum to total
    if (customMap) {
      const sum = Object.values(customMap).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - val) > 0.01) return;
    }

    const splits = computeSplitAmounts(val, targetMembers, customMap);

    onSubmit({
      paidBy,
      amount: val,
      description: description.trim(),
      splitType,
      splits,
      receiptUri: receiptUri ?? undefined,
    });

    handleClose();
  };

  const payer = members.find((m) => m.user_id === paidBy);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.modalBg}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.titleRow}>
              <Ionicons name="receipt-outline" size={20} color={C.text} />
              <Text style={styles.title}>{t("addExpense", lang)}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Amount */}
              <View style={styles.amountWrap}>
                <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={C.text3}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>

              {/* Description */}
              <TextInput
                style={styles.descInput}
                placeholder={t("expenseDescPlaceholder", lang)}
                placeholderTextColor={C.text3}
                value={description}
                onChangeText={setDescription}
                maxLength={100}
              />

              {/* Paid by */}
              <Text style={styles.sectionLabel}>{t("paidBy", lang)}</Text>
              <TouchableOpacity
                onPress={() => setShowPayerPicker(!showPayerPicker)}
                style={styles.payerBtn}
              >
                {payer?.user && (
                  <Avatar name={payer.user.name} size={24} imageUrl={payer.user.avatar_url} />
                )}
                <Text style={styles.payerName} numberOfLines={1}>
                  {payer?.user?.name ?? "?"}
                </Text>
                <Ionicons name="chevron-down" size={16} color={C.text3} />
              </TouchableOpacity>

              {showPayerPicker && (
                <View style={styles.payerList}>
                  {members.map((m) => (
                    <TouchableOpacity
                      key={m.user_id}
                      onPress={() => {
                        setPaidBy(m.user_id);
                        setShowPayerPicker(false);
                        impactAsync("Light");
                      }}
                      style={[styles.payerOption, m.user_id === paidBy && styles.payerOptionActive]}
                    >
                      <Avatar name={m.user?.name ?? "?"} size={24} imageUrl={m.user?.avatar_url} />
                      <Text style={[styles.payerOptionText, m.user_id === paidBy && { color: C.accent2 }]}>
                        {m.user?.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Split type */}
              <Text style={styles.sectionLabel}>{t("splitEqually", lang)}</Text>
              <View style={styles.splitTypeRow}>
                {(["equal_all", "equal_selected", "custom"] as ExpenseSplitType[]).map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => { impactAsync("Light"); setSplitType(st); }}
                    style={[styles.splitChip, splitType === st && styles.splitChipActive]}
                  >
                    <Text style={[styles.splitChipText, splitType === st && styles.splitChipTextActive]}>
                      {st === "equal_all"
                        ? t("splitEqually", lang)
                        : st === "equal_selected"
                          ? t("splitSelected", lang)
                          : t("splitCustom", lang)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Member selection (for equal_selected and custom) */}
              {splitType !== "equal_all" && (
                <View style={styles.memberList}>
                  {members.map((m) => {
                    const selected = selectedMembers.has(m.user_id);
                    return (
                      <View key={m.user_id} style={styles.memberRow}>
                        <TouchableOpacity
                          onPress={() => toggleMember(m.user_id)}
                          style={styles.memberCheck}
                        >
                          <Ionicons
                            name={selected ? "checkbox" : "square-outline"}
                            size={22}
                            color={selected ? C.accent : C.text3}
                          />
                        </TouchableOpacity>
                        <Avatar name={m.user?.name ?? "?"} size={24} imageUrl={m.user?.avatar_url} />
                        <Text style={[styles.memberName, !selected && { opacity: 0.5 }]} numberOfLines={1}>
                          {m.user?.name}
                        </Text>
                        {splitType === "custom" && selected && (
                          <View style={styles.customAmountWrap}>
                            <Text style={styles.customCurrency}>{currencySymbol}</Text>
                            <TextInput
                              style={styles.customAmountInput}
                              keyboardType="numeric"
                              value={customAmounts[m.user_id] ?? ""}
                              onChangeText={(v) =>
                                setCustomAmounts((prev) => ({ ...prev, [m.user_id]: v }))
                              }
                              placeholder="0"
                              placeholderTextColor={C.text3}
                            />
                          </View>
                        )}
                        {splitType === "equal_selected" && selected && amount && (
                          <Text style={styles.splitPreview}>
                            {formatCurrency(
                              parseFloat(amount) / selectedMembers.size || 0,
                              currency,
                            )}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Custom split mismatch warning */}
              {customSplitMismatch && (
                <Text style={{ fontSize: FontSize.xs, color: C.red, fontWeight: "700", marginBottom: Spacing.xs }}>
                  {t("splitMismatch", lang)}: {currencySymbol}{customSplitTotal.toFixed(2)} / {currencySymbol}{parseFloat(amount).toFixed(2)}
                </Text>
              )}

              {/* Receipt */}
              {receiptUri ? (
                <View style={styles.receiptRow}>
                  <Image source={{ uri: receiptUri }} style={styles.receiptThumb} />
                  <Text style={styles.receiptText}>{t("receiptAttached", lang)}</Text>
                  <TouchableOpacity onPress={() => setReceiptUri(null)}>
                    <Ionicons name="close-circle" size={22} color={C.red} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={handlePickReceipt} style={styles.receiptBtn}>
                  <Ionicons name="camera-outline" size={20} color={C.text2} />
                  <Text style={styles.receiptBtnText}>{t("attachReceipt", lang)}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <Button
              title={t("addExpense", lang)}
              onPress={handleSubmit}
              isLoading={isLoading}
              disabled={!amount || parseFloat(amount) <= 0 || !description.trim() || customSplitMismatch}
            />
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
    gap: Spacing.md,
    maxHeight: "90%",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.surface3,
    alignSelf: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "900",
    color: C.text,
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface2,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: C.surface3,
    marginBottom: Spacing.md,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: "900",
    color: C.text3,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "900",
    color: C.text,
    paddingVertical: Spacing.md,
    marginLeft: Spacing.sm,
  },
  descInput: {
    backgroundColor: C.surface2,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: C.text,
    fontSize: FontSize.sm,
    borderWidth: 1,
    borderColor: C.surface3,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: C.text2,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  payerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: C.surface2,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  payerName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: C.text,
  },
  payerList: {
    backgroundColor: C.surface2,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: C.surface3,
    overflow: "hidden",
  },
  payerOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: C.surface3,
  },
  payerOptionActive: {
    backgroundColor: "rgba(108,99,255,0.08)",
  },
  payerOptionText: {
    fontSize: FontSize.sm,
    color: C.text,
  },
  splitTypeRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  splitChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: C.surface2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  splitChipActive: {
    backgroundColor: "rgba(108,99,255,0.15)",
    borderColor: C.accent,
  },
  splitChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.text2,
  },
  splitChipTextActive: {
    color: C.accent2,
  },
  memberList: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  memberCheck: { width: 28, alignItems: "center" },
  memberName: {
    flex: 1,
    fontSize: FontSize.sm,
    color: C.text,
    fontWeight: "600",
  },
  customAmountWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface2,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: C.surface3,
    width: 90,
  },
  customCurrency: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: C.text3,
  },
  customAmountInput: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: C.text,
    paddingVertical: 4,
    marginLeft: 4,
  },
  splitPreview: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: C.accent2,
  },
  receiptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  receiptThumb: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
  },
  receiptText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: C.green,
  },
  receiptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    backgroundColor: C.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.surface3,
    marginTop: Spacing.sm,
  },
  receiptBtnText: {
    color: C.text2,
    fontSize: FontSize.sm,
  },
});
