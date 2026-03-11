import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontSize, getLevelConfig, getUserLevel, Radius, Spacing } from "../constants";
import { useColors } from "../lib/useColors";
import { formatCurrency } from "../lib/currency";
import { t } from "../lib/i18n";
import { useSettingsStore } from "../store/settingsStore";
import { GroupMember } from "../types";
import { Avatar, ProgressBar, StatusPill } from "./UI";

interface MemberRowProps {
  member: GroupMember;
  rank?: number;
  onPress?: () => void;
  showRank?: boolean;
  isCurrentUser?: boolean;
}

export const MemberRow = React.memo(function MemberRow({
  member,
  rank,
  onPress,
  showRank = false,
  isCurrentUser = false,
}: MemberRowProps) {
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const user = member.user;
  const { settings } = useSettingsStore();
  const lang = settings.language || "es";
  if (!user) return null;

  const progress =
    member.individual_goal > 0
      ? Math.min((member.current_amount / member.individual_goal) * 100, 100)
      : 0;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Ionicons name="trophy" size={20} color="#FFD700" />;
      case 2:
        return <Ionicons name="trophy" size={20} color="#C0C0C0" />;
      case 3:
        return <Ionicons name="trophy" size={20} color="#CD7F32" />;
      default:
        return (
          <Text style={[styles.rank, { color: C.text3 }]}>{rank}</Text>
        );
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.row, isCurrentUser && styles.highlighted]}
    >
      {/* Rank */}
      {showRank && rank !== undefined && (
        <View style={styles.rankContainer}>{getRankIcon(rank)}</View>
      )}

      {/* Avatar */}
      <Avatar name={user.name} size={42} imageUrl={user.avatar_url} />

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.name, isCurrentUser && { color: C.accent2 }]}
            numberOfLines={1}
          >
            {isCurrentUser ? `${user.name} ${t("youSuffix", lang)}` : user.name}
          </Text>
          {member.streak_days >= 3 && (
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={16} color="#FF6B35" />
              <Text style={styles.streak}>{member.streak_days}</Text>
            </View>
          )}
        </View>
        <View style={styles.subRow}>
          <StatusPill
            status={member.status}
            style={styles.statusPill}
            lang={lang}
          />
          {member.streak_days === 0 && (
            <View style={styles.noStreakContainer}>
              <Ionicons name="warning" size={14} color="#FF9500" />
              <Text style={styles.noStreak}>{t("noStreak", lang)}</Text>
            </View>
          )}
        </View>
        <ProgressBar
          progress={progress}
          height={3}
          style={styles.progressBar}
        />
      </View>

      {/* Amounts */}
      <View style={styles.amounts}>
        <Text
          style={[
            styles.amount,
            member.status === "on_track"
              ? { color: C.green }
              : member.status === "at_risk"
                ? { color: C.yellow }
                : { color: C.red },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {formatCurrency(member.current_amount, settings.currency)}
        </Text>
        <Text style={styles.goal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          / {formatCurrency(member.individual_goal, settings.currency)}
        </Text>
        {showRank && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons
              name={getLevelConfig(getUserLevel(member.total_points).level).icon as any}
              size={12}
              color={getLevelConfig(getUserLevel(member.total_points).level).color}
            />
            <Text style={styles.points}>
              {member.total_points} {t("pts", lang)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (C: any) => StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: C.surface3,
  },
  highlighted: {
    backgroundColor: "rgba(108,99,255,0.07)",
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderBottomWidth: 0,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: C.text,
    flexShrink: 1,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusPill: {},
  progressBar: {
    marginTop: 2,
  },
  amounts: {
    alignItems: "flex-end",
    minWidth: 72,
  },
  amount: {
    fontSize: FontSize.base,
    fontWeight: "900",
  },
  goal: {
    fontSize: FontSize.xs,
    color: C.text2,
  },
  points: {
    fontSize: 10,
    color: C.text3,
    marginTop: 2,
  },
  rank: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    textAlign: "center",
  },
  rankContainer: {
    width: 24,
    alignItems: "center",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  noStreakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streak: {
    fontSize: FontSize.xs,
    color: "#FF6B35",
    fontWeight: "700",
  },
  noStreak: {
    fontSize: FontSize.xs,
    color: "#FF9500",
    fontWeight: "600",
  },
});
