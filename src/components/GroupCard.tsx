import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { GroupWithStats } from '../types';
import { ProgressBar } from './UI';
import { Colors, Spacing, Radius, FontSize } from '../constants';

interface GroupCardProps {
  group: GroupWithStats;
  onPress: () => void;
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const deadlineFormatted = format(parseISO(group.deadline), "d MMM", { locale: es });
  const memberCount = group.members?.length ?? 0;

  const progressColor =
    group.progress_percent >= 70 ? Colors.green :
    group.progress_percent >= 40 ? Colors.accent :
    Colors.yellow;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <LinearGradient
        colors={['#1c2338', '#141929']}
        style={styles.card}
      >
        <Text style={styles.emoji}>{group.emoji}</Text>
        <Text style={styles.name} numberOfLines={1}>{group.name}</Text>

        <View style={styles.meta}>
          <Text style={styles.metaText}>👥 {memberCount}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{deadlineFormatted}</Text>
        </View>

        <Text style={[styles.percent, { color: progressColor }]}>
          {group.progress_percent}%
        </Text>

        <ProgressBar
          progress={group.progress_percent}
          height={5}
          color={progressColor}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ${group.total_saved.toFixed(0)} de ${group.total_goal.toFixed(0)}
          </Text>
          <Text style={[styles.daysLeft, group.days_remaining < 30 && { color: Colors.yellow }]}>
            {group.days_remaining}d
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  emoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.md,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.text2,
  },
  metaDot: {
    color: Colors.text3,
    fontSize: FontSize.xs,
  },
  percent: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  footerText: {
    fontSize: 10,
    color: Colors.text2,
  },
  daysLeft: {
    fontSize: 10,
    color: Colors.text3,
    fontWeight: '700',
  },
});
