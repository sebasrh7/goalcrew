import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontSize, Radius, Spacing } from "../constants";
import { formatCurrency } from "../lib/currency";
import { getFrequencyPeriodLabel, t } from "../lib/i18n";
import { useColors } from "../lib/useColors";
import { useSettingsStore } from "../store/settingsStore";
import { Contribution, GroupMember, GroupWithStats } from "../types";

interface GroupStatsProps {
  group: GroupWithStats;
}

export function GroupStats({ group }: GroupStatsProps) {
  const C = useColors();
  const { settings } = useSettingsStore();
  const lang = settings.language || "es";
  const currency = settings.currency || "USD";
  const styles = useMemo(() => createStyles(C), [C]);

  const stats = useMemo(() => {
    const contribs = group.contributions || [];
    const members = group.members || [];

    // Total contributions count
    const totalCount = contribs.length;

    // Average contribution
    const avgAmount =
      totalCount > 0
        ? contribs.reduce((sum, c) => sum + c.amount, 0) / totalCount
        : 0;

    // Contributions by member
    const byMember = members.map((m) => {
      const memberContribs = contribs.filter((c) => c.user_id === m.user_id);
      return {
        name: m.user?.name || "?",
        amount: m.current_amount,
        count: memberContribs.length,
        goal: m.individual_goal,
        percent:
          m.individual_goal > 0
            ? Math.round((m.current_amount / m.individual_goal) * 100)
            : 0,
      };
    });

    // Savings over time (aggregate by week)
    const weeklyData = getWeeklyAggregation(contribs);

    // Velocity: avg savings per period
    const totalDays = Math.max(
      1,
      Math.ceil(
        (Date.now() - new Date(group.created_at).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
    const dailyVelocity = group.total_saved / totalDays;

    // Projected completion
    const remaining = Math.max(0, group.total_goal - group.total_saved);
    const daysToComplete =
      dailyVelocity > 0 ? Math.ceil(remaining / dailyVelocity) : Infinity;

    return {
      totalCount,
      avgAmount,
      byMember,
      weeklyData,
      dailyVelocity,
      daysToComplete,
    };
  }, [group]);

  return (
    <View style={styles.container}>
      {/* Summary cards */}
      <View style={styles.cardsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCount}</Text>
          <Text style={styles.statLabel}>{t("totalContributions", lang)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {formatCurrency(stats.avgAmount, currency)}
          </Text>
          <Text style={styles.statLabel}>{t("avgContribution", lang)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {stats.daysToComplete === Infinity
              ? "∞"
              : `${stats.daysToComplete}d`}
          </Text>
          <Text style={styles.statLabel}>{t("projected", lang)}</Text>
        </View>
      </View>

      {/* Savings velocity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="trending-up" size={14} color={C.green} />{" "}
          {t("savingVelocity", lang)}
        </Text>
        <Text style={styles.velocityValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {formatCurrency(stats.dailyVelocity * (group.frequency === "daily" ? 1 : group.frequency === "weekly" ? 7 : group.frequency === "biweekly" ? 14 : group.frequency === "monthly" ? 30 : (group.custom_frequency_days ?? 7)), currency)}{" "}
          <Text style={styles.velocityUnit}>/{getFrequencyPeriodLabel(group.frequency, lang, group.custom_frequency_days)}</Text>
        </Text>
      </View>

      {/* Simple bar chart - savings over time */}
      {stats.weeklyData.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="bar-chart" size={14} color={C.accent2} />{" "}
            {t("savingsOverTime", lang)}
          </Text>
          <View style={styles.chartContainer}>
            {stats.weeklyData.map((week, i) => {
              const maxVal = Math.max(
                ...stats.weeklyData.map((w) => w.amount),
                1,
              );
              const height = Math.max(4, (week.amount / maxVal) * 100);
              return (
                <View key={i} style={styles.barCol}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height,
                        backgroundColor:
                          i === stats.weeklyData.length - 1
                            ? C.accent
                            : C.accent2,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{week.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Contributions by member */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="people" size={14} color={C.accent2} />{" "}
          {t("contributionsByMember", lang)}
        </Text>
        {stats.byMember.map((m, i) => (
          <View key={i} style={styles.memberBar}>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName} numberOfLines={1}>
                {m.name}
              </Text>
              <Text style={styles.memberAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {formatCurrency(m.amount, currency)} ({m.count})
              </Text>
            </View>
            <View style={styles.memberProgress}>
              <View
                style={[
                  styles.memberProgressFill,
                  {
                    width: `${Math.min(100, m.percent)}%`,
                    backgroundColor:
                      m.percent >= 70
                        ? C.green
                        : m.percent >= 40
                          ? C.accent
                          : C.yellow,
                  },
                ]}
              />
            </View>
            <Text style={styles.memberPercent}>{m.percent}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function getWeeklyAggregation(
  contributions: Contribution[],
): { label: string; amount: number }[] {
  if (contributions.length === 0) return [];

  const sorted = [...contributions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const weeks: { label: string; amount: number }[] = [];
  let currentWeekStart = getWeekStart(new Date(sorted[0].created_at));
  let currentAmount = 0;

  for (const c of sorted) {
    const weekStart = getWeekStart(new Date(c.created_at));
    if (weekStart.getTime() !== currentWeekStart.getTime()) {
      weeks.push({
        label: `W${weeks.length + 1}`,
        amount: currentAmount,
      });
      currentWeekStart = weekStart;
      currentAmount = 0;
    }
    currentAmount += c.amount;
  }
  weeks.push({ label: `W${weeks.length + 1}`, amount: currentAmount });

  // Limit to last 8 weeks
  return weeks.slice(-8);
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

const createStyles = (C: any) => StyleSheet.create({
  container: {
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  cardsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.surface3,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: "900",
    color: C.text,
  },
  statLabel: {
    fontSize: 9,
    color: C.text3,
    marginTop: 2,
    textAlign: "center",
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: C.text2,
  },
  velocityValue: {
    fontSize: FontSize.xl,
    fontWeight: "900",
    color: C.green,
  },
  velocityUnit: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: C.text3,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    gap: 4,
    paddingTop: Spacing.sm,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  bar: {
    width: "80%",
    borderRadius: 3,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 8,
    color: C.text3,
  },
  memberBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  memberInfo: {
    width: 100,
  },
  memberName: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: C.text,
  },
  memberAmount: {
    fontSize: 9,
    color: C.text3,
  },
  memberProgress: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.surface3,
    overflow: "hidden",
  },
  memberProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  memberPercent: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: C.text2,
    width: 36,
    textAlign: "right",
  },
});
