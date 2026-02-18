import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Modal, TextInput, Alert, Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useGroupsStore } from '../../src/store/groupsStore';
import { useContributionsStore } from '../../src/store/contributionsStore';
import { useAuthStore } from '../../src/store/authStore';
import { MemberRow } from '../../src/components/MemberRow';
import { AchievementModal } from '../../src/components/AchievementModal';
import { Button, Card, StatusPill } from '../../src/components/UI';
import { Colors, Spacing, FontSize, Radius, ACHIEVEMENTS } from '../../src/constants';
import { GroupMember, AchievementType } from '../../src/types';
import { subscribeToGroup } from '../../src/lib/supabase';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

type TabType = 'members' | 'ranking' | 'history';

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentGroup, fetchGroup, isLoading } = useGroupsStore();
  const { addContribution, contributions, fetchContributions, isLoading: contribLoading, lastUnlockedAchievement, clearLastAchievement } = useContributionsStore();

  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [showContribModal, setShowContribModal] = useState(false);
  const [contribAmount, setContribAmount] = useState('');
  const [contribNote, setContribNote] = useState('');

  useEffect(() => {
    if (id) {
      fetchGroup(id);
      fetchContributions(id);
    }
  }, [id]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!id) return;
    const channel = subscribeToGroup(id, () => {
      fetchGroup(id);
      fetchContributions(id);
    });
    return () => { channel.unsubscribe(); };
  }, [id]);

  const onRefresh = useCallback(() => {
    if (id) {
      fetchGroup(id);
      fetchContributions(id);
    }
  }, [id]);

  const handleAddContribution = async () => {
    const amount = parseFloat(contribAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor a $0');
      return;
    }
    try {
      await addContribution(id!, amount, contribNote || undefined);
      setShowContribModal(false);
      setContribAmount('');
      setContribNote('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'No se pudo registrar el aporte');
    }
  };

  const handleShare = async () => {
    if (!currentGroup) return;
    try {
      await Share.share({
        message: `¡Únete a nuestro grupo de ahorro "${currentGroup.name}" en GoalCrew!\n\nCódigo: ${currentGroup.invite_code}\n\nDescarga la app: https://goalcrew.app`,
        title: `Únete a ${currentGroup.name}`,
      });
    } catch {
      // Copy to clipboard fallback
      await Clipboard.setStringAsync(currentGroup.invite_code);
      Alert.alert('Código copiado', `Código: ${currentGroup.invite_code}`);
    }
  };

  if (!currentGroup) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.text2 }}>Cargando grupo…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const myMember = currentGroup.members?.find(m => m.user_id === user?.id);
  const sortedByRanking = [...(currentGroup.members ?? [])].sort(
    (a, b) => b.total_points - a.total_points
  );

  // Ring progress
  const pct = Math.min(100, currentGroup.progress_percent);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct / 100);

  const deadlineFormatted = format(parseISO(currentGroup.deadline), "d 'de' MMMM, yyyy", { locale: es });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.accent2} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Mis metas</Text>
          </TouchableOpacity>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.groupEmoji}>{currentGroup.emoji}</Text>
              <Text style={styles.groupName}>{currentGroup.name}</Text>
              <View style={styles.headerPills}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>👥 {currentGroup.members?.length ?? 0}</Text>
                </View>
                {myMember && <StatusPill status={myMember.status} />}
                <View style={styles.pill}>
                  <Text style={styles.pillText}>📅 {currentGroup.days_remaining}d</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>🔗 Invitar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress ring + stats */}
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg }}>
          <Card>
            <View style={styles.progressRow}>
              {/* Ring */}
              <View style={styles.ringWrap}>
                <Svg width={100} height={100} viewBox="0 0 100 100">
                  <Defs>
                    <SvgGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor={Colors.accent} />
                      <Stop offset="100%" stopColor={Colors.accent2} />
                    </SvgGradient>
                  </Defs>
                  <Circle cx="50" cy="50" r={radius} fill="none" stroke={Colors.surface3} strokeWidth="11" />
                  <Circle
                    cx="50" cy="50" r={radius} fill="none"
                    stroke="url(#ring-grad)" strokeWidth="11"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </Svg>
                <View style={styles.ringLabel}>
                  <Text style={styles.ringPct}>{pct}%</Text>
                  <Text style={styles.ringSubtitle}>grupal</Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsCol}>
                <StatRow label="Total reunido" value={`$${currentGroup.total_saved.toFixed(0)}`} color={Colors.green} />
                <StatRow label="Meta total" value={`$${currentGroup.total_goal.toFixed(0)}`} />
                <StatRow label="Faltan" value={`$${(currentGroup.total_goal - currentGroup.total_saved).toFixed(0)}`} color={Colors.yellow} />
                <StatRow label="Fecha límite" value={deadlineFormatted} small />
              </View>
            </View>

            {/* My progress bar */}
            {myMember && (
              <View style={styles.myProgress}>
                <View style={styles.myProgressHeader}>
                  <Text style={styles.myProgressLabel}>Tu progreso</Text>
                  <Text style={styles.myProgressValue}>
                    ${myMember.current_amount.toFixed(0)} / ${myMember.individual_goal.toFixed(0)}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={Colors.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, (myMember.current_amount / myMember.individual_goal) * 100)}%` },
                    ]}
                  />
                </View>
                <View style={styles.myProgressFooter}>
                  <Text style={styles.myProgressHint}>
                    💰 Ahorra ${currentGroup.per_period_needed.toFixed(2)} cada {currentGroup.frequency === 'daily' ? 'día' : currentGroup.frequency === 'weekly' ? 'semana' : 'mes'}
                  </Text>
                  {myMember.streak_days > 0 && (
                    <Text style={styles.streakBadge}>🔥 {myMember.streak_days}d</Text>
                  )}
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Tabs */}
        <View style={{ paddingHorizontal: Spacing.xl }}>
          <View style={styles.tabBar}>
            {(['members', 'ranking', 'history'] as TabType[]).map(tab => {
              const labels = { members: '👥 Miembros', ranking: '🏆 Ranking', history: '📋 Historial' };
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {labels[tab]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Card style={{ paddingVertical: Spacing.sm }}>
            {activeTab === 'members' && (
              <>
                {currentGroup.members?.map(member => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isCurrentUser={member.user_id === user?.id}
                  />
                ))}
              </>
            )}

            {activeTab === 'ranking' && (
              <>
                <Text style={styles.rankingSubtitle}>Puntos acumulados esta semana</Text>
                {sortedByRanking.map((member, idx) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    rank={idx + 1}
                    showRank
                    isCurrentUser={member.user_id === user?.id}
                  />
                ))}
              </>
            )}

            {activeTab === 'history' && (
              <>
                {contributions.length === 0 ? (
                  <Text style={styles.emptyText}>Aún no hay aportes registrados</Text>
                ) : (
                  contributions.map(c => (
                    <View key={c.id} style={styles.historyItem}>
                      <View style={[styles.historyDot, { backgroundColor: Colors.green }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyName}>
                          <Text style={{ fontWeight: '800' }}>{c.user?.name ?? 'Alguien'}</Text>
                          {` ahorró $${c.amount}`}
                        </Text>
                        {c.note && <Text style={styles.historyNote}>"{c.note}"</Text>}
                        <Text style={styles.historyDate}>
                          {format(new Date(c.created_at), "d MMM · HH:mm", { locale: es })}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
          </Card>
        </View>

        {/* Register contribution CTA */}
        <View style={styles.ctaSection}>
          <Button
            title="💰 Registrar mi aporte"
            onPress={() => setShowContribModal(true)}
            style={{ overflow: 'hidden' }}
          />
        </View>
      </ScrollView>

      {/* Achievement Modal */}
      <AchievementModal
        achievementType={lastUnlockedAchievement as AchievementType | null}
        onDismiss={clearLastAchievement}
      />

      {/* Contribution Modal */}
      <Modal
        visible={showContribModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowContribModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBg}
          activeOpacity={1}
          onPress={() => setShowContribModal(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>💰 Registrar aporte</Text>
            <Text style={styles.modalSubtitle}>
              {currentGroup.name} · Meta: ${myMember?.individual_goal.toFixed(0)}
            </Text>

            <View style={styles.amountWrap}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor={Colors.text3}
                value={contribAmount}
                onChangeText={setContribAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            {/* Quick amounts */}
            <View style={styles.quickAmounts}>
              {[25, 50, 75, 100].map(v => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setContribAmount(String(v))}
                  style={styles.quickBtn}
                >
                  <Text style={styles.quickBtnText}>${v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="Nota (opcional) — ej. Ahorro de quincena"
              placeholderTextColor={Colors.text3}
              value={contribNote}
              onChangeText={setContribNote}
            />

            <Button
              title="✅ Confirmar aporte"
              onPress={handleAddContribution}
              isLoading={contribLoading}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function StatRow({ label, value, color, small }: any) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color && { color }, small && { fontSize: FontSize.xs }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.xl, paddingBottom: Spacing.lg },
  backBtn: { marginBottom: Spacing.md },
  backText: { color: Colors.accent2, fontWeight: '700', fontSize: FontSize.base },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  groupEmoji: { fontSize: 36, marginBottom: 6 },
  groupName: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  headerPills: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  pill: { backgroundColor: Colors.surface2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.surface3 },
  pillText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text2 },
  shareBtn: { backgroundColor: Colors.surface2, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.surface3 },
  shareBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.lg },
  ringWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ringLabel: { position: 'absolute', alignItems: 'center' },
  ringPct: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  ringSubtitle: { fontSize: FontSize.xs, color: Colors.text2 },
  statsCol: { flex: 1, gap: Spacing.sm },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: FontSize.xs, color: Colors.text2 },
  statValue: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  myProgress: { borderTopWidth: 1, borderTopColor: Colors.surface3, paddingTop: Spacing.md, gap: Spacing.sm },
  myProgressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  myProgressLabel: { fontSize: FontSize.sm, color: Colors.text2, fontWeight: '600' },
  myProgressValue: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  progressTrack: { height: 8, backgroundColor: Colors.surface3, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  myProgressFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  myProgressHint: { fontSize: FontSize.xs, color: Colors.text2 },
  streakBadge: { fontSize: FontSize.sm, color: Colors.yellow, fontWeight: '800' },
  tabBar: { flexDirection: 'row', backgroundColor: Colors.surface2, borderRadius: Radius.md, padding: 4, marginBottom: Spacing.md },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.surface },
  tabText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text2 },
  tabTextActive: { color: Colors.text },
  rankingSubtitle: { fontSize: FontSize.xs, color: Colors.text2, marginBottom: Spacing.sm, paddingHorizontal: 4 },
  historyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.surface3 },
  historyDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0 },
  historyName: { fontSize: FontSize.base, color: Colors.text },
  historyNote: { fontSize: FontSize.xs, color: Colors.text2, fontStyle: 'italic', marginTop: 2 },
  historyDate: { fontSize: FontSize.xs, color: Colors.text3, marginTop: 2 },
  emptyText: { textAlign: 'center', color: Colors.text2, fontSize: FontSize.base, paddingVertical: Spacing.xl },
  ctaSection: { padding: Spacing.xl },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    paddingBottom: 48,
    gap: Spacing.md,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.surface3, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.sm },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  modalSubtitle: { fontSize: FontSize.sm, color: Colors.text2 },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surface3,
    paddingHorizontal: Spacing.lg,
  },
  currencySymbol: { fontSize: 28, fontWeight: '900', color: Colors.text2 },
  amountInput: { flex: 1, paddingVertical: 14, fontSize: 36, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  quickAmounts: { flexDirection: 'row', gap: Spacing.sm },
  quickBtn: { flex: 1, backgroundColor: Colors.surface2, borderRadius: Radius.md, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.surface3 },
  quickBtnText: { fontSize: FontSize.base, fontWeight: '800', color: Colors.text },
  noteInput: {
    backgroundColor: Colors.surface2, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.surface3,
    paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSize.base, color: Colors.text,
  },
});
