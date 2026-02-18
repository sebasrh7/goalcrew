import { create } from 'zustand';
import { supabase, addContribution as apiAdd, fetchGroupContributions, unlockAchievement } from '../lib/supabase';
import { Contribution, ContributionsState } from '../types';
import { calculatePoints } from '../constants';
import { useGroupsStore } from './groupsStore';

interface ContributionsStoreState extends ContributionsState {
  lastUnlockedAchievement: string | null;
  clearLastAchievement: () => void;
}

export const useContributionsStore = create<ContributionsStoreState>((set, get) => ({
  contributions: [],
  isLoading: false,
  lastUnlockedAchievement: null,

  clearLastAchievement: () => set({ lastUnlockedAchievement: null }),

  addContribution: async (groupId: string, amount: number, note?: string) => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const contribution = await apiAdd(user.id, groupId, amount, note);

      // Update local state optimistically
      set(state => ({
        contributions: [contribution, ...state.contributions],
      }));

      // Get current member data for points calculation
      const { data: member } = await supabase
        .from('group_members')
        .select('streak_days, current_amount, total_points, individual_goal')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .single();

      const points = calculatePoints(amount, member?.streak_days ?? 0);

      // Update points
      await supabase
        .from('group_members')
        .update({ total_points: (member?.total_points ?? 0) + points })
        .eq('user_id', user.id)
        .eq('group_id', groupId);

      // Check achievements
      await checkAndUnlockAchievements(
        user.id,
        groupId,
        amount,
        member?.current_amount ?? 0,
        member?.streak_days ?? 0,
        member?.individual_goal ?? 0,
        set
      );

      // Refresh group data
      await useGroupsStore.getState().fetchGroup(groupId);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchContributions: async (groupId: string) => {
    set({ isLoading: true });
    try {
      const data = await fetchGroupContributions(groupId);
      set({ contributions: data });
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
  set: any
) {
  const toUnlock: string[] = [];

  // Check first contribution
  const { data: existingContribs } = await supabase
    .from('contributions')
    .select('id')
    .eq('user_id', userId)
    .eq('group_id', groupId);

  if (existingContribs?.length === 1) toUnlock.push('first_contribution');

  // Streak achievements
  if (streakDays + 1 >= 7) toUnlock.push('streak_7');
  else if (streakDays + 1 >= 3) toUnlock.push('streak_3');
  if (streakDays + 1 >= 30) toUnlock.push('streak_30');

  // Big saver
  if (amount >= 100) toUnlock.push('big_saver');

  // First to 50%
  const newAmount = currentAmount + amount;
  if (individualGoal > 0 && newAmount / individualGoal >= 0.5 && currentAmount / individualGoal < 0.5) {
    // Check if anyone else in the group has reached 50% before
    const { data: otherMembers } = await supabase
      .from('group_members')
      .select('current_amount, individual_goal')
      .eq('group_id', groupId)
      .neq('user_id', userId);

    const someoneElseAt50 = otherMembers?.some(
      m => m.current_amount / (m.individual_goal || 1) >= 0.5
    );
    if (!someoneElseAt50) toUnlock.push('first_50_percent');
  }

  // Goal completed
  if (individualGoal > 0 && newAmount >= individualGoal) toUnlock.push('goal_completed');

  // Unlock achievements and notify
  for (const achievementType of toUnlock) {
    try {
      await unlockAchievement(userId, groupId, achievementType);
      set({ lastUnlockedAchievement: achievementType });
    } catch {
      // Already unlocked, ignore
    }
  }
}
