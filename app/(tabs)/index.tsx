import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GroupCard } from "../../src/components/GroupCard";
import { Avatar, EmptyState, SectionHeader } from "../../src/components/UI";
import { FontSize, Radius, Spacing } from "../../src/constants";
import { CURRENCIES, formatCurrency } from "../../src/lib/currency";
import { useColors } from "../../src/lib/useColors";
import { Language, t } from "../../src/lib/i18n";
import { scheduleSmartReminders } from "../../src/lib/notifications";
import { useAuthStore } from "../../src/store/authStore";
import { useGroupsStore } from "../../src/store/groupsStore";
import { UserSettings, useSettingsStore } from "../../src/store/settingsStore";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { groups, fetchGroups, isLoading } = useGroupsStore();
  const { settings, needsCurrencySetup, dismissCurrencySetup, updateSettings } =
    useSettingsStore();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const lang = settings.language;
  const translate = (key: string) => t(key, lang);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    settings.currency,
  );

  const CURRENCY_CODES = Object.keys(CURRENCIES);

  const activeGroups = useMemo(() => {
    const active = groups.filter((g) => g.status !== "archived");
    if (!searchQuery.trim()) return active;
    const q = searchQuery.toLowerCase();
    return active.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, searchQuery]);

  const archivedGroups = useMemo(() => {
    const archived = groups.filter((g) => g.status === "archived");
    if (!searchQuery.trim()) return archived;
    const q = searchQuery.toLowerCase();
    return archived.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, searchQuery]);

  useEffect(() => {
    fetchGroups();
  }, []);

  // Refresh when tab gains focus + schedule smart reminders
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, []),
  );

  // Schedule smart reminders when groups change
  useEffect(() => {
    if (groups.length > 0 && user?.id && settings.contribution_reminders) {
      scheduleSmartReminders(groups as any, user.id, lang).catch(() => {});
    }
  }, [groups, user?.id, settings.contribution_reminders, lang]);

  const onRefresh = useCallback(() => {
    fetchGroups();
  }, []);

  const handleCurrencyConfirm = useCallback(async () => {
    try {
      await updateSettings({
        currency: selectedCurrency as UserSettings["currency"],
      });
    } catch {
      // best-effort
    }
    dismissCurrencySetup();
  }, [selectedCurrency, updateSettings, dismissCurrencySetup]);

  // Compute quick stats
  const totalSaved = useMemo(
    () =>
      groups.reduce((sum, g) => {
        const userMember = g.members?.find((m) => m.user_id === user?.id);
        return sum + (userMember?.current_amount ?? 0);
      }, 0),
    [groups, user?.id],
  );

  const maxStreak = useMemo(
    () =>
      groups.reduce((max, g) => {
        const userMember = g.members?.find((m) => m.user_id === user?.id);
        return Math.max(max, userMember?.streak_days ?? 0);
      }, 0),
    [groups, user?.id],
  );

  // Get recent activity across all groups
  const recentActivity = useMemo(
    () =>
      groups
        .flatMap((g) =>
          (g.contributions ?? []).map((c) => ({ ...c, groupName: g.name })),
        )
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5),
    [groups],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={C.accent2}
          />
        }
      >
        {/* Hero Header */}
        <LinearGradient
          colors={C.gradientHero as any}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>
                {t("welcomeBack", settings.language)}
              </Text>
              <Text
                style={styles.userName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user?.name ?? t("traveler", settings.language)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
              <Avatar
                name={user?.name ?? "U"}
                size={46}
                imageUrl={user?.avatar_url}
              />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <StatCard
              label={t("totalSaved", settings.language)}
              value={formatCurrency(totalSaved, settings.currency)}
              color={C.green}
            />
            <StatCard
              label={t("activeGroups", settings.language)}
              value={String(groups.length)}
              color={C.accent2}
            />
            <StatCard
              label={t("streak", settings.language)}
              value={String(maxStreak)}
              color={C.yellow}
            />
          </View>
        </LinearGradient>

        {/* Search */}
        {groups.length > 0 && (
          <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing.sm }}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={C.text3} />
              <TextInput
                style={styles.searchInput}
                placeholder={t("searchGroups", lang)}
                placeholderTextColor={C.text3}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color={C.text3} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* My Groups */}
        <SectionHeader
          title={t("myGoals", settings.language)}
          action={t("newGoal", settings.language)}
          onAction={() => router.push("/(tabs)/create")}
          style={{ marginTop: Spacing.sm }}
        />

        {activeGroups.length === 0 && groups.length === 0 ? (
          <View style={{ paddingHorizontal: Spacing.xl }}>
            <EmptyState
              icon="flag"
              title={t("noGoalsYet", settings.language)}
              description={t("noGoalsDesc", settings.language)}
              action={{
                label: t("createFirstGoal", settings.language),
                onPress: () => router.push("/(tabs)/create"),
              }}
            />
          </View>
        ) : activeGroups.length === 0 ? (
          <View style={{ paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg }}>
            <Text style={{ color: C.text2, textAlign: "center", fontSize: FontSize.sm }}>
              {searchQuery ? t("noGoalsYet", lang) : t("noGoalsYet", lang)}
            </Text>
          </View>
        ) : (
          <FlatList
            data={activeGroups}
            keyExtractor={(item) => item.id}
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
                onPress={() => router.push("/(tabs)/create")}
                style={styles.addCard}
              >
                <Text style={styles.addCardIcon}>+</Text>
                <Text style={styles.addCardLabel}>
                  {t("newGoalCard", settings.language)}
                </Text>
              </TouchableOpacity>
            }
          />
        )}

        {/* Archived Groups */}
        {archivedGroups.length > 0 && (
          <>
            <SectionHeader
              title={t("archivedGroups", lang)}
              style={{ marginTop: Spacing.xl }}
            />
            <FlatList
              data={archivedGroups}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.groupsList}
              renderItem={({ item }) => (
                <GroupCard
                  group={item}
                  onPress={() => router.push(`/group/${item.id}`)}
                />
              )}
            />
          </>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <>
            <SectionHeader
              title={t("recentActivity", settings.language)}
              style={{ marginTop: Spacing.xl }}
            />
            <View
              style={[styles.activityCard, { marginHorizontal: Spacing.xl }]}
            >
              {recentActivity.map((item, idx) => (
                <ActivityItem key={item.id ?? idx} item={item} />
              ))}
            </View>
          </>
        )}

        {/* Join a Group */}
        <View style={styles.joinSection}>
          <TouchableOpacity
            onPress={() => router.push("/group/join")}
            style={styles.joinBtn}
          >
            <Text style={styles.joinText}>
              {t("hasInviteCode", settings.language)}
            </Text>
            <Text style={styles.joinSubtext}>
              {t("joinExistingGroup", settings.language)}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* First-login Currency Selection Modal */}
      <Modal
        visible={needsCurrencySetup}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCurrencyConfirm}
      >
        <View style={styles.currencyModalOverlay}>
          <View style={styles.currencyModalContent}>
            <Text style={styles.currencyModalTitle}>
              {translate("welcomeCurrencyTitle")}
            </Text>
            <Text style={styles.currencyModalDesc}>
              {translate("welcomeCurrencyDesc")}
            </Text>

            <FlatList
              data={CURRENCY_CODES}
              keyExtractor={(item) => item}
              style={{ maxHeight: 320 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: code }) => {
                const isSelected = selectedCurrency === code;
                return (
                  <TouchableOpacity
                    style={[
                      styles.currencyItem,
                      isSelected && styles.currencyItemSelected,
                    ]}
                    onPress={() => setSelectedCurrency(code)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.currencyItemText,
                          isSelected && styles.currencyItemTextSelected,
                        ]}
                      >
                        {translate(`currency_${code}`)}
                      </Text>
                      <Text style={styles.currencyItemCode}>{code}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={C.accent}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              style={styles.currencyConfirmBtn}
              onPress={handleCurrencyConfirm}
            >
              <LinearGradient
                colors={C.gradientPrimary as any}
                style={styles.currencyConfirmGradient}
              >
                <Text style={styles.currencyConfirmText}>
                  {translate("confirmCurrency")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const StatCard = React.memo(function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
});

function ActivityItem({
  item,
}: {
  item: {
    created_at: string;
    amount: number;
    user?: { name: string };
    groupName?: string;
  };
}) {
  const { settings } = useSettingsStore();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const timeAgo = getTimeAgo(item.created_at, settings.language);
  return (
    <View style={styles.activityItem}>
      <Ionicons
        name="cash"
        size={16}
        color={C.accent2}
        style={styles.activityIcon}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.activityText}>
          <Text style={{ fontWeight: "800" }}>
            {item.user?.name ?? t("someone", settings.language)}
          </Text>
          {` ${t("saved", settings.language)} ${formatCurrency(item.amount, settings.currency)}`}
        </Text>
        <Text style={styles.activitySub}>
          {item.groupName} · {timeAgo}
        </Text>
      </View>
    </View>
  );
}

function getTimeAgo(dateString: string, lang: Language = "es"): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return t("justNow", lang);
  if (diffH < 24) {
    return lang === "en"
      ? `${diffH}h ${t("hoursAgo", lang)}`
      : `${t("hoursAgo", lang)} ${diffH}h`;
  }
  const diffD = Math.floor(diffH / 24);
  return lang === "en"
    ? `${diffD}d ${t("daysAgo", lang)}`
    : `${t("daysAgo", lang)} ${diffD}d`;
}

const createStyles = (C: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    hero: {
      borderBottomLeftRadius: Radius.xxl,
      borderBottomRightRadius: Radius.xxl,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.xxl,
      marginBottom: Spacing.lg,
    },
    heroTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    userInfo: {
      flex: 1,
      marginRight: Spacing.md,
    },
    greeting: { fontSize: FontSize.sm, color: C.text2 },
    userName: { fontSize: FontSize.xl, fontWeight: "900", color: C.text },
    statsRow: { flexDirection: "row", gap: Spacing.sm },
    statCard: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.06)",
      borderRadius: Radius.md,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    statValue: { fontSize: FontSize.xl, fontWeight: "900", marginBottom: 2 },
    statLabel: { fontSize: FontSize.xs, color: C.text2 },
    groupsList: {
      paddingHorizontal: Spacing.xl,
      gap: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    addCard: {
      width: 130,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Radius.xl,
      borderWidth: 2,
      borderColor: C.surface3,
      borderStyle: "dashed",
      minHeight: 180,
    },
    addCardIcon: { fontSize: 32, color: C.text3, marginBottom: Spacing.sm },
    addCardLabel: {
      fontSize: FontSize.sm,
      color: C.text3,
      fontWeight: "700",
    },
    activityCard: {
      backgroundColor: C.surface,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: C.surface3,
    },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: C.surface3,
    },
    activityIcon: { marginRight: 8 },
    activityText: { fontSize: FontSize.base, color: C.text },
    activitySub: { fontSize: FontSize.xs, color: C.text2, marginTop: 2 },
    joinSection: { padding: Spacing.xl },
    joinBtn: {
      backgroundColor: C.surface2,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      alignItems: "center",
      borderWidth: 1,
      borderColor: C.surface3,
      borderStyle: "dashed",
    },
    joinText: {
      fontSize: FontSize.base,
      color: C.accent2,
      fontWeight: "700",
    },
    joinSubtext: { fontSize: FontSize.xs, color: C.text2, marginTop: 4 },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.surface2,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: C.surface3,
      paddingHorizontal: Spacing.md,
      gap: Spacing.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: FontSize.base,
      color: C.text,
    },
    // First-login currency modal
    currencyModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: Spacing.xl,
    },
    currencyModalContent: {
      width: "100%",
      backgroundColor: C.surface,
      borderRadius: Radius.xl,
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.xl,
      borderWidth: 1,
      borderColor: C.surface3,
    },
    currencyModalTitle: {
      fontSize: FontSize.xl,
      fontWeight: "800",
      color: C.text,
      textAlign: "center",
      marginBottom: Spacing.sm,
    },
    currencyModalDesc: {
      fontSize: FontSize.sm,
      color: C.text2,
      textAlign: "center",
      marginBottom: Spacing.xl,
      lineHeight: 20,
    },
    currencyItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: Radius.lg,
      marginBottom: Spacing.xs,
      backgroundColor: C.bg,
    },
    currencyItemSelected: {
      backgroundColor: C.accent + "18",
      borderWidth: 1,
      borderColor: C.accent + "40",
    },
    currencyItemText: {
      fontSize: FontSize.base,
      fontWeight: "500",
      color: C.text,
    },
    currencyItemTextSelected: {
      color: C.accent,
      fontWeight: "700",
    },
    currencyItemCode: {
      fontSize: FontSize.xs,
      color: C.text3,
      marginTop: 2,
    },
    currencyConfirmBtn: {
      marginTop: Spacing.lg,
      borderRadius: Radius.lg,
      overflow: "hidden",
    },
    currencyConfirmGradient: {
      paddingVertical: Spacing.md,
      alignItems: "center",
      borderRadius: Radius.lg,
    },
    currencyConfirmText: {
      fontSize: FontSize.base,
      fontWeight: "700",
      color: "#fff",
    },
  });
