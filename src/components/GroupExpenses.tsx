import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontSize, Radius, Spacing } from "../constants";
import { formatCurrency } from "../lib/currency";
import { impactAsync } from "../lib/haptics";
import { Language, t } from "../lib/i18n";
import { subscribeToExpenses, uploadExpenseReceipt } from "../lib/supabase";
import { useColors } from "../lib/useColors";
import { useAuthStore } from "../store/authStore";
import { useExpensesStore } from "../store/expensesStore";
import { Expense, ExpenseSplitType, GroupMember, SimplifiedDebt } from "../types";
import { AddExpenseModal } from "./AddExpenseModal";
import { BalanceSummary } from "./BalanceSummary";
import { SettleDebtModal } from "./SettleDebtModal";
import { Avatar } from "./UI";

interface GroupExpensesProps {
  groupId: string;
  members: GroupMember[];
  currency: string;
  lang: Language;
}

export function GroupExpenses({ groupId, members, currency, lang }: GroupExpensesProps) {
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { user } = useAuthStore();

  const {
    expenses,
    simplifiedDebts,
    isLoading,
    fetchExpenses,
    fetchSettlements,
    addExpense,
    deleteExpense,
    settleDebt,
  } = useExpensesStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<SimplifiedDebt | null>(null);
  const [addingExpense, setAddingExpense] = useState(false);
  const [settlingDebt, setSettlingDebt] = useState(false);

  const dateLocale = lang === "es" ? es : lang === "fr" ? fr : enUS;

  // Load data
  useEffect(() => {
    fetchExpenses(groupId);
    fetchSettlements(groupId);
  }, [groupId]);

  // Realtime subscription
  useEffect(() => {
    const channel = subscribeToExpenses(groupId, () => {
      fetchExpenses(groupId);
      fetchSettlements(groupId);
    });
    return () => { channel.unsubscribe(); };
  }, [groupId]);

  const handleSettle = useCallback((debt: SimplifiedDebt) => {
    impactAsync("Light");
    setSelectedDebt(debt);
    setShowSettleModal(true);
  }, []);

  const handleConfirmSettle = useCallback(async (amount: number) => {
    if (!selectedDebt) return;
    setSettlingDebt(true);
    try {
      await settleDebt(groupId, selectedDebt.from_user.id, selectedDebt.to_user.id, amount);
      setShowSettleModal(false);
      setSelectedDebt(null);
    } catch {
      Alert.alert(t("error", lang));
    } finally {
      setSettlingDebt(false);
    }
  }, [selectedDebt, groupId, lang]);

  const handleAddExpense = useCallback(async (data: {
    paidBy: string;
    amount: number;
    description: string;
    splitType: ExpenseSplitType;
    splits: { user_id: string; amount: number }[];
    receiptUri?: string;
  }) => {
    setAddingExpense(true);
    try {
      let receiptUrl: string | undefined;
      if (data.receiptUri && user) {
        const file = {
          uri: data.receiptUri,
          name: `receipt_${Date.now()}.jpg`,
          type: "image/jpeg",
        };
        receiptUrl = await uploadExpenseReceipt(user.id, file as any);
      }
      await addExpense(
        groupId,
        data.paidBy,
        data.amount,
        data.description,
        data.splitType,
        data.splits,
        receiptUrl,
      );
    } catch {
      Alert.alert(t("error", lang));
    } finally {
      setAddingExpense(false);
    }
  }, [groupId, user, lang]);

  const handleDeleteExpense = useCallback((expense: Expense) => {
    impactAsync("Light");
    Alert.alert(
      t("deleteExpense", lang),
      t("deleteExpenseConfirm", lang),
      [
        { text: t("cancel", lang), style: "cancel" },
        {
          text: t("delete", lang),
          style: "destructive",
          onPress: () => deleteExpense(expense.id, groupId),
        },
      ],
    );
  }, [groupId, lang]);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses],
  );

  const renderExpense = ({ item }: { item: Expense }) => {
    const isOwn = item.paid_by === user?.id;
    return (
      <View style={styles.expenseRow}>
        <Avatar
          name={item.user?.name ?? "?"}
          size={32}
          imageUrl={item.user?.avatar_url}
        />
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseDesc} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.expenseMeta} numberOfLines={1}>
            {item.user?.name} · {format(new Date(item.created_at), "d MMM", { locale: dateLocale })}
          </Text>
        </View>
        <Text style={[styles.expenseAmount, isOwn && { color: C.green }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {formatCurrency(Number(item.amount), currency)}
        </Text>
        {isOwn && (
          <TouchableOpacity
            onPress={() => handleDeleteExpense(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ paddingLeft: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={C.red} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Balance Summary */}
      <BalanceSummary
        debts={simplifiedDebts}
        currentUserId={user?.id ?? ""}
        currency={currency}
        lang={lang}
        onSettle={handleSettle}
      />

      {/* Total + Add button */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.totalLabel}>{t("totalExpenses", lang)}</Text>
          <Text style={styles.totalAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {formatCurrency(totalExpenses, currency)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => { impactAsync("Light"); setShowAddModal(true); }}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Expense list */}
      {isLoading && expenses.length === 0 ? (
        <ActivityIndicator color={C.accent} style={{ paddingVertical: Spacing.xl }} />
      ) : expenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={36} color={C.text3} />
          <Text style={styles.emptyTitle}>{t("noExpenses", lang)}</Text>
          <Text style={styles.emptyDesc}>{t("noExpensesDesc", lang)}</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpense}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 2 }}
        />
      )}

      {/* Modals */}
      <AddExpenseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        members={members}
        currentUserId={user?.id ?? ""}
        currency={currency}
        lang={lang}
        isLoading={addingExpense}
        onSubmit={handleAddExpense}
      />

      <SettleDebtModal
        visible={showSettleModal}
        onClose={() => { setShowSettleModal(false); setSelectedDebt(null); }}
        debt={selectedDebt}
        currency={currency}
        lang={lang}
        isLoading={settlingDebt}
        onConfirm={handleConfirmSettle}
      />
    </View>
  );
}

const createStyles = (C: any) => StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: C.surface3,
  },
  totalLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: C.text3,
  },
  totalAmount: {
    fontSize: FontSize.lg,
    fontWeight: "900",
    color: C.text,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.surface3,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDesc: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: C.text,
  },
  expenseMeta: {
    fontSize: FontSize.xs,
    color: C.text3,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: FontSize.base,
    fontWeight: "900",
    color: C.text,
  },
  emptyState: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: C.text2,
  },
  emptyDesc: {
    fontSize: FontSize.sm,
    color: C.text3,
    textAlign: "center",
  },
});
