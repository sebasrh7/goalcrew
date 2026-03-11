import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AchievementIcon } from "../../src/components/AchievementIcon";
import { AlertModal, SelectModal } from "../../src/components/AlertModal";
import { Avatar, Button, Card, SectionHeader } from "../../src/components/UI";
import {
  ACHIEVEMENTS,
  FontSize,
  GROUP_ICONS,
  Radius,
  Spacing,
  getLevelConfig,
  getUserLevel,
} from "../../src/constants";
import { formatCurrency } from "../../src/lib/currency";
import { getAchievementText, getFrequencyPeriodLabelPlural, t } from "../../src/lib/i18n";
import { fetchAllUserAchievements, supabase } from "../../src/lib/supabase";
import { useColors } from "../../src/lib/useColors";
import { useAuthStore } from "../../src/store/authStore";
import { useGroupsStore } from "../../src/store/groupsStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { AchievementType } from "../../src/types";

export default function ProfileScreen() {
  const C = useColors();
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuthStore();
  const { groups, fetchGroups } = useGroupsStore();
  const { settings } = useSettingsStore();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    icon?: string;
    iconColor?: string;
    buttons?: {
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }[];
  }>({ visible: false, title: "" });
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const showAlert = (
    title: string,
    message?: string,
    options?: {
      icon?: string;
      iconColor?: string;
      buttons?: {
        text: string;
        onPress: () => void;
        style?: "default" | "cancel" | "destructive";
      }[];
    },
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      icon: options?.icon,
      iconColor: options?.iconColor,
      buttons: options?.buttons,
    });
  };

  const dismissAlert = () =>
    setAlertModal((prev) => ({ ...prev, visible: false }));

  const lang = settings.language || "es";
  const styles = useMemo(() => createStyles(C), [C]);

  // Compute stats
  const totalSaved = useMemo(
    () =>
      groups.reduce((sum, g) => {
        const m = g.members?.find((m) => m.user_id === user?.id);
        return sum + (m?.current_amount ?? 0);
      }, 0),
    [groups, user?.id],
  );

  const totalPoints = useMemo(
    () => {
      const fromGroups = groups.reduce((sum, g) => {
        const m = g.members?.find((m) => m.user_id === user?.id);
        return sum + (m?.total_points ?? 0);
      }, 0);
      // Use lifetime_points as floor so progress survives group deletion
      return Math.max(fromGroups, user?.lifetime_points ?? 0);
    },
    [groups, user?.id, user?.lifetime_points],
  );

  const maxStreak = useMemo(
    () => {
      const fromGroups = groups.reduce((max, g) => {
        const m = g.members?.find((m) => m.user_id === user?.id);
        return Math.max(max, m?.streak_days ?? 0);
      }, 0);
      // Use best_streak as floor so progress survives group deletion
      return Math.max(fromGroups, user?.best_streak ?? 0);
    },
    [groups, user?.id, user?.best_streak],
  );

  // Level system — computed from total points
  const levelInfo = useMemo(() => getUserLevel(totalPoints), [totalPoints]);

  // Fetch real achievements from DB
  const [earnedAchievements, setEarnedAchievements] = useState<
    Set<AchievementType>
  >(new Set());

  const loadAchievements = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchAllUserAchievements(user.id);
      const types = new Set<AchievementType>(
        data?.map((a) => a.achievement_type as AchievementType) ?? [],
      );
      setEarnedAchievements(types);
    } catch {
      // Fallback: keep empty
    }
  }, [user?.id]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Find the best member for streak info, including the group's frequency
  const bestStreakInfo = useMemo(() => {
    let best: {
      streak_days: number;
      last_completed_period: number;
      frequency: string;
      custom_frequency_days: number | null;
      group_created_at: string;
    } | null = null;
    for (const g of groups) {
      const m = g.members?.find((m) => m.user_id === user?.id);
      if (m && m.streak_days > (best?.streak_days ?? 0)) {
        best = {
          streak_days: m.streak_days,
          last_completed_period: m.last_completed_period,
          frequency: g.frequency,
          custom_frequency_days: g.custom_frequency_days,
          group_created_at: g.created_at,
        };
      }
    }
    return best;
  }, [groups, user?.id]);

  // Build streak period dots — show last 7 periods, highlight completed ones
  const NUM_DOTS = 7;
  const streakDots = useMemo(() => {
    if (!bestStreakInfo) {
      return Array.from({ length: NUM_DOTS }, (_, i) => ({
        label: String(i + 1),
        done: false,
        isCurrent: i === NUM_DOTS - 1,
      }));
    }

    const periodDays =
      bestStreakInfo.frequency === "daily"
        ? 1
        : bestStreakInfo.frequency === "weekly"
          ? 7
          : bestStreakInfo.frequency === "biweekly"
            ? 14
            : bestStreakInfo.frequency === "monthly"
              ? 30
              : (bestStreakInfo.custom_frequency_days ?? 7);

    const groupStart = new Date(bestStreakInfo.group_created_at);
    const groupStartDate = new Date(
      groupStart.getFullYear(),
      groupStart.getMonth(),
      groupStart.getDate(),
    );
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor(
      (today.getTime() - groupStartDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const currentPeriod = Math.max(0, Math.floor(diffDays / periodDays));

    // Show the last NUM_DOTS periods ending at currentPeriod
    const startPeriod = Math.max(0, currentPeriod - NUM_DOTS + 1);

    return Array.from({ length: NUM_DOTS }, (_, i) => {
      const period = startPeriod + i;
      // A period is done if it's <= lastCompletedPeriod and within streak range
      const lastCompleted = bestStreakInfo.last_completed_period;
      const streakLen = bestStreakInfo.streak_days;
      const done =
        period <= lastCompleted && period > lastCompleted - streakLen;

      return {
        label: String(period + 1), // 1-indexed for display
        done,
        isCurrent: period === currentPeriod,
      };
    });
  }, [bestStreakInfo]);

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleSignOut = () => {
    showAlert(t("signOut", lang), t("signOutConfirm", lang), {
      icon: "log-out-outline",
      iconColor: C.red,
      buttons: [
        { text: t("cancel", lang), onPress: dismissAlert, style: "cancel" },
        {
          text: t("signOutBtn", lang),
          style: "destructive",
          onPress: async () => {
            dismissAlert();
            await signOut();
            router.replace("/(auth)/welcome");
          },
        },
      ],
    });
  };

  if (!user) return null;

  const handleChangeAvatar = async () => {
    setShowPhotoModal(true);
  };

  const pickImage = async (source: "camera" | "gallery") => {
    try {
      // Request permissions
      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          showAlert(t("error", lang), t("cameraPermission", lang), {
            icon: "alert-circle",
            iconColor: C.red,
          });
          return;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          showAlert(t("error", lang), t("galleryPermission", lang), {
            icon: "alert-circle",
            iconColor: C.red,
          });
          return;
        }
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
              base64: true,
            })
          : await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
              base64: true,
            });

      if (result.canceled || !result.assets[0].base64) return;

      setIsUploadingAvatar(true);
      const asset = result.assets[0];
      const ext = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";
      const filePath = `${user.id}/avatar.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(asset.base64!), {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        showAlert(t("error", lang), t("uploadError", lang), {
          icon: "cloud-upload-outline",
          iconColor: C.red,
        });
        setIsUploadingAvatar(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add cache-busting timestamp
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update user profile
      await updateProfile({ avatar_url: publicUrl });
      setIsUploadingAvatar(false);
    } catch (error: unknown) {
      showAlert(t("error", lang), t("uploadError", lang), {
        icon: "cloud-upload-outline",
        iconColor: C.red,
      });
      setIsUploadingAvatar(false);
    }
  };

  const allAchievements = Object.keys(ACHIEVEMENTS) as AchievementType[];

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchGroups();
      await loadAchievements();
    } finally {
      setRefreshing(false);
    }
  }, [fetchGroups, loadAchievements]);

  const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.accent2}
          />
        }
      >
        <View style={styles.webContent}>
          {/* Header gradient */}
          <LinearGradient
            colors={C.gradientHero as any}
            style={styles.headerGradient}
          >
            <View style={styles.profileHero}>
              <TouchableOpacity
                style={styles.avatarWrap}
                onPress={handleChangeAvatar}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <View
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 44,
                      backgroundColor: C.surface2,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActivityIndicator size="small" color={C.accent} />
                  </View>
                ) : (
                  <Avatar
                    name={user.name}
                    size={88}
                    imageUrl={user.avatar_url}
                  />
                )}
                <View style={styles.editAvatarBtn}>
                  <Ionicons name="camera" size={12} color={C.text2} />
                </View>
              </TouchableOpacity>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.badges}>
                <View style={[styles.levelBadge, { borderColor: getLevelConfig(levelInfo.level).color + "4D", backgroundColor: getLevelConfig(levelInfo.level).color + "2A" }]}>
                  <View style={styles.levelBadgeContent}>
                    <Ionicons
                      name={getLevelConfig(levelInfo.level).icon as any}
                      size={14}
                      color={getLevelConfig(levelInfo.level).color}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.levelBadgeText, { color: getLevelConfig(levelInfo.level).color }]}>
                      {t(`levelTitle_${levelInfo.level}`, lang)}
                    </Text>
                  </View>
                </View>
                {maxStreak > 0 && (
                  <View style={styles.streakBadge}>
                    <View style={styles.streakBadgeContent}>
                      <Ionicons
                        name="flame"
                        size={14}
                        color={C.yellow}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.streakBadgeText}>
                        {t("streak", lang)} {maxStreak}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard
              label={t("totalSaved", lang)}
              value={formatCurrency(totalSaved, settings.currency)}
              color={C.green}
            />
            <StatCard
              label={t("points", lang)}
              value={totalPoints.toLocaleString()}
              color={C.accent2}
            />
            <StatCard
              label={t("medals", lang)}
              value={String(earnedAchievements.size)}
              color={C.yellow}
            />
          </View>

          {/* Level Progress */}
          <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing.xl }}>
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Spacing.md }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: getLevelConfig(levelInfo.level).color + "2A",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: Spacing.md,
                }}>
                  <Ionicons
                    name={getLevelConfig(levelInfo.level).icon as any}
                    size={18}
                    color={getLevelConfig(levelInfo.level).color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FontSize.base, fontWeight: "900", color: C.text }}>
                    {t("level", lang)} {levelInfo.level} · {t(`levelTitle_${levelInfo.level}`, lang)}
                  </Text>
                  <Text style={{ fontSize: FontSize.xs, color: C.text2, marginTop: 2 }}>
                    {levelInfo.level < 10
                      ? `${t("nextLevel", lang)}: ${t(`levelTitle_${levelInfo.level + 1}`, lang)}`
                      : t("maxLevelReached", lang)}
                  </Text>
                </View>
                <Text style={{ fontSize: FontSize.sm, fontWeight: "800", color: getLevelConfig(levelInfo.level).color }}>
                  {totalPoints} pts
                </Text>
              </View>
              <View style={{
                height: 8,
                backgroundColor: C.surface3,
                borderRadius: 4,
                overflow: "hidden",
              }}>
                <View style={{
                  height: "100%",
                  width: `${Math.round(levelInfo.progress * 100)}%`,
                  backgroundColor: getLevelConfig(levelInfo.level).color,
                  borderRadius: 4,
                }} />
              </View>
              <Text style={{ fontSize: FontSize.xs, color: C.text3, marginTop: 4, textAlign: "right" }}>
                {levelInfo.level >= 10
                  ? `MAX · ${totalPoints} XP`
                  : `${levelInfo.currentXP} / ${levelInfo.nextLevelXP} XP`}
              </Text>
            </Card>
          </View>

          {/* Streak */}
          <SectionHeader
            title={t("weeklyStreak", lang)}
            style={{ marginTop: Spacing.xl }}
          />
          <View style={{ paddingHorizontal: Spacing.xl }}>
            <Card>
              <View style={styles.streakRow}>
                <View style={styles.streakTextBlock}>
                  <Text style={styles.streakNumber}>
                    {maxStreak}{" "}
                    {bestStreakInfo
                      ? getFrequencyPeriodLabelPlural(
                          bestStreakInfo.frequency,
                          lang,
                          bestStreakInfo.custom_frequency_days,
                        )
                      : t("weeks", lang)}
                  </Text>
                  <Text style={styles.streakSub}>
                    {maxStreak >= 7
                      ? t("epicStreak", lang)
                      : maxStreak >= 3
                        ? t("goingWell", lang)
                        : maxStreak >= 1
                          ? t("keepItUp", lang)
                          : t("startToday", lang)}
                  </Text>
                </View>
                <View style={styles.streakBigEmoji}>
                  {Array.from({ length: Math.min(maxStreak, 7) }, (_, i) => (
                    <Ionicons
                      key={i}
                      name="flame"
                      size={12}
                      color={C.yellow}
                    />
                  ))}
                </View>
              </View>
              {groups.length === 0 ? (
                <Text style={{ fontSize: FontSize.xs, color: C.text3, textAlign: "center", paddingVertical: Spacing.sm }}>
                  {t("noStreakYet", lang)}
                </Text>
              ) : (
                <View style={styles.streakDots}>
                  {streakDots.map((d, i) => (
                    <View
                      key={i}
                      style={[
                        styles.streakDot,
                        d.done
                          ? styles.streakDotDone
                          : d.isCurrent
                            ? styles.streakDotToday
                            : styles.streakDotEmpty,
                      ]}
                    >
                      <Text
                        style={[
                          styles.streakDotText,
                          d.done ? { color: "#000" } : { color: C.text3 },
                        ]}
                      >
                        {d.label}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </View>

          {/* Achievements */}
          <SectionHeader
            title={t("myMedals", lang)}
            style={{ marginTop: Spacing.xl }}
          />
          <View style={styles.achievementsGrid}>
            {allAchievements.map((type) => {
              const a = ACHIEVEMENTS[type];
              const earned = earnedAchievements.has(type);
              return (
                <View
                  key={type}
                  style={[styles.medalCard, earned && styles.medalCardEarned]}
                >
                  <View
                    style={[
                      styles.medalIconContainer,
                      !earned && styles.medalLocked,
                    ]}
                  >
                    <AchievementIcon type={type} size={28} />
                  </View>
                  <Text
                    style={[
                      styles.medalName,
                      !earned && styles.medalLockedText,
                    ]}
                  >
                    {getAchievementText(type, lang).title}
                  </Text>
                  <View style={styles.medalStateRow}>
                    {!earned ? (
                      <Ionicons
                        name="lock-closed"
                        size={12}
                        color={C.text3}
                        style={styles.medalLockIcon}
                      />
                    ) : (
                      <View style={styles.medalLockPlaceholder} />
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* My groups summary */}
          <SectionHeader
            title={t("myGroups", lang)}
            style={{ marginTop: Spacing.xl }}
          />
          <View style={{ paddingHorizontal: Spacing.xl, gap: Spacing.sm }}>
            {groups.map((group) => {
              const myMember = group.members?.find(
                (m) => m.user_id === user.id,
              );
              return (
                <Card
                  key={group.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: Spacing.md,
                  }}
                >
                  <View style={styles.groupIconContainer}>
                    {(() => {
                      const groupIcon =
                        GROUP_ICONS.find((icon) => icon.name === group.emoji) ||
                        GROUP_ICONS[0];
                      return (
                        <Ionicons
                          name={groupIcon.name as any}
                          size={28}
                          color={groupIcon.color}
                        />
                      );
                    })()}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "800",
                        color: C.text,
                        marginBottom: 4,
                      }}
                    >
                      {group.name}
                    </Text>
                    <Text
                      style={{ fontSize: FontSize.xs, color: C.text2 }}
                    >
                      {formatCurrency(
                        myMember?.current_amount || 0,
                        settings.currency,
                      )}{" "}
                      /{" "}
                      {formatCurrency(
                        myMember?.individual_goal || 0,
                        settings.currency,
                      )}{" "}
                      · {group.progress_percent}% global
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>

          {/* Settings */}
          <View
            style={{
              padding: Spacing.xl,
              gap: Spacing.md,
              marginTop: Spacing.xl,
            }}
          >
            <Button
              title={t("settings", lang)}
              variant="secondary"
              onPress={handleSettings}
            />
            <Button
              title={t("signOut", lang)}
              variant="danger"
              onPress={handleSignOut}
            />
            <Text style={styles.version}>
              GoalCrew v{Constants.expoConfig?.version ?? "1.0.0"} ·{" "}
              {t("madeWithLove", lang)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <SelectModal
        visible={showPhotoModal}
        title={t("changePhoto", lang)}
        options={
          Platform.OS === "web"
            ? [{ label: t("gallery", lang), value: "gallery" }]
            : [
                { label: t("camera", lang), value: "camera" },
                { label: t("gallery", lang), value: "gallery" },
              ]
        }
        selectedValue=""
        onSelect={(value) => {
          setShowPhotoModal(false);
          pickImage(value as "camera" | "gallery");
        }}
        onClose={() => setShowPhotoModal(false)}
      />

      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        icon={alertModal.icon as keyof typeof Ionicons.glyphMap}
        iconColor={alertModal.iconColor}
        onDismiss={dismissAlert}
        buttons={
          alertModal.buttons ?? [{ text: t("ok", lang), onPress: dismissAlert }]
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (C: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: Spacing.xl },
  webContent: {
    width: "100%",
    maxWidth: Platform.OS === "web" ? 980 : undefined,
    alignSelf: "center",
  },
  headerGradient: { paddingBottom: Spacing.xl },
  profileHero: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  avatarWrap: { position: "relative", marginBottom: Spacing.md },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.surface2,
    borderWidth: 2,
    borderColor: C.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    color: C.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: C.text2,
    marginBottom: Spacing.md,
  },
  badges: { flexDirection: "row", gap: Spacing.sm },
  levelBadge: {
    backgroundColor: "rgba(108,99,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.3)",
  },
  levelBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: C.accent2,
  },
  streakBadge: {
    backgroundColor: "rgba(251,191,36,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
  },
  streakBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: C.yellow,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: C.surface3,
    alignItems: "center",
  },
  statValue: { fontSize: FontSize.xl, fontWeight: "900", marginBottom: 2 },
  statLabel: {
    fontSize: FontSize.xs,
    color: C.text2,
    textAlign: "center",
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  streakTextBlock: {
    alignItems: "center",
    flex: 1,
  },
  streakNumber: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    color: C.text,
    textAlign: "center",
  },
  streakSub: {
    fontSize: FontSize.sm,
    color: C.text2,
    marginTop: 2,
    textAlign: "center",
  },
  streakBigEmoji: { flexDirection: "row", gap: 2 },
  streakDots: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "center",
  },
  streakDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  streakDotDone: { backgroundColor: C.green },
  streakDotToday: { backgroundColor: C.accent },
  streakDotEmpty: { backgroundColor: C.surface3 },
  streakDotText: { fontSize: FontSize.xs, fontWeight: "800" },
  achievementsGrid: {
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "space-between",
  },
  medalCard: {
    width: Platform.OS === "web" ? "31.5%" : "30%",
    backgroundColor: C.surface2,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.surface3,
  },
  medalCardEarned: {
    borderColor: "rgba(108,99,255,0.4)",
    backgroundColor: "rgba(108,99,255,0.08)",
  },
  medalIconContainer: { marginBottom: 6 },
  medalLocked: { opacity: 0.45 },
  medalName: {
    fontSize: 10,
    color: C.text2,
    textAlign: "center",
    lineHeight: 14,
    minHeight: 28,
  },
  medalLockedText: { opacity: 0.6 },
  medalStateRow: {
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  medalLockIcon: { opacity: 0.5 },
  medalLockPlaceholder: { width: 12, height: 12 },
  version: {
    textAlign: "center",
    fontSize: FontSize.xs,
    color: C.text3,
    marginTop: Spacing.sm,
  },
  groupIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
