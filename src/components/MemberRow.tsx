import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GroupMember } from '../types';
import { Avatar, ProgressBar, StatusPill } from './UI';
import { Colors, Spacing, Radius, FontSize } from '../constants';

interface MemberRowProps {
  member: GroupMember;
  rank?: number;
  onPress?: () => void;
  showRank?: boolean;
  isCurrentUser?: boolean;
}

export function MemberRow({ member, rank, onPress, showRank = false, isCurrentUser = false }: MemberRowProps) {
  const user = member.user;
  if (!user) return null;

  const progress = member.individual_goal > 0
    ? (member.current_amount / member.individual_goal) * 100
    : 0;

  const rankEmojis: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.row,
        isCurrentUser && styles.highlighted,
      ]}
    >
      {/* Rank */}
      {showRank && rank !== undefined && (
        <Text style={[styles.rank, rank > 3 && { color: Colors.text3 }]}>
          {rankEmojis[rank] ?? rank}
        </Text>
      )}

      {/* Avatar */}
      <Avatar name={user.name} size={42} />

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, isCurrentUser && { color: Colors.accent2 }]}>
            {isCurrentUser ? `${user.name} (tú)` : user.name}
          </Text>
          {member.streak_days >= 3 && (
            <Text style={styles.streak}>🔥{member.streak_days}</Text>
          )}
        </View>
        <View style={styles.subRow}>
          <StatusPill status={member.status} style={styles.statusPill} />
          {member.streak_days === 0 && (
            <Text style={styles.noStreak}>⚠️ Sin racha</Text>
          )}
        </View>
        <ProgressBar progress={progress} height={3} style={styles.progressBar} />
      </View>

      {/* Amounts */}
      <View style={styles.amounts}>
        <Text style={[
          styles.amount,
          member.status === 'on_track' ? { color: Colors.green } :
          member.status === 'at_risk' ? { color: Colors.yellow } :
          { color: Colors.red },
        ]}>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface3,
  },
  highlighted: {
    backgroundColor: 'rgba(108,99,255,0.07)',
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderBottomWidth: 0,
  },
  rank: {
    fontSize: 18,
    fontWeight: '800',
    width: 28,
    textAlign: 'center',
    color: Colors.yellow,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: FontSize.base,
    fontWeight: '800',
    color: Colors.text,
  },
  streak: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.yellow,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPill: {
    transform: [{ scale: 0.9 }],
  },
  noStreak: {
    fontSize: FontSize.xs,
    color: Colors.red,
    fontWeight: '600',
  },
  progressBar: {
    marginTop: 2,
  },
  amounts: {
    alignItems: 'flex-end',
    minWidth: 72,
  },
  amount: {
    fontSize: FontSize.base,
    fontWeight: '900',
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
});
