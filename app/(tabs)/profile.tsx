import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/store/authStore';
import { useGroupsStore } from '../../src/store/groupsStore';
import { Avatar, Button, Card, SectionHeader } from '../../src/components/UI';
import { Colors, Spacing, FontSize, Radius, ACHIEVEMENTS } from '../../src/constants';
import { AchievementType } from '../../src/types';

const DAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuthStore();
  const { groups } = useGroupsStore();

  // Compute stats
  const totalSaved = groups.reduce((sum, g) => {
    const m = g.members?.find(m => m.user_id === user?.id);
    return sum + (m?.current_amount ?? 0);
  }, 0);

  const totalPoints = groups.reduce((sum, g) => {
    const m = g.members?.find(m => m.user_id === user?.id);
    return sum + (m?.total_points ?? 0);
  }, 0);

  const maxStreak = groups.reduce((max, g) => {
    const m = g.members?.find(m => m.user_id === user?.id);
    return Math.max(max, m?.streak_days ?? 0);
  }, 0);

  // Collect all earned achievements (unique)
  const earnedAchievements = new Set<AchievementType>();
  // In a real app, fetch from DB
  if (maxStreak >= 3) earnedAchievements.add('streak_3');
  if (maxStreak >= 7) earnedAchievements.add('streak_7');
  if (totalSaved > 0) earnedAchievements.add('first_contribution');

  // Build streak week dots (simulate)
  const streakDots = DAYS_SHORT.map((day, idx) => ({
    day,
    done: idx < maxStreak,
    isToday: idx === new Date().getDay() - 1,
  }));

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  if (!user) return null;

  const allAchievements = Object.keys(ACHIEVEMENTS) as AchievementType[];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header gradient */}
        <LinearGradient colors={['#1a1555', Colors.bg]} style={styles.headerGradient}>
          <View style={styles.profileHero}>
            <View style={styles.avatarWrap}>
              <Avatar name={user.name} size={88} />
              <View style={styles.editAvatarBtn}>
                <Text style={{ fontSize: 12 }}>📷</Text>
              </View>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.badges}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>🏆 Nivel 3</Text>
              </View>
              {maxStreak > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakBadgeText}>🔥 Racha {maxStreak}</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Total ahorrado" value={`$${totalSaved.toFixed(0)}`} color={Colors.green} />
          <StatCard label="Puntos" value={totalPoints.toLocaleString()} color={Colors.accent2} />
          <StatCard label="Medallas" value={String(earnedAchievements.size)} color={Colors.yellow} />
        </View>

        {/* Streak */}
        <SectionHeader title="Racha semanal 🔥" style={{ marginTop: Spacing.xl }} />
        <View style={{ paddingHorizontal: Spacing.xl }}>
          <Card>
            <View style={styles.streakRow}>
              <View>
                <Text style={styles.streakNumber}>{maxStreak} días</Text>
                <Text style={styles.streakSub}>
                  {maxStreak >= 7 ? '🏆 ¡Racha épica!' :
                   maxStreak >= 3 ? '🔥 ¡Vas bien!' :
                   maxStreak >= 1 ? '💪 ¡Sigue así!' :
                   '🌱 ¡Empieza hoy!'}
                </Text>
              </View>
              <Text style={styles.streakBigEmoji}>
                {maxStreak >= 7 ? '🔥🔥🔥' : maxStreak >= 3 ? '🔥🔥' : '🔥'}
              </Text>
            </View>
            <View style={styles.streakDots}>
              {streakDots.map((d, i) => (
                <View
                  key={i}
                  style={[
                    styles.streakDot,
                    d.done ? styles.streakDotDone :
                    d.isToday ? styles.streakDotToday :
                    styles.streakDotEmpty,
                  ]}
                >
                  <Text style={[
                    styles.streakDotText,
                    d.done ? { color: '#000' } : { color: Colors.text3 },
                  ]}>{d.day}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Achievements */}
        <SectionHeader title="Mis medallas" style={{ marginTop: Spacing.xl }} />
        <View style={styles.achievementsGrid}>
          {allAchievements.map(type => {
            const a = ACHIEVEMENTS[type];
            const earned = earnedAchievements.has(type);
            return (
              <View key={type} style={[styles.medalCard, earned && styles.medalCardEarned]}>
                <Text style={[styles.medalEmoji, !earned && styles.medalLocked]}>{a.emoji}</Text>
                <Text style={[styles.medalName, !earned && styles.medalLockedText]}>{a.title}</Text>
                {!earned && <Text style={styles.medalLockIcon}>🔒</Text>}
              </View>
            );
          })}
        </View>

        {/* My groups summary */}
        <SectionHeader title="Mis grupos" style={{ marginTop: Spacing.xl }} />
        <View style={{ paddingHorizontal: Spacing.xl, gap: Spacing.sm }}>
          {groups.map(group => {
            const myMember = group.members?.find(m => m.user_id === user.id);
            return (
              <Card key={group.id} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                <Text style={{ fontSize: 28 }}>{group.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', color: Colors.text, marginBottom: 4 }}>{group.name}</Text>
                  <Text style={{ fontSize: FontSize.xs, color: Colors.text2 }}>
                    ${myMember?.current_amount.toFixed(0)} / ${myMember?.individual_goal.toFixed(0)} · {group.progress_percent}% global
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Settings */}
        <View style={{ padding: Spacing.xl, gap: Spacing.md, marginTop: Spacing.xl }}>
          <Button
            title="⚙️ Configuración"
            variant="secondary"
            onPress={() => {}}
          />
          <Button
            title="Cerrar sesión"
            variant="danger"
            onPress={handleSignOut}
          />
          <Text style={styles.version}>GoalCrew v1.0.0 · Made with ❤️</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  headerGradient: { paddingBottom: Spacing.xl },
  profileHero: { alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  avatarWrap: { position: 'relative', marginBottom: Spacing.md },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.surface2,
    borderWidth: 2, borderColor: Colors.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text, marginBottom: 4 },
  userEmail: { fontSize: FontSize.sm, color: Colors.text2, marginBottom: Spacing.md },
  badges: { flexDirection: 'row', gap: Spacing.sm },
  levelBadge: { backgroundColor: 'rgba(108,99,255,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  levelBadgeText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent2 },
  streakBadge: { backgroundColor: 'rgba(251,191,36,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)' },
  streakBadgeText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.yellow },
  statsRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, marginTop: Spacing.lg,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surface3, alignItems: 'center',
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: FontSize.xs, color: Colors.text2, textAlign: 'center' },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  streakNumber: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text },
  streakSub: { fontSize: FontSize.sm, color: Colors.text2, marginTop: 2 },
  streakBigEmoji: { fontSize: FontSize.xl },
  streakDots: { flexDirection: 'row', gap: Spacing.sm },
  streakDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  streakDotDone: { backgroundColor: Colors.green },
  streakDotToday: { backgroundColor: Colors.accent },
  streakDotEmpty: { backgroundColor: Colors.surface3 },
  streakDotText: { fontSize: FontSize.xs, fontWeight: '800' },
  achievementsGrid: {
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  medalCard: {
    width: '30%',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  medalCardEarned: {
    borderColor: 'rgba(108,99,255,0.4)',
    backgroundColor: 'rgba(108,99,255,0.08)',
  },
  medalEmoji: { fontSize: 28, marginBottom: 6 },
  medalLocked: { opacity: 0.3 },
  medalName: { fontSize: 10, color: Colors.text2, textAlign: 'center', lineHeight: 14 },
  medalLockedText: { opacity: 0.5 },
  medalLockIcon: { fontSize: 12, marginTop: 4, opacity: 0.5 },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.text3,
    marginTop: Spacing.sm,
  },
});
