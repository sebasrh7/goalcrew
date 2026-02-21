import { create } from 'zustand';
import { differenceInDays, parseISO } from 'date-fns';
import { supabase, fetchGroupWithMembers, createGroup as apiCreateGroup, joinGroupByCode } from '../lib/supabase';
import { Group, GroupWithStats, GroupsState, CreateGroupInput } from '../types';
import { getMemberStatus } from '../constants';

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  currentGroup: null,
  isLoading: false,

  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn("⚠️ No authenticated user for fetchGroups");
        set({ groups: [] });
        return;
      }

      console.log("📥 Fetching groups for user:", user.id);

      const { data, error } = await supabase
        .from('group_members')
        .select(`
          group:groups(
            *,
            members:group_members(
              *,
              user:users(*)
            ),
            contributions(*, user:users(*))
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error("❌ Error fetching groups:", error.message);
        throw error;
      }

      if (!data) {
        console.log("📭 No groups found");
        set({ groups: [] });
        return;
      }

      const groups = data
        .map((item: any) => item.group)
        .filter(Boolean)
        .map(computeGroupStats);

      console.log("✅ Groups fetched:", groups.length);
      set({ groups });
    } catch (error: any) {
      console.error("❌ fetchGroups error:", error.message);
      // Don't throw - just log and set empty groups
      set({ groups: [] });
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
      set(state => ({
        groups: state.groups.map(g => g.id === id ? group : g),
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  createGroup: async (input: CreateGroupInput): Promise<Group> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const group = await apiCreateGroup({
      name: input.name,
      emoji: input.emoji,
      deadline: input.deadline,
      goal_amount: input.goal_amount,
      frequency: input.frequency,
      division_type: input.division_type,
      created_by: user.id,
    });

    // Auto-join as creator
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      individual_goal: input.goal_amount,
      current_amount: 0,
      streak_days: 0,
      total_points: 0,
    });

    await get().fetchGroups();
    return group;
  },

  joinGroup: async (inviteCode: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    await joinGroupByCode(inviteCode, user.id);
    await get().fetchGroups();
  },
}));

// ─── Compute derived stats ────────────────────────────────────────────────────
function computeGroupStats(raw: any): GroupWithStats {
  const members = raw.members ?? [];
  const contributions = raw.contributions ?? [];
  const now = new Date();
  const deadline = parseISO(raw.deadline);

  const daysRemaining = Math.max(0, differenceInDays(deadline, now));
  const totalDays = Math.max(1, differenceInDays(deadline, parseISO(raw.created_at ?? raw.deadline)));
  const daysElapsed = totalDays - daysRemaining;

  const total_saved = members.reduce((sum: number, m: any) => sum + (m.current_amount ?? 0), 0);
  const total_goal = members.reduce((sum: number, m: any) => sum + (m.individual_goal ?? raw.goal_amount), 0);
  const progress_percent = total_goal > 0 ? Math.round((total_saved / total_goal) * 100) : 0;

  const periodsRemaining =
    raw.frequency === 'daily'
      ? daysRemaining
      : raw.frequency === 'weekly'
        ? Math.ceil(daysRemaining / 7)
        : Math.ceil(daysRemaining / 30);

  const per_period_needed = periodsRemaining > 0
    ? Number(((raw.goal_amount) / (periodsRemaining + 1)).toFixed(2))
    : 0;

  // Add computed status to each member
  const membersWithStatus = members.map((m: any) => ({
    ...m,
    status: getMemberStatus(m.current_amount, m.individual_goal ?? raw.goal_amount, daysElapsed, totalDays),
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
  };
}
