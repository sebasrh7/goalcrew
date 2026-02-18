import React, { useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/authStore';
import { useGroupsStore } from '../../src/store/groupsStore';
import { GroupCard } from '../../src/components/GroupCard';
import { EmptyState, SectionHeader, Avatar } from '../../src/components/UI';
import { Colors, Spacing, FontSize, Radius } from '../../src/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { groups, fetchGroups, isLoading } = useGroupsStore();

  useEffect(() => {
    fetchGroups();
  }, []);

  const onRefresh = useCallback(() => {
    fetchGroups();
  }, []);

  // Compute quick stats
  const totalSaved = groups.reduce((sum, g) => {
    const userMember = g.members?.find(m => m.user_id === user?.id);
    return sum + (userMember?.current_amount ?? 0);
  }, 0);

  const maxStreak = groups.reduce((max, g) => {
    const userMember = g.members?.find(m => m.user_id === user?.id);
    return Math.max(max, userMember?.streak_days ?? 0);
  }, 0);

  // Get recent activity across all groups
  const recentActivity = groups
    .flatMap(g => (g.contributions ?? []).map(c => ({ ...c, groupName: g.name })))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={Colors.accent2}
          />
        }
      >
        {/* Hero Header */}
        <LinearGradient
          colors={['#1a1555', '#0f1729', Colors.bg]}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>¡Hola de vuelta!</Text>
              <Text style={styles.userName}>{user?.name ?? 'Viajero'} 👋</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <Avatar name={user?.name ?? 'U'} size={46} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <StatCard label="Total ahorrado" value={`$${totalSaved.toFixed(0)}`} color={Colors.green} />
            <StatCard label="Grupos activos" value={String(groups.length)} color={Colors.accent2} />
            <StatCard label="Racha 🔥" value={`${maxStreak}d`} color={Colors.yellow} />
          </View>
        </LinearGradient>

        {/* My Groups */}
        <SectionHeader
          title="Mis metas"
          action="+ Nueva"
          onAction={() => router.push('/(tabs)/create')}
          style={{ marginTop: Spacing.sm }}
        />

        {groups.length === 0 ? (
          <View style={{ paddingHorizontal: Spacing.xl }}>
            <EmptyState
              emoji="✈️"
              title="Sin metas todavía"
              description="Crea tu primera meta grupal y empieza a ahorrar con tu crew."
              action={{
                label: '🚀 Crear primera meta',
                onPress: () => router.push('/(tabs)/create'),
              }}
            />
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.groupsList}
            renderItem={({ item }) => (
              <GroupCard
                group={item}
                onPress={() => router.push(`/group/${item.id}`)}
              />
            )}
            ListFooterComponent={
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/create')}
                style={styles.addCard}
              >
                <Text style={styles.addCardIcon}>+</Text>
                <Text style={styles.addCardLabel}>Nueva meta</Text>
              </TouchableOpacity>
            }
          />
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <>
            <SectionHeader title="Actividad reciente" style={{ marginTop: Spacing.xl }} />
            <View style={[styles.activityCard, { marginHorizontal: Spacing.xl }]}>
              {recentActivity.map((item, idx) => (
                <ActivityItem key={item.id ?? idx} item={item} />
              ))}
            </View>
          </>
        )}

        {/* Join a Group */}
        <View style={styles.joinSection}>
          <TouchableOpacity
            onPress={() => router.push('/group/join')}
            style={styles.joinBtn}
          >
            <Text style={styles.joinText}>🔗 ¿Tienes un código de invitación?</Text>
            <Text style={styles.joinSubtext}>Únete a un grupo existente</Text>
          </TouchableOpacity>
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

function ActivityItem({ item }: { item: any }) {
  const timeAgo = getTimeAgo(item.created_at);
  return (
    <View style={styles.activityItem}>
      <Text style={styles.activityIcon}>💰</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.activityText}>
          <Text style={{ fontWeight: '800' }}>{item.user?.name ?? 'Alguien'}</Text>
          {` ahorró $${item.amount}`}
        </Text>
        <Text style={styles.activitySub}>{item.groupName} · {timeAgo}</Text>
      </View>
    </View>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return 'hace poco';
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `hace ${diffD}d`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  hero: {
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  greeting: { fontSize: FontSize.sm, color: Colors.text2 },
  userName: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: FontSize.xs, color: Colors.text2 },
  groupsList: { paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.sm },
  addCard: {
    width: 130,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.surface3,
    borderStyle: 'dashed',
    minHeight: 180,
  },
  addCardIcon: { fontSize: 32, color: Colors.text3, marginBottom: Spacing.sm },
  addCardLabel: { fontSize: FontSize.sm, color: Colors.text3, fontWeight: '700' },
  activityCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface3,
  },
  activityIcon: { fontSize: 20 },
  activityText: { fontSize: FontSize.base, color: Colors.text },
  activitySub: { fontSize: FontSize.xs, color: Colors.text2, marginTop: 2 },
  joinSection: { padding: Spacing.xl },
  joinBtn: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surface3,
    borderStyle: 'dashed',
  },
  joinText: { fontSize: FontSize.base, color: Colors.accent2, fontWeight: '700' },
  joinSubtext: { fontSize: FontSize.xs, color: Colors.text2, marginTop: 4 },
});
