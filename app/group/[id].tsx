import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";
import { AchievementModal } from "../../src/components/AchievementModal";
import { MemberRow } from "../../src/components/MemberRow";
import { Button, Card, StatusPill } from "../../src/components/UI";
import {
  Colors,
  FontSize,
  Radius,
  Spacing,
  TRIP_ICONS,
} from "../../src/constants";
import {
  CURRENCIES,
  formatCurrency,
  getQuickAmounts,
} from "../../src/lib/currency";
import { getFrequencyPeriodLabel, t } from "../../src/lib/i18n";
import { subscribeToGroup } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/store/authStore";
import { useContributionsStore } from "../../src/store/contributionsStore";
import { useGroupsStore } from "../../src/store/groupsStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { AchievementType } from "../../src/types";

type TabType = "members" | "ranking" | "history";

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const lang = settings.language || "es";
  const {
    currentGroup,
    fetchGroup,
    isLoading,
    leaveGroup,
    deleteGroup,
    updateGroup,
  } = useGroupsStore();
  const {
    addContribution,
    contributions,
    fetchContributions,
    deleteContribution,
    updateContribution,
    isLoading: contribLoading,
    lastUnlockedAchievement,
    clearLastAchievement,
  } = useContributionsStore();

  const { updateMemberGoal } = useGroupsStore();

  const [activeTab, setActiveTab] = useState<TabType>("members");
  const [showContribModal, setShowContribModal] = useState(false);
  const [contribAmount, setContribAmount] = useState("");
  const [contribNote, setContribNote] = useState("");
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [editGoalAmount, setEditGoalAmount] = useState("");
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);

  // Phase 2 state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupEmoji, setEditGroupEmoji] = useState(TRIP_ICONS[0]);
  const [editGroupGoal, setEditGroupGoal] = useState("");
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
  const [showEditContribModal, setShowEditContribModal] = useState(false);
  const [editContribId, setEditContribId] = useState<string | null>(null);
  const [editContribAmount, setEditContribAmount] = useState("");
  const [editContribNote, setEditContribNote] = useState("");

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
    return () => {
      channel.unsubscribe();
    };
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
      Alert.alert(t("invalidAmount", lang), t("enterAmountGreaterZero", lang));
      return;
    }
    try {
      await addContribution(id!, amount, contribNote || undefined);
      setShowContribModal(false);
      setContribAmount("");
      setContribNote("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert(
        t("error", lang),
        error.message ?? t("couldNotRegister", lang),
      );
    }
  };

  const handleShare = async () => {
    if (!currentGroup) return;
    try {
      await Share.share({
        message: `${t("joinShareMessage", lang)} "${currentGroup.name}" en GoalCrew!\n\n${t("code", lang)}: ${currentGroup.invite_code}\n\n${t("downloadApp", lang)} https://goalcrew.app`,
        title: `${t("joinShareTitle", lang)} ${currentGroup.name}`,
      });
    } catch {
      // Copy to clipboard fallback
      await Clipboard.setStringAsync(currentGroup.invite_code);
      Alert.alert(
        t("codeCopied", lang),
        `${t("code", lang)}: ${currentGroup.invite_code}`,
      );
    }
  };

  const handleEditGoal = () => {
    if (!myMember) return;
    setEditGoalAmount(String(myMember.individual_goal));
    setShowEditGoalModal(true);
  };

  const handleSaveGoal = async () => {
    const amount = parseFloat(editGoalAmount);
    if (!amount || amount <= 0) {
      Alert.alert(t("invalidAmount", lang), t("enterGoalGreaterZero", lang));
      return;
    }
    setIsUpdatingGoal(true);
    try {
      await updateMemberGoal(id!, amount);
      setShowEditGoalModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert(t("error", lang), error.message ?? t("couldNotUpdate", lang));
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  // ─── Phase 2 handlers ─────────────────────────────────────────────────

  const isCreator = currentGroup?.created_by === user?.id;

  const handleLeaveGroup = () => {
    Alert.alert(t("leaveGroup", lang), t("leaveGroupConfirm", lang), [
      { text: t("cancel", lang), style: "cancel" },
      {
        text: t("leave", lang),
        style: "destructive",
        onPress: async () => {
          try {
            await leaveGroup(id!);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace("/(tabs)");
          } catch (error: any) {
            if (error.message === "CREATOR_CANNOT_LEAVE") {
              Alert.alert(t("error", lang), t("creatorCannotLeave", lang));
            } else {
              Alert.alert(t("error", lang), error.message);
            }
          }
        },
      },
    ]);
  };

  const handleDeleteGroup = () => {
    Alert.alert(t("deleteGroup", lang), t("deleteGroupConfirm", lang), [
      { text: t("cancel", lang), style: "cancel" },
      {
        text: t("delete", lang),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteGroup(id!);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace("/(tabs)");
          } catch (error: any) {
            Alert.alert(t("error", lang), error.message);
          }
        },
      },
    ]);
  };

  const handleOpenEditGroup = () => {
    if (!currentGroup) return;
    setEditGroupName(currentGroup.name);
    setEditGroupEmoji(
      TRIP_ICONS.find((i) => i.name === currentGroup.emoji) || TRIP_ICONS[0],
    );
    setEditGroupGoal(String(currentGroup.goal_amount));
    setShowSettingsModal(false);
    setShowEditGroupModal(true);
  };

  const handleSaveGroup = async () => {
    if (!editGroupName.trim()) {
      Alert.alert(t("error", lang), t("nameRequired", lang));
      return;
    }
    setIsUpdatingGroup(true);
    try {
      await updateGroup(id!, {
        name: editGroupName.trim(),
        emoji: editGroupEmoji.name,
        goal_amount: parseFloat(editGroupGoal) || currentGroup!.goal_amount,
      });
      setShowEditGroupModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert(t("error", lang), error.message);
    } finally {
      setIsUpdatingGroup(false);
    }
  };

  const handleDeleteContribution = (contribId: string) => {
    Alert.alert(
      t("deleteContribution", lang),
      t("deleteContributionConfirm", lang),
      [
        { text: t("cancel", lang), style: "cancel" },
        {
          text: t("delete", lang),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteContribution(contribId, id!);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            } catch (error: any) {
              Alert.alert(t("error", lang), error.message);
            }
          },
        },
      ],
    );
  };

  const handleOpenEditContrib = (contrib: any) => {
    setEditContribId(contrib.id);
    setEditContribAmount(String(contrib.amount));
    setEditContribNote(contrib.note ?? "");
    setShowEditContribModal(true);
  };

  const handleSaveContrib = async () => {
    const amount = parseFloat(editContribAmount);
    if (!amount || amount <= 0) {
      Alert.alert(t("invalidAmount", lang), t("enterAmountGreaterZero", lang));
      return;
    }
    try {
      await updateContribution(editContribId!, id!, {
        amount,
        note: editContribNote || undefined,
      });
      setShowEditContribModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert(t("error", lang), error.message);
    }
  };

  const isCustomDivision = currentGroup?.division_type === "custom";

  // All hooks MUST be before any early return (Rules of Hooks)
  const myMember = useMemo(
    () => currentGroup?.members?.find((m) => m.user_id === user?.id),
    [currentGroup?.members, user?.id],
  );
  const sortedByRanking = useMemo(
    () =>
      [...(currentGroup?.members ?? [])].sort(
        (a, b) =>
          b.total_points - a.total_points ||
          b.streak_days - a.streak_days ||
          (a.user?.name ?? "").localeCompare(b.user?.name ?? ""),
      ),
    [currentGroup?.members],
  );
  const dateLocale = useMemo(
    () => (lang === "en" ? enUS : lang === "fr" ? fr : es),
    [lang],
  );
  const deadlineFormatted = useMemo(
    () =>
      currentGroup?.deadline
        ? format(
            parseISO(currentGroup.deadline),
            lang === "es" ? "d 'de' MMMM, yyyy" : "d MMMM, yyyy",
            { locale: dateLocale },
          )
        : "",
    [currentGroup?.deadline, lang, dateLocale],
  );

  if (!currentGroup) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: Colors.text2 }}>{t("loadingGroup", lang)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Completed state
  const isGoalCompleted = currentGroup.progress_percent >= 100;
  const isDeadlinePassed = new Date(currentGroup.deadline) < new Date();
  const isGroupFinished = isGoalCompleted || isDeadlinePassed;

  // Ring progress
  const pct = Math.min(100, currentGroup.progress_percent);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct / 100);

  const currencySymbol = CURRENCIES[settings.currency]?.symbol || "$";

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push("/(tabs)");
              }
            }}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>{t("backToGoals", lang)}</Text>
          </TouchableOpacity>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.groupIconContainer}>
                {(() => {
                  const groupIcon =
                    TRIP_ICONS.find(
                      (icon) => icon.name === currentGroup.emoji,
                    ) || TRIP_ICONS[0];
                  return (
                    <Ionicons
                      name={groupIcon.name as any}
                      size={32}
                      color={groupIcon.color}
                    />
                  );
                })()}
              </View>
              <Text style={styles.groupName}>{currentGroup.name}</Text>
              <View style={styles.headerPills}>
                <View style={styles.pill}>
                  <View style={styles.pillContent}>
                    <Ionicons
                      name="people-outline"
                      size={14}
                      color={Colors.accent2}
                    />
                    <Text style={[styles.pillText, { marginLeft: 4 }]}>
                      {currentGroup.members?.length ?? 0}
                    </Text>
                  </View>
                </View>
                {myMember && <StatusPill status={myMember.status} />}
                <View style={styles.pill}>
                  <View style={styles.pillContent}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={Colors.accent2}
                    />
                    <Text style={[styles.pillText, { marginLeft: 4 }]}>
                      {currentGroup.days_remaining}d
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: Spacing.sm }}>
              <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                <View style={styles.shareBtnContent}>
                  <Ionicons name="link-outline" size={16} color="#FFFFFF" />
                  <Text style={[styles.shareBtnText, { marginLeft: 6 }]}>
                    {t("code", lang)}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowSettingsModal(true)}
                style={[styles.shareBtn, { paddingHorizontal: Spacing.sm }]}
              >
                <Ionicons name="ellipsis-vertical" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Completed / Deadline banner */}
        {isGroupFinished && (
          <View
            style={{ paddingHorizontal: Spacing.xl, marginBottom: Spacing.md }}
          >
            <Card
              style={{
                borderColor: isGoalCompleted ? Colors.green : Colors.yellow,
                borderWidth: 1,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Spacing.md,
                }}
              >
                <Ionicons
                  name={isGoalCompleted ? "checkmark-circle" : "time"}
                  size={28}
                  color={isGoalCompleted ? Colors.green : Colors.yellow}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: FontSize.lg,
                      fontWeight: "900",
                      color: isGoalCompleted ? Colors.green : Colors.yellow,
                    }}
                  >
                    {isGoalCompleted
                      ? t("goalCompleted", lang)
                      : t("deadlineReached", lang)}
                  </Text>
                  <Text
                    style={{
                      fontSize: FontSize.sm,
                      color: Colors.text2,
                      marginTop: 2,
                    }}
                  >
                    {isGoalCompleted
                      ? t("groupCompletedDesc", lang)
                      : t("deadlineReachedDesc", lang)}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Progress ring + stats */}
        <View
          style={{ paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg }}
        >
          <Card>
            <View style={styles.progressRow}>
              {/* Ring */}
              <View style={styles.ringWrap}>
                <Svg width={100} height={100} viewBox="0 0 100 100">
                  <Defs>
                    <SvgGradient
                      id="ring-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <Stop offset="0%" stopColor={Colors.accent} />
                      <Stop offset="100%" stopColor={Colors.accent2} />
                    </SvgGradient>
                  </Defs>
                  <Circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={Colors.surface3}
                    strokeWidth="11"
                  />
                  <Circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="url(#ring-grad)"
                    strokeWidth="11"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </Svg>
                <View style={styles.ringLabel}>
                  <Text style={styles.ringPct}>{pct}%</Text>
                  <Text style={styles.ringSubtitle}>
                    {t("groupProgress", lang)}
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsCol}>
                <StatRow
                  label={t("totalCollected", lang)}
                  value={formatCurrency(
                    currentGroup.total_saved,
                    settings.currency,
                  )}
                  color={Colors.green}
                />
                <StatRow
                  label={t("totalGoal", lang)}
                  value={formatCurrency(
                    currentGroup.total_goal,
                    settings.currency,
                  )}
                />
                <StatRow
                  label={t("remaining", lang)}
                  value={formatCurrency(
                    currentGroup.total_goal - currentGroup.total_saved,
                    settings.currency,
                  )}
                  color={Colors.yellow}
                />
                <StatRow
                  label={t("deadline", lang)}
                  value={deadlineFormatted}
                  small
                />
              </View>
            </View>

            {/* My progress bar */}
            {myMember && (
              <View style={styles.myProgress}>
                <View style={styles.myProgressHeader}>
                  <Text style={styles.myProgressLabel}>
                    {t("yourProgress", lang)}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text style={styles.myProgressValue}>
                      {formatCurrency(
                        myMember.current_amount,
                        settings.currency,
                      )}{" "}
                      /{" "}
                      {formatCurrency(
                        myMember.individual_goal,
                        settings.currency,
                      )}
                    </Text>
                    {isCustomDivision && (
                      <TouchableOpacity
                        onPress={handleEditGoal}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name="pencil"
                          size={14}
                          color={Colors.accent2}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={Colors.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(100, (myMember.current_amount / myMember.individual_goal) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.myProgressFooter}>
                  <Text style={styles.myProgressHint}>
                    <Ionicons name="wallet" size={12} color={Colors.text2} />{" "}
                    {t("saveEvery", lang)}{" "}
                    {formatCurrency(
                      currentGroup.per_period_needed,
                      settings.currency,
                    )}{" "}
                    {t("every", lang)}{" "}
                    {getFrequencyPeriodLabel(
                      currentGroup.frequency,
                      lang,
                      currentGroup.custom_frequency_days,
                    )}
                  </Text>
                  {myMember.streak_days > 0 && (
                    <View style={styles.streakBadgeContainer}>
                      <Ionicons name="flame" size={14} color="#FF6B35" />
                      <Text style={styles.streakBadge}>
                        {myMember.streak_days}d
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Tabs */}
        <View style={{ paddingHorizontal: Spacing.xl }}>
          <View style={styles.tabBar}>
            {(["members", "ranking", "history"] as TabType[]).map((tab) => {
              const labels = {
                members: { icon: "people", text: t("members", lang) },
                ranking: { icon: "trophy", text: t("ranking", lang) },
                history: { icon: "list", text: t("history", lang) },
              };
              const tabInfo = labels[tab];
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                >
                  <Ionicons
                    name={tabInfo.icon as any}
                    size={16}
                    color={activeTab === tab ? Colors.accent2 : Colors.text3}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.tabTextActive,
                    ]}
                  >
                    {tabInfo.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Card style={{ paddingVertical: Spacing.sm }}>
            {activeTab === "members" && (
              <>
                {currentGroup.members?.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isCurrentUser={member.user_id === user?.id}
                  />
                ))}
              </>
            )}

            {activeTab === "ranking" && (
              <>
                <Text style={styles.rankingSubtitle}>
                  {t("pointsAccumulated", lang)}
                </Text>
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

            {activeTab === "history" && (
              <>
                {contributions.length === 0 ? (
                  <Text style={styles.emptyText}>
                    {t("noContributions", lang)}
                  </Text>
                ) : (
                  contributions.map((c, index) => (
                    <View key={`${c.id}-${index}`} style={styles.historyItem}>
                      <View
                        style={[
                          styles.historyDot,
                          { backgroundColor: Colors.green },
                        ]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyName}>
                          <Text style={{ fontWeight: "800" }}>
                            {c.user?.name ?? t("someone", lang)}
                          </Text>
                          {` ${t("saved", lang)} ${formatCurrency(c.amount, settings.currency)}`}
                        </Text>
                        {c.note && (
                          <Text style={styles.historyNote}>"{c.note}"</Text>
                        )}
                        <Text style={styles.historyDate}>
                          {format(new Date(c.created_at), "d MMM · HH:mm", {
                            locale: dateLocale,
                          })}
                        </Text>
                      </View>
                      {c.user_id === user?.id && !isGroupFinished && (
                        <View style={styles.historyActions}>
                          <TouchableOpacity
                            onPress={() => handleOpenEditContrib(c)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons
                              name="pencil"
                              size={16}
                              color={Colors.accent2}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteContribution(c.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons
                              name="trash"
                              size={16}
                              color={Colors.red}
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </>
            )}
          </Card>
        </View>

        {/* Register contribution CTA */}
        {!isGroupFinished && (
          <View style={styles.ctaSection}>
            <Button
              title={t("registerContribution", lang)}
              onPress={() => setShowContribModal(true)}
              style={{ overflow: "hidden" }}
            />
          </View>
        )}
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={styles.modalBg}
            activeOpacity={1}
            onPress={() => setShowContribModal(false)}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleContent}>
                <Ionicons name="wallet-outline" size={20} color={Colors.text} />
                <Text style={[styles.modalTitle, { marginLeft: 8 }]}>
                  {t("registerContribTitle", lang)}
                </Text>
              </View>
              <Text style={styles.modalSubtitle}>
                {currentGroup.name} · {t("goal", lang)}:{" "}
                {formatCurrency(
                  myMember?.individual_goal || 0,
                  settings.currency,
                )}
              </Text>

              <View style={styles.amountWrap}>
                <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={Colors.text3}
                  value={contribAmount}
                  onChangeText={setContribAmount}
                  keyboardType="numeric"
                  autoFocus
                  maxLength={10}
                />
              </View>

              {/* Quick amounts */}
              <View style={styles.quickAmounts}>
                {getQuickAmounts(settings.currency).map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setContribAmount(String(v))}
                    style={styles.quickBtn}
                  >
                    <Text style={styles.quickBtnText}>
                      {currencySymbol}
                      {v >= 1000 ? `${v / 1000}K` : v}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.noteInput}
                placeholder={t("noteOptional", lang)}
                placeholderTextColor={Colors.text3}
                value={contribNote}
                onChangeText={setContribNote}
              />

              <Button
                title={t("confirmContribution", lang)}
                onPress={handleAddContribution}
                isLoading={contribLoading}
              />
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Goal Modal (custom division only) */}
      <Modal
        visible={showEditGoalModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditGoalModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={styles.modalBg}
            activeOpacity={1}
            onPress={() => setShowEditGoalModal(false)}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleContent}>
                <Ionicons name="create-outline" size={20} color={Colors.text} />
                <Text style={[styles.modalTitle, { marginLeft: 8 }]}>
                  {t("editMyGoal", lang)}
                </Text>
              </View>
              <Text style={styles.modalSubtitle}>
                {t("editGoalDescription", lang)}
              </Text>

              <View style={styles.amountWrap}>
                <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={Colors.text3}
                  value={editGoalAmount}
                  onChangeText={setEditGoalAmount}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>

              <Button
                title={t("saveGoal", lang)}
                onPress={handleSaveGoal}
                isLoading={isUpdatingGoal}
              />
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBg}
          activeOpacity={1}
          onPress={() => setShowSettingsModal(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleContent}>
              <Ionicons name="settings-outline" size={20} color={Colors.text} />
              <Text style={[styles.modalTitle, { marginLeft: 8 }]}>
                {t("groupSettings", lang)}
              </Text>
            </View>

            {isCreator && (
              <TouchableOpacity
                style={styles.settingsOption}
                onPress={handleOpenEditGroup}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={Colors.accent2}
                />
                <Text style={styles.settingsOptionText}>
                  {t("editGroup", lang)}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.text3}
                />
              </TouchableOpacity>
            )}

            {!isCreator && (
              <TouchableOpacity
                style={styles.settingsOption}
                onPress={() => {
                  setShowSettingsModal(false);
                  handleLeaveGroup();
                }}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={Colors.yellow}
                />
                <Text style={styles.settingsOptionText}>
                  {t("leaveGroup", lang)}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.text3}
                />
              </TouchableOpacity>
            )}

            {isCreator && (
              <View style={styles.dangerZone}>
                <Text style={styles.dangerZoneLabel}>
                  {t("dangerZone", lang)}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.settingsOption,
                    { borderColor: "rgba(255,59,48,0.2)" },
                  ]}
                  onPress={() => {
                    setShowSettingsModal(false);
                    handleDeleteGroup();
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.red} />
                  <Text
                    style={[styles.settingsOptionText, { color: Colors.red }]}
                  >
                    {t("deleteGroup", lang)}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={Colors.text3}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        visible={showEditGroupModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditGroupModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={styles.modalBg}
            activeOpacity={1}
            onPress={() => setShowEditGroupModal(false)}
          >
            <View
              style={styles.modalSheet}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleContent}>
                <Ionicons name="create-outline" size={20} color={Colors.text} />
                <Text style={[styles.modalTitle, { marginLeft: 8 }]}>
                  {t("editGroup", lang)}
                </Text>
              </View>

              <Text style={styles.inputLabel}>{t("groupName", lang)}</Text>
              <TextInput
                style={styles.noteInput}
                value={editGroupName}
                onChangeText={setEditGroupName}
                placeholder={t("groupName", lang)}
                placeholderTextColor={Colors.text3}
                maxLength={50}
              />

              <Text style={styles.inputLabel}>{t("icon", lang)}</Text>
              <View style={styles.emojiGrid}>
                {TRIP_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    onPress={() => setEditGroupEmoji(icon)}
                    style={[
                      styles.emojiBtn,
                      editGroupEmoji.name === icon.name &&
                        styles.emojiBtnActive,
                    ]}
                  >
                    <Ionicons
                      name={icon.name as any}
                      size={22}
                      color={
                        editGroupEmoji.name === icon.name
                          ? Colors.accent2
                          : Colors.text2
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>{t("totalGoal", lang)}</Text>
              <View style={styles.amountWrap}>
                <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={Colors.text3}
                  value={editGroupGoal}
                  onChangeText={setEditGroupGoal}
                  keyboardType="numeric"
                />
              </View>

              <Button
                title={t("saveChanges", lang)}
                onPress={handleSaveGroup}
                isLoading={isUpdatingGroup}
              />
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Contribution Modal */}
      <Modal
        visible={showEditContribModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditContribModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={styles.modalBg}
            activeOpacity={1}
            onPress={() => setShowEditContribModal(false)}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleContent}>
                <Ionicons name="pencil-outline" size={20} color={Colors.text} />
                <Text style={[styles.modalTitle, { marginLeft: 8 }]}>
                  {t("editContribution", lang)}
                </Text>
              </View>

              <View style={styles.amountWrap}>
                <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={Colors.text3}
                  value={editContribAmount}
                  onChangeText={setEditContribAmount}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>

              <TextInput
                style={styles.noteInput}
                placeholder={t("noteOptional", lang)}
                placeholderTextColor={Colors.text3}
                value={editContribNote}
                onChangeText={setEditContribNote}
              />

              <Button
                title={t("saveChanges", lang)}
                onPress={handleSaveContrib}
                isLoading={contribLoading}
              />
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function StatRow({ label, value, color, small }: any) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[
          styles.statValue,
          color && { color },
          small && { fontSize: FontSize.xs },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.xl, paddingBottom: Spacing.lg },
  backBtn: { marginBottom: Spacing.md },
  backText: {
    color: Colors.accent2,
    fontWeight: "700",
    fontSize: FontSize.base,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  groupIconContainer: { marginBottom: 6, alignItems: "center" },
  groupName: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  headerPills: { flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" },
  pill: {
    backgroundColor: Colors.surface2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  pillText: { fontSize: FontSize.xs, fontWeight: "700", color: Colors.text2 },
  shareBtn: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  shareBtnText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.text,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  ringWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ringLabel: { position: "absolute", alignItems: "center" },
  ringPct: { fontSize: FontSize.xl, fontWeight: "900", color: Colors.text },
  ringSubtitle: { fontSize: FontSize.xs, color: Colors.text2 },
  statsCol: { flex: 1, gap: Spacing.sm },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: { fontSize: FontSize.xs, color: Colors.text2 },
  statValue: { fontSize: FontSize.sm, fontWeight: "800", color: Colors.text },
  myProgress: {
    borderTopWidth: 1,
    borderTopColor: Colors.surface3,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  myProgressHeader: { flexDirection: "row", justifyContent: "space-between" },
  myProgressLabel: {
    fontSize: FontSize.sm,
    color: Colors.text2,
    fontWeight: "600",
  },
  myProgressValue: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.text,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surface3,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  myProgressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  myProgressHint: { fontSize: FontSize.xs, color: Colors.text2 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: Radius.sm,
  },
  tabActive: { backgroundColor: Colors.surface },
  tabText: { fontSize: FontSize.xs, fontWeight: "700", color: Colors.text2 },
  tabTextActive: { color: Colors.text },
  rankingSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text2,
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface3,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  historyName: { fontSize: FontSize.base, color: Colors.text },
  historyNote: {
    fontSize: FontSize.xs,
    color: Colors.text2,
    fontStyle: "italic",
    marginTop: 2,
  },
  historyDate: { fontSize: FontSize.xs, color: Colors.text3, marginTop: 2 },
  emptyText: {
    textAlign: "center",
    color: Colors.text2,
    fontSize: FontSize.base,
    paddingVertical: Spacing.xl,
  },
  ctaSection: { padding: Spacing.xl },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    paddingBottom: 48,
    gap: Spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.surface3,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.sm,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: "900", color: Colors.text },
  modalSubtitle: { fontSize: FontSize.sm, color: Colors.text2 },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surface3,
    paddingHorizontal: Spacing.lg,
  },
  currencySymbol: { fontSize: 28, fontWeight: "900", color: Colors.text2 },
  amountInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 36,
    fontWeight: "900",
    color: Colors.text,
    textAlign: "center",
  },
  quickAmounts: { flexDirection: "row", gap: Spacing.sm },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  quickBtnText: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.text,
  },
  noteInput: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surface3,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  streakBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakBadge: {
    fontSize: FontSize.xs,
    color: "#FF6B35",
    fontWeight: "700",
  },
  pillContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  shareBtnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitleContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginLeft: Spacing.sm,
  },
  settingsOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  settingsOptionText: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
  },
  dangerZone: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surface3,
  },
  dangerZoneLabel: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: Colors.red,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.text2,
    marginBottom: 4,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  emojiBtnActive: {
    borderColor: Colors.accent2,
    backgroundColor: Colors.surface,
  },
});
