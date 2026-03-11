import { create } from "zustand";
import { CURRENCIES } from "../lib/currency";
import { notifyAchievement, notifyGoalCompleted } from "../lib/notifications";
import { notifyGroup } from "../lib/pushNotify";
import {
  addContribution as apiAdd,
  deleteContributionApi,
  fetchGroupContributions,
  supabase,
  unlockAchievement,
  updateContributionApi,
} from "../lib/supabase";
import { ContributionsState } from "../types";
import { useGroupsStore } from "./groupsStore";
import { useSettingsStore } from "./settingsStore";

interface ContributionsStoreState extends ContributionsState {
  lastUnlockedAchievement: string | null;
  hasMore: boolean;
  clearLastAchievement: () => void;
  loadMoreContributions: (groupId: string) => Promise<void>;
}

export const useContributionsStore = create<ContributionsStoreState>((set, get) => ({
  contributions: [],
  isLoading: false,
  lastUnlockedAchievement: null,
  hasMore: true,

  clearLastAchievement: () => set({ lastUnlockedAchievement: null }),

  addContribution: async (groupId: string, amount: number, note?: string, proofUrl?: string) => {
    set({ isLoading: true });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // The RPC update_member_after_contribution handles:
      // current_amount, streak_days, total_points, status — all server-side
      const contribution = await apiAdd(user.id, groupId, amount, note, proofUrl);

      // Update local state optimistically
      set((state) => ({
        contributions: [contribution, ...state.contributions],
      }));

      // Read back updated member data (after server-side RPC)
      const { data: member } = await supabase
        .from("group_members")
        .select(
          "streak_days, current_amount, individual_goal, last_completed_period",
        )
        .eq("user_id", user.id)
        .eq("group_id", groupId)
        .single();

      // Check achievements based on server-calculated values
      // current_amount already includes this contribution (server-side RPC),
      // so pre-contribution = current_amount - amount
      const preContributionAmount = Math.max(0, (member?.current_amount ?? amount) - amount);
      await checkAndUnlockAchievements(
        user.id,
        groupId,
        amount,
        preContributionAmount,
        member?.streak_days ?? 0,
        member?.individual_goal ?? 0,
        set,
      );

      // Refresh group data
      await useGroupsStore.getState().fetchGroup(groupId);

      // Push notification to group members
      const groupInfo = useGroupsStore.getState().groups.find((g) => g.id === groupId);
      const currency = useSettingsStore.getState().settings?.currency || "USD";
      notifyGroup({
        type: "contribution_added",
        groupId,
        groupName: groupInfo?.name || "",
        groupEmoji: groupInfo?.emoji,
        data: { amount, currency },
      }).catch(() => {});
    } finally {
      set({ isLoading: false });
    }
  },

  fetchContributions: async (groupId: string) => {
    set({ isLoading: true });
    try {
      const data = await fetchGroupContributions(groupId);
      set({ contributions: data, hasMore: data.length >= 50 });
    } finally {
      set({ isLoading: false });
    }
  },

  loadMoreContributions: async (groupId: string) => {
    const { contributions, hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;
    set({ isLoading: true });
    try {
      const data = await fetchGroupContributions(groupId, 50, contributions.length);
      set({
        contributions: [...contributions, ...data],
        hasMore: data.length >= 50,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteContribution: async (contributionId: string, groupId: string) => {
    set({ isLoading: true });
    try {
      await deleteContributionApi(contributionId);
      set((state) => ({
        contributions: state.contributions.filter(
          (c) => c.id !== contributionId,
        ),
      }));
      await useGroupsStore.getState().fetchGroup(groupId);

      const groupInfo = useGroupsStore.getState().groups.find((g) => g.id === groupId);
      notifyGroup({
        type: "contribution_deleted",
        groupId,
        groupName: groupInfo?.name || "",
        groupEmoji: groupInfo?.emoji,
      }).catch(() => {});
    } finally {
      set({ isLoading: false });
    }
  },

  updateContribution: async (
    contributionId: string,
    groupId: string,
    updates: { amount?: number; note?: string },
  ) => {
    set({ isLoading: true });
    try {
      await updateContributionApi(contributionId, updates);
      // Refresh contributions and group data
      const data = await fetchGroupContributions(groupId);
      set({ contributions: data });
      await useGroupsStore.getState().fetchGroup(groupId);

      const groupInfo = useGroupsStore.getState().groups.find((g) => g.id === groupId);
      notifyGroup({
        type: "contribution_updated",
        groupId,
        groupName: groupInfo?.name || "",
        groupEmoji: groupInfo?.emoji,
      }).catch(() => {});
    } finally {
      set({ isLoading: false });
    }
  },
}));

// ─── Achievement checking logic ───────────────────────────────────────────────
async function checkAndUnlockAchievements(
  userId: string,
  groupId: string,
  amount: number,
  currentAmount: number,
  streakDays: number,
  individualGoal: number,
  set: (partial: Partial<ContributionsStoreState>) => void,
) {
  const toUnlock: string[] = [];

  // Check first contribution
  const { data: existingContribs } = await supabase
    .from("contributions")
    .select("id")
    .eq("user_id", userId)
    .eq("group_id", groupId);

  if (existingContribs?.length === 1) toUnlock.push("first_contribution");

  // Streak achievements — streakDays is already the server-calculated value
  // (consecutive periods completed, not days)
  if (streakDays >= 3) toUnlock.push("streak_3");
  if (streakDays >= 7) toUnlock.push("streak_7");
  if (streakDays >= 30) toUnlock.push("streak_30");

  // Big saver — scale threshold by currency scale
  // Default $100 USD equivalent; for COP (scale 4000) that's ~400,000 COP, etc.
  const userCurrency = useSettingsStore.getState().settings?.currency;
  const currencyScale = CURRENCIES[userCurrency]?.scale ?? 1;
  const bigSaverThreshold = 100 * currencyScale;
  if (amount >= bigSaverThreshold) toUnlock.push("big_saver");

  // First to 50%
  const newAmount = currentAmount + amount;
  if (
    individualGoal > 0 &&
    newAmount / individualGoal >= 0.5 &&
    currentAmount / individualGoal < 0.5
  ) {
    // Check if anyone else in the group has reached 50% before
    const { data: otherMembers } = await supabase
      .from("group_members")
      .select("current_amount, individual_goal")
      .eq("group_id", groupId)
      .neq("user_id", userId);

    const someoneElseAt50 = otherMembers?.some(
      (m) => m.current_amount / (m.individual_goal || 1) >= 0.5,
    );
    if (!someoneElseAt50) toUnlock.push("first_50_percent");
  }

  // Goal completed
  if (individualGoal > 0 && newAmount >= individualGoal) {
    toUnlock.push("goal_completed");

    // Early bird: completed before the deadline
    const group = useGroupsStore
      .getState()
      .groups.find((g) => g.id === groupId);
    if (group && new Date(group.deadline) > new Date()) {
      toUnlock.push("early_bird");
    }
  }

  // Most consistent: streak >= 7 AND highest streak in the group
  if (streakDays >= 7) {
    const { data: groupMembers } = await supabase
      .from("group_members")
      .select("streak_days")
      .eq("group_id", groupId)
      .neq("user_id", userId);

    const highestOtherStreak =
      groupMembers?.reduce((max, m) => Math.max(max, m.streak_days ?? 0), 0) ??
      0;
    if (streakDays > highestOtherStreak) {
      toUnlock.push("most_consistent");
    }
  }

  // Fetch already-unlocked achievements globally (not per-group) to avoid duplicates
  const { data: existingAchievements } = await supabase
    .from("achievements")
    .select("achievement_type")
    .eq("user_id", userId);

  const alreadyUnlocked = new Set(
    existingAchievements?.map((a) => a.achievement_type) ?? [],
  );

  // Filter out achievements already earned
  const newAchievements = toUnlock.filter((t) => !alreadyUnlocked.has(t));

  // Unlock achievements and notify
  const { settings } = useSettingsStore.getState();
  for (const achievementType of newAchievements) {
    try {
      await unlockAchievement(userId, groupId, achievementType);
      set({ lastUnlockedAchievement: achievementType });

      // Fire local notification if enabled
      if (settings.achievement_notifications) {
        if (achievementType === "goal_completed") {
          const group = useGroupsStore
            .getState()
            .groups.find((g) => g.id === groupId);
          notifyGoalCompleted(group?.name || "", settings.language).catch(
            () => {},
          );
        } else {
          notifyAchievement(achievementType, settings.language).catch(() => {});
        }
      }
    } catch (err: unknown) {
      // Only ignore duplicate key errors (already unlocked)
      const code = err && typeof err === "object" && "code" in err
        ? (err as { code: string }).code
        : null;
      if (code !== "23505") {
        console.warn(`Failed to unlock achievement ${achievementType}:`, err);
      }
    }
  }
}
