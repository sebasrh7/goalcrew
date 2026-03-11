import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontSize, Radius, Spacing } from "../constants";
import { formatCurrency } from "../lib/currency";
import { Language, t } from "../lib/i18n";
import { useColors } from "../lib/useColors";
import { SimplifiedDebt } from "../types";
import { Avatar } from "./UI";

interface BalanceSummaryProps {
  debts: SimplifiedDebt[];
  currentUserId: string;
  currency: string;
  lang: Language;
  onSettle: (debt: SimplifiedDebt) => void;
}

export function BalanceSummary({ debts, currentUserId, currency, lang, onSettle }: BalanceSummaryProps) {
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);

  if (debts.length === 0) {
    return (
      <View style={styles.settledCard}>
        <Ionicons name="checkmark-circle" size={32} color={C.green} />
        <Text style={styles.settledText}>{t("allSettled", lang)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {debts.map((debt, i) => {
        if (!debt.from_user || !debt.to_user) return null;
        const isYouOwe = debt.from_user.id === currentUserId;
        const isOwedToYou = debt.to_user.id === currentUserId;

        return (
          <View key={`${debt.from_user.id}-${debt.to_user.id}`} style={styles.debtRow}>
            <Avatar name={debt.from_user.name ?? "?"} size={28} imageUrl={debt.from_user.avatar_url} />
            <View style={styles.debtInfo}>
              <Text style={styles.debtText} numberOfLines={1}>
                <Text style={{ fontWeight: "800", color: isYouOwe ? C.red : C.text }}>
                  {isYouOwe ? t("youOwe", lang) : debt.from_user.name}
                </Text>
                {" "}
                <Text style={{ color: C.text3 }}>{t("owes", lang)}</Text>
                {" "}
                <Text style={{ fontWeight: "800", color: isOwedToYou ? C.green : C.text }}>
                  {isOwedToYou ? t("youAreOwed", lang) : debt.to_user.name}
                </Text>
              </Text>
              <Text style={[styles.debtAmount, isYouOwe ? { color: C.red } : isOwedToYou ? { color: C.green } : {}]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {formatCurrency(debt.amount, currency)}
              </Text>
            </View>
            {(isYouOwe || isOwedToYou) && (
              <TouchableOpacity onPress={() => onSettle(debt)} style={styles.settleBtn}>
                <Text style={styles.settleBtnText}>{t("settleUp", lang)}</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (C: any) => StyleSheet.create({
  container: { gap: Spacing.sm },
  settledCard: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  settledText: {
    fontSize: FontSize.sm,
    color: C.green,
    fontWeight: "700",
  },
  debtRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.surface3,
  },
  debtInfo: { flex: 1 },
  debtText: { fontSize: FontSize.sm, color: C.text },
  debtAmount: {
    fontSize: FontSize.base,
    fontWeight: "900",
    color: C.text,
    marginTop: 2,
  },
  settleBtn: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    backgroundColor: "rgba(108,99,255,0.15)",
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.3)",
  },
  settleBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: C.accent2,
  },
});
