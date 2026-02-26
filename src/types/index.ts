// ─── Database Types (matches Supabase schema) ───────────────────────────────

export type FrequencyType =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "custom";
export type DivisionType = "equal" | "custom";
export type MemberStatus = "on_track" | "at_risk" | "behind";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  deadline: string; // ISO date string
  goal_amount: number; // total goal per person in USD
  frequency: FrequencyType;
  custom_frequency_days: number | null;
  division_type: DivisionType;
  invite_code: string;
  created_by: string; // user_id
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  individual_goal: number;
  current_amount: number;
  streak_days: number;
  total_points: number;
  last_contribution_date: string | null;
  status: MemberStatus;
  joined_at: string;
  // Joined from users table
  user?: User;
}

export interface Contribution {
  id: string;
  user_id: string;
  group_id: string;
  amount: number;
  note: string | null;
  created_at: string;
  // Joined
  user?: User;
}

export interface Achievement {
  id: string;
  user_id: string;
  group_id: string;
  achievement_type: AchievementType;
  unlocked_at: string;
}

export type AchievementType =
  | "first_contribution"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "first_50_percent"
  | "goal_completed"
  | "most_consistent"
  | "early_bird"
  | "big_saver";

// ─── UI / Computed Types ─────────────────────────────────────────────────────

export interface GroupWithStats extends Group {
  members: GroupMember[];
  contributions: Contribution[];
  total_saved: number;
  total_goal: number;
  progress_percent: number;
  days_remaining: number;
  per_period_needed: number;
  periods_remaining: number;
}

export interface RankingEntry {
  user: User;
  member: GroupMember;
  rank: number;
}

export interface AchievementConfig {
  type: AchievementType;
  icon: string;
  color: string;
  title: string;
  description: string;
}

// ─── Navigation Types ────────────────────────────────────────────────────────

export type RootStackParamList = {
  "(auth)": undefined;
  "(tabs)": undefined;
};

export type AuthStackParamList = {
  welcome: undefined;
  login: undefined;
  register: undefined;
};

export type TabParamList = {
  index: undefined;
  create: undefined;
  notifications: undefined;
  profile: undefined;
};

export type GroupStackParamList = {
  "[id]": { id: string };
  ranking: { groupId: string };
  history: { groupId: string };
  invite: { groupId: string; inviteCode: string };
};

// ─── Store Types ─────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export interface GroupsState {
  groups: GroupWithStats[];
  currentGroup: GroupWithStats | null;
  isLoading: boolean;
  fetchGroups: () => Promise<void>;
  fetchGroup: (id: string) => Promise<void>;
  createGroup: (data: CreateGroupInput) => Promise<Group>;
  joinGroup: (inviteCode: string, individualGoal?: number) => Promise<void>;
  updateMemberGoal: (groupId: string, newGoal: number) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  updateGroup: (
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
  ) => Promise<void>;
}

export interface CreateGroupInput {
  name: string;
  emoji: string;
  deadline: string;
  goal_amount: number;
  frequency: FrequencyType;
  custom_frequency_days?: number;
  division_type: DivisionType;
  member_count?: number;
}

export interface ContributionsState {
  contributions: Contribution[];
  isLoading: boolean;
  addContribution: (
    groupId: string,
    amount: number,
    note?: string,
  ) => Promise<void>;
  fetchContributions: (groupId: string) => Promise<void>;
  deleteContribution: (
    contributionId: string,
    groupId: string,
  ) => Promise<void>;
  updateContribution: (
    contributionId: string,
    groupId: string,
    updates: { amount?: number; note?: string },
  ) => Promise<void>;
}
