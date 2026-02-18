-- ╔══════════════════════════════════════════════════════════════╗
-- ║          GoalCrew — Supabase Database Schema                ║
-- ║  Run this in your Supabase SQL Editor                       ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── USERS TABLE ──────────────────────────────────────────────────────────────
create table public.users (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text unique not null,
  name        text not null,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

-- Auto-create user profile on signup (works with Google OAuth)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── GROUPS TABLE ─────────────────────────────────────────────────────────────
create type frequency_type as enum ('daily', 'weekly', 'monthly');
create type division_type  as enum ('equal', 'custom');

create table public.groups (
  id              uuid default uuid_generate_v4() primary key,
  name            text not null,
  emoji           text default '✈️',
  deadline        date not null,
  goal_amount     numeric(10,2) not null check (goal_amount > 0),
  frequency       frequency_type default 'weekly' not null,
  division_type   division_type default 'equal' not null,
  invite_code     text unique not null,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz default now() not null
);

-- ─── GROUP MEMBERS TABLE ──────────────────────────────────────────────────────
create type member_status as enum ('on_track', 'at_risk', 'behind');

create table public.group_members (
  id                      uuid default uuid_generate_v4() primary key,
  group_id                uuid references public.groups(id) on delete cascade not null,
  user_id                 uuid references public.users(id) on delete cascade not null,
  individual_goal         numeric(10,2) not null,
  current_amount          numeric(10,2) default 0 not null,
  streak_days             integer default 0 not null,
  total_points            integer default 0 not null,
  last_contribution_date  date,
  status                  member_status default 'on_track',
  joined_at               timestamptz default now() not null,
  unique(group_id, user_id)
);

-- ─── CONTRIBUTIONS TABLE ──────────────────────────────────────────────────────
create table public.contributions (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.users(id) on delete cascade not null,
  group_id    uuid references public.groups(id) on delete cascade not null,
  amount      numeric(10,2) not null check (amount > 0),
  note        text,
  created_at  timestamptz default now() not null
);

-- ─── ACHIEVEMENTS TABLE ───────────────────────────────────────────────────────
create type achievement_type as enum (
  'first_contribution',
  'streak_3',
  'streak_7',
  'streak_30',
  'first_50_percent',
  'goal_completed',
  'most_consistent',
  'early_bird',
  'big_saver'
);

create table public.achievements (
  id                uuid default uuid_generate_v4() primary key,
  user_id           uuid references public.users(id) on delete cascade not null,
  group_id          uuid references public.groups(id) on delete cascade not null,
  achievement_type  achievement_type not null,
  unlocked_at       timestamptz default now() not null,
  unique(user_id, group_id, achievement_type)
);

-- ─── FUNCTIONS & TRIGGERS ─────────────────────────────────────────────────────

-- Update member amount and streak after a contribution
create or replace function update_member_after_contribution(
  p_user_id uuid,
  p_group_id uuid,
  p_amount numeric
)
returns void as $$
declare
  v_member      record;
  v_today       date := current_date;
  v_new_streak  integer;
begin
  select * into v_member
  from group_members
  where user_id = p_user_id and group_id = p_group_id
  for update;

  if not found then
    raise exception 'Member not found';
  end if;

  -- Calculate new streak
  if v_member.last_contribution_date is null then
    v_new_streak := 1;
  elsif v_member.last_contribution_date = v_today - interval '1 day' then
    v_new_streak := v_member.streak_days + 1;
  elsif v_member.last_contribution_date = v_today then
    v_new_streak := v_member.streak_days; -- Already saved today
  else
    v_new_streak := 1; -- Streak broken
  end if;

  -- Calculate points: base (amount * 0.25) + streak bonus (5 per streak day)
  declare
    v_base_points integer := floor(p_amount * 0.25);
    v_streak_bonus integer := 5;
    v_total_points integer := v_member.total_points + v_base_points + v_streak_bonus;
  begin
    update group_members set
      current_amount = current_amount + p_amount,
      streak_days = v_new_streak,
      total_points = v_total_points,
      last_contribution_date = v_today,
      status = case
        when (current_amount + p_amount) / individual_goal >= 0.9 then 'on_track'::member_status
        when (current_amount + p_amount) / individual_goal >= 0.6 then 'at_risk'::member_status
        else 'behind'::member_status
      end
    where user_id = p_user_id and group_id = p_group_id;
  end;
end;
$$ language plpgsql security definer;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table public.users         enable row level security;
alter table public.groups        enable row level security;
alter table public.group_members enable row level security;
alter table public.contributions enable row level security;
alter table public.achievements  enable row level security;

-- Users: can see their own profile
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Groups: members can see groups they belong to
create policy "Members can view their groups"
  on public.groups for select
  using (
    id in (
      select group_id from group_members
      where user_id = auth.uid()
    )
  );

create policy "Authenticated users can create groups"
  on public.groups for insert
  with check (auth.uid() = created_by);

-- Group members: members can see other members of their groups
create policy "Members can view group members"
  on public.group_members for select
  using (
    group_id in (
      select group_id from group_members
      where user_id = auth.uid()
    )
  );

create policy "Users can join groups"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "Users can update own membership"
  on public.group_members for update
  using (auth.uid() = user_id);

-- Contributions: members can see contributions in their groups
create policy "Members can view group contributions"
  on public.contributions for select
  using (
    group_id in (
      select group_id from group_members
      where user_id = auth.uid()
    )
  );

create policy "Members can add contributions"
  on public.contributions for insert
  with check (
    auth.uid() = user_id
    and group_id in (
      select group_id from group_members
      where user_id = auth.uid()
    )
  );

-- Achievements
create policy "Users can view own achievements"
  on public.achievements for select
  using (user_id = auth.uid());

create policy "System can insert achievements"
  on public.achievements for insert
  with check (auth.uid() = user_id);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
create index idx_group_members_user    on group_members(user_id);
create index idx_group_members_group   on group_members(group_id);
create index idx_contributions_group   on contributions(group_id);
create index idx_contributions_user    on contributions(user_id);
create index idx_contributions_date    on contributions(created_at desc);
create index idx_achievements_user     on achievements(user_id);
create index idx_groups_invite_code    on groups(invite_code);

-- ─── REALTIME ─────────────────────────────────────────────────────────────────
-- Enable realtime for contributions
alter publication supabase_realtime add table contributions;
alter publication supabase_realtime add table group_members;
