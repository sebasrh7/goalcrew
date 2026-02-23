import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, FontSize, Radius, Spacing } from "../constants";
import { GroupMember } from "../types";
import { Avatar, ProgressBar, StatusPill } from "./UI";

interface MemberRowProps {
  member: GroupMember;
  rank?: number;
  onPress?: () => void;
  showRank?: boolean;
  isCurrentUser?: boolean;
}

export function MemberRow({
  member,
  rank,
  onPress,
  showRank = false,
  isCurrentUser = false,
}: MemberRowProps) {
  const user = member.user;
  if (!user) return null;

  const progress =
    member.individual_goal > 0
      ? (member.current_amount / member.individual_goal) * 100
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
          <Text style={[styles.rank, { color: Colors.text3 }]}>{rank}</Text>
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
      <Avatar name={user.name} size={42} />

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.name, isCurrentUser && { color: Colors.accent2 }]}
          >
            {isCurrentUser ? `${user.name} (tú)` : user.name}
          </Text>
          {member.streak_days >= 3 && (
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={16} color="#FF6B35" />
              <Text style={styles.streak}>{member.streak_days}</Text>
            </View>
          )}
        </View>
        <View style={styles.subRow}>
          <StatusPill status={member.status} style={styles.statusPill} />
          {member.streak_days === 0 && (
            <View style={styles.noStreakContainer}>
              <Ionicons name="warning" size={14} color="#FF9500" />
              <Text style={styles.noStreak}>Sin racha</Text>
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
              ? { color: Colors.green }
              : member.status === "at_risk"
                ? { color: Colors.yellow }
                : { color: Colors.red },
          ]}
        >
          ${member.current_amount.toFixed(0)}
        </Text>
        <Text style={styles.goal}>/ ${member.individual_goal.toFixed(0)}</Text>
        {showRank && (
          <Text style={styles.points}>{member.total_points} pts</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface3,
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
    color: Colors.text,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusPill: {
    transform: [{ scale: 0.9 }],
  },
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
    color: Colors.text2,
  },
  points: {
    fontSize: 10,
    color: Colors.text3,
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
