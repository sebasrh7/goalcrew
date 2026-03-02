import { differenceInDays, parseISO } from "date-fns";
import { create } from "zustand";
import { getMemberStatus } from "../constants";
import {
  createGroup as apiCreateGroup,
  deleteGroupApi,
  fetchGroupWithMembers,
  joinGroupByCode,
  leaveGroupApi,
  supabase,
  updateGroupApi,
} from "../lib/supabase";
import {
  Contribution,
  CreateGroupInput,
  Group,
  GroupMember,
  GroupWithStats,
  GroupsState,
} from "../types";

/** Returns the number of days in one period for a given frequency */
function getFrequencyDays(
  frequency: string,
  customDays?: number | null,
): number {
  switch (frequency) {
    case "daily":
      return 1;
    case "weekly":
      return 7;
    case "biweekly":
      return 14;
    case "monthly":
      return 30;
    case "custom":
      return customDays && customDays > 0 ? customDays : 7;
    default:
      return 7;
  }
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  currentGroup: null,
  isLoading: false,

  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ groups: [] });
        return;
      }

      const { data, error } = await supabase
        .from("group_members")
        .select(
          `
          group:groups(
            *,
            members:group_members(
              *,
              user:users(*)
            ),
            contributions(*, user:users(*))
          )
        `,
        )
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      if (!data) {
        set({ groups: [] });
        return;
      }

      const groups = data
        .map(
          (item: Record<string, unknown>) =>
            item.group as Record<string, unknown>,
        )
        .filter(Boolean)
        .map(computeGroupStats);

      set({ groups });
    } catch (error: unknown) {
      // Keep existing groups on transient errors — only clear if we had none
      const current = get().groups;
      if (current.length === 0) {
        set({ groups: [] });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGroup: async (id: string) => {
    set({ isLoading: true });
    try {
      const raw = await fetchGroupWithMembers(id);
      const group = computeGroupStats(raw);
      set({ currentGroup: group });

      // Also update in the list
      set((state) => ({
        groups: state.groups.map((g) => (g.id === id ? group : g)),
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  createGroup: async (input: CreateGroupInput): Promise<Group> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const group = await apiCreateGroup({
      name: input.name,
      emoji: input.emoji,
      deadline: input.deadline,
      goal_amount: input.goal_amount,
      frequency: input.frequency,
      custom_frequency_days: input.custom_frequency_days ?? null,
      division_type: input.division_type,
    });

    await get().fetchGroups();
    return group;
  },

  joinGroup: async (inviteCode: string, individualGoal?: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    await joinGroupByCode(inviteCode, user.id, individualGoal);
    await get().fetchGroups();
  },

  updateMemberGoal: async (groupId: string, newGoal: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("group_members")
      .update({ individual_goal: newGoal })
      .eq("group_id", groupId)
      .eq("user_id", user.id);

    if (error) throw error;

    // Refresh current group to reflect the change
    await get().fetchGroup(groupId);
  },

  leaveGroup: async (groupId: string) => {
    await leaveGroupApi(groupId);
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
      currentGroup:
        state.currentGroup?.id === groupId ? null : state.currentGroup,
    }));
  },

  deleteGroup: async (groupId: string) => {
    await deleteGroupApi(groupId);
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
      currentGroup:
        state.currentGroup?.id === groupId ? null : state.currentGroup,
    }));
  },

  updateGroup: async (
    groupId: string,
    updates: Partial<
      Pick<
        Group,
        | "name"
        | "emoji"
        | "deadline"
        | "goal_amount"
        | "frequency"
        | "custom_frequency_days"
      >
    >,
  ) => {
    await updateGroupApi(groupId, {
      ...updates,
      custom_frequency_days: updates.custom_frequency_days ?? undefined,
    });
    await get().fetchGroup(groupId);
    await get().fetchGroups();
  },
}));

// ─── Compute derived stats ────────────────────────────────────────────────────
function computeGroupStats(raw: Record<string, unknown>): GroupWithStats {
  const members = (raw.members ?? []) as GroupMember[];
  const contributions = (raw.contributions ?? []) as Contribution[];
  const now = new Date();
  const deadline = parseISO(raw.deadline as string);

  const daysRemaining = Math.max(0, differenceInDays(deadline, now));
  const totalDays = Math.max(
    1,
    differenceInDays(
      deadline,
      parseISO((raw.created_at as string) ?? (raw.deadline as string)),
    ),
  );
  const daysElapsed = totalDays - daysRemaining;

  const total_saved = members.reduce(
    (sum: number, m: GroupMember) => sum + (m.current_amount ?? 0),
    0,
  );
  const total_goal = members.reduce(
    (sum: number, m: GroupMember) =>
      sum + (m.individual_goal ?? (raw.goal_amount as number)),
    0,
  );
  const progress_percent =
    total_goal > 0 ? Math.round((total_saved / total_goal) * 100) : 0;

  const frequencyDays = getFrequencyDays(
    raw.frequency as string,
    raw.custom_frequency_days as number | null,
  );
  const periodsRemaining =
    frequencyDays === 1
      ? daysRemaining
      : Math.ceil(daysRemaining / frequencyDays);

  // Calculate per-period needed based on remaining goal, not total goal
  const avgIndividualGoal =
    members.length > 0
      ? total_goal / members.length
      : (raw.goal_amount as number);
  const avgSaved = members.length > 0 ? total_saved / members.length : 0;
  const remaining = Math.max(0, avgIndividualGoal - avgSaved);
  const per_period_needed =
    periodsRemaining > 0
      ? Number((remaining / periodsRemaining).toFixed(2))
      : 0;

  // Add computed status to each member
  const membersWithStatus = members.map((m: GroupMember) => ({
    ...m,
    status: getMemberStatus(
      m.current_amount,
      m.individual_goal ?? (raw.goal_amount as number),
      daysElapsed,
      totalDays,
    ),
  }));

  return {
    ...raw,
    members: membersWithStatus,
    contributions,
    total_saved,
    total_goal,
    progress_percent,
    days_remaining: daysRemaining,
    per_period_needed,
    periods_remaining: periodsRemaining,
  } as GroupWithStats;
}
