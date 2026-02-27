import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  Colors,
  FontSize,
  Radius,
  Spacing,
  TRIP_ICONS,
  getUserLevel,
} from "../../src/constants";
import { formatCurrency } from "../../src/lib/currency";
import { getAchievementText, t } from "../../src/lib/i18n";
import { fetchAllUserAchievements, supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/store/authStore";
import { useGroupsStore } from "../../src/store/groupsStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { AchievementType } from "../../src/types";

const DAYS_SHORT_I18N: Record<string, string[]> = {
  es: ["L", "M", "M", "J", "V", "S", "D"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
  fr: ["L", "M", "M", "J", "V", "S", "D"],
};

export default function ProfileScreen() {
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
  const DAYS_SHORT = DAYS_SHORT_I18N[lang] || DAYS_SHORT_I18N.es;

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
    () =>
      groups.reduce((sum, g) => {
        const m = g.members?.find((m) => m.user_id === user?.id);
        return sum + (m?.total_points ?? 0);
      }, 0),
    [groups, user?.id],
  );

  const maxStreak = useMemo(
    () =>
      groups.reduce((max, g) => {
        const m = g.members?.find((m) => m.user_id === user?.id);
        return Math.max(max, m?.streak_days ?? 0);
      }, 0),
    [groups, user?.id],
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

  // Find the best member for streak info (last_contribution_date)
  const bestStreakMember = useMemo(() => {
    let best: {
      streak_days: number;
      last_contribution_date: string | null;
    } | null = null;
    for (const g of groups) {
      const m = g.members?.find((m) => m.user_id === user?.id);
      if (m && m.streak_days > (best?.streak_days ?? 0)) {
        best = {
          streak_days: m.streak_days,
          last_contribution_date: m.last_contribution_date,
        };
      }
    }
    return best;
  }, [groups, user?.id]);

  // Build streak week dots based on actual current day and last contribution
  const streakDots = useMemo(() => {
    const today = new Date().getDay(); // 0=Sun, 1=Mon...6=Sat
    // Convert to Mon=0...Sun=6
    const todayIdx = today === 0 ? 6 : today - 1;

    // Check if streak is currently active (contributed today or yesterday)
    const lastDate = bestStreakMember?.last_contribution_date;
    let streakEndIdx = -1; // no active streak
    if (lastDate) {
      const last = new Date(lastDate);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays <= 1) {
        // Streak is active — ends at today (or yesterday if not contributed today)
        streakEndIdx = diffDays === 0 ? todayIdx : todayIdx - 1;
      }
    }

    const activeDays =
      streakEndIdx >= 0 ? Math.min(maxStreak, streakEndIdx + 1) : 0;

    return DAYS_SHORT.map((day, idx) => ({
      day,
      done:
        streakEndIdx >= 0 &&
        idx <= streakEndIdx &&
        idx > streakEndIdx - activeDays,
      isToday: idx === todayIdx,
    }));
  }, [DAYS_SHORT, maxStreak, bestStreakMember]);

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleSignOut = () => {
    showAlert(t("signOut", lang), t("signOutConfirm", lang), {
      icon: "log-out-outline",
      iconColor: Colors.red,
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
            iconColor: Colors.red,
          });
          return;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          showAlert(t("error", lang), t("galleryPermission", lang), {
            icon: "alert-circle",
            iconColor: Colors.red,
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
          iconColor: Colors.red,
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
        iconColor: Colors.red,
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent2}
          />
        }
      >
        {/* Header gradient */}
        <LinearGradient
          colors={["#1a1555", Colors.bg]}
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
                    backgroundColor: Colors.surface2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator size="small" color={Colors.accent} />
                </View>
              ) : (
                <Avatar name={user.name} size={88} imageUrl={user.avatar_url} />
              )}
              <View style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={12} color={Colors.text2} />
              </View>
            </TouchableOpacity>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.badges}>
              <View style={styles.levelBadge}>
                <View style={styles.levelBadgeContent}>
                  <Ionicons
                    name="trophy"
                    size={14}
                    color={Colors.accent2}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.levelBadgeText}>
                    {t("level", lang)} {levelInfo.level}
                  </Text>
                </View>
              </View>
              {maxStreak > 0 && (
                <View style={styles.streakBadge}>
                  <View style={styles.streakBadgeContent}>
                    <Ionicons
                      name="flame"
                      size={14}
                      color={Colors.yellow}
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
            color={Colors.green}
          />
          <StatCard
            label={t("points", lang)}
            value={totalPoints.toLocaleString()}
            color={Colors.accent2}
          />
          <StatCard
            label={t("medals", lang)}
            value={String(earnedAchievements.size)}
            color={Colors.yellow}
          />
        </View>

        {/* Streak */}
        <SectionHeader
          title={t("weeklyStreak", lang)}
          style={{ marginTop: Spacing.xl }}
        />
        <View style={{ paddingHorizontal: Spacing.xl }}>
          <Card>
            <View style={styles.streakRow}>
              <View>
                <Text style={styles.streakNumber}>
                  {maxStreak} {t("days", lang)}
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
                    color={Colors.yellow}
                  />
                ))}
              </View>
            </View>
            <View style={styles.streakDots}>
              {streakDots.map((d, i) => (
                <View
                  key={i}
                  style={[
                    styles.streakDot,
                    d.done
                      ? styles.streakDotDone
                      : d.isToday
                        ? styles.streakDotToday
                        : styles.streakDotEmpty,
                  ]}
                >
                  <Text
                    style={[
                      styles.streakDotText,
                      d.done ? { color: "#000" } : { color: Colors.text3 },
                    ]}
                  >
                    {d.day}
                  </Text>
                </View>
              ))}
            </View>
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
                  style={[styles.medalName, !earned && styles.medalLockedText]}
                >
                  {getAchievementText(type, lang).title}
                </Text>
                {!earned && (
                  <Ionicons
                    name="lock-closed"
                    size={12}
                    color={Colors.text3}
                    style={styles.medalLockIcon}
                  />
                )}
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
            const myMember = group.members?.find((m) => m.user_id === user.id);
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
                      TRIP_ICONS.find((icon) => icon.name === group.emoji) ||
                      TRIP_ICONS[0];
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
                      color: Colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {group.name}
                  </Text>
                  <Text style={{ fontSize: FontSize.xs, color: Colors.text2 }}>
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
            GoalCrew v{Constants.expoConfig?.version ?? "1.0.0"} · Made with 💜
          </Text>
        </View>
      </ScrollView>

      <SelectModal
        visible={showPhotoModal}
        title={t("changePhoto", lang)}
        options={[
          { label: t("camera", lang), value: "camera" },
          { label: t("gallery", lang), value: "gallery" },
        ]}
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
        buttons={alertModal.buttons ?? [{ text: "OK", onPress: dismissAlert }]}
      />
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
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
    backgroundColor: Colors.surface2,
    borderWidth: 2,
    borderColor: Colors.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: Colors.text2,
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
    color: Colors.accent2,
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
    color: Colors.yellow,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surface3,
    alignItems: "center",
  },
  statValue: { fontSize: FontSize.xl, fontWeight: "900", marginBottom: 2 },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.text2,
    textAlign: "center",
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  streakNumber: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    color: Colors.text,
  },
  streakSub: { fontSize: FontSize.sm, color: Colors.text2, marginTop: 2 },
  streakBigEmoji: { flexDirection: "row", gap: 2 },
  streakDots: { flexDirection: "row", gap: Spacing.sm },
  streakDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  streakDotDone: { backgroundColor: Colors.green },
  streakDotToday: { backgroundColor: Colors.accent },
  streakDotEmpty: { backgroundColor: Colors.surface3 },
  streakDotText: { fontSize: FontSize.xs, fontWeight: "800" },
  achievementsGrid: {
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  medalCard: {
    width: "30%",
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  medalCardEarned: {
    borderColor: "rgba(108,99,255,0.4)",
    backgroundColor: "rgba(108,99,255,0.08)",
  },
  medalIconContainer: { marginBottom: 6 },
  medalLocked: { opacity: 0.3 },
  medalName: {
    fontSize: 10,
    color: Colors.text2,
    textAlign: "center",
    lineHeight: 14,
  },
  medalLockedText: { opacity: 0.5 },
  medalLockIcon: { marginTop: 4, opacity: 0.5 },
  version: {
    textAlign: "center",
    fontSize: FontSize.xs,
    color: Colors.text3,
    marginTop: Spacing.sm,
  },
  groupIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
