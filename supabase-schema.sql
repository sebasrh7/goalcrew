-- ╔══════════════════════════════════════════════════════════════╗
-- ║          GoalCrew — Supabase Database Schema                ║
-- ║  Run this in your Supabase SQL Editor                       ║
-- ║  Last updated: 2026-02-25 (Phase 1 - Production Ready)     ║
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
returns trigger
language plpgsql security definer
set search_path to 'public'
as $$
begin
  insert into public.users (id, email, name, avatar_url, created_at)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    now()
  )
  on conflict (id) do update set
    name = excluded.name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── ENUMS ────────────────────────────────────────────────────────────────────
create type frequency_type as enum ('daily', 'weekly', 'biweekly', 'monthly', 'custom');
create type division_type  as enum ('equal', 'custom');
create type member_status  as enum ('on_track', 'at_risk', 'behind');
create type achievement_type as enum (
  'first_contribution', 'streak_3', 'streak_7', 'streak_30',
  'first_50_percent', 'goal_completed', 'most_consistent',
  'early_bird', 'big_saver'
);

-- ─── GROUPS TABLE ─────────────────────────────────────────────────────────────
create table public.groups (
  id                    uuid default uuid_generate_v4() primary key,
  name                  text not null,
  emoji                 text default 'sunny',
  deadline              date not null,
  goal_amount           numeric not null check (goal_amount > 0),
  frequency             frequency_type default 'weekly' not null,
  custom_frequency_days integer,
  division_type         division_type default 'equal' not null,
  invite_code           text unique not null,
  created_by            uuid references public.users(id) on delete set null,
  total_saved           numeric default 0 not null,
  created_at            timestamptz default now() not null,
  updated_at            timestamptz default now() not null
);

-- ─── GROUP MEMBERS TABLE ──────────────────────────────────────────────────────
create table public.group_members (
  id                      uuid default uuid_generate_v4() primary key,
  group_id                uuid references public.groups(id) on delete cascade not null,
  user_id                 uuid references public.users(id) on delete cascade not null,
  individual_goal         numeric not null,
  current_amount          numeric default 0 not null,
  streak_days             integer default 0 not null,
  total_points            integer default 0 not null,
  last_contribution_date  date,
  last_completed_period   integer default -1 not null,
  status                  member_status default 'on_track',
  joined_at               timestamptz default now() not null,
  unique(group_id, user_id)
);

-- ─── CONTRIBUTIONS TABLE ──────────────────────────────────────────────────────
create table public.contributions (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.users(id) on delete cascade not null,
  group_id      uuid references public.groups(id) on delete cascade not null,
  amount        numeric not null check (amount > 0),
  note          text,
  created_at    timestamptz default now() not null
);

-- ─── ACHIEVEMENTS TABLE ───────────────────────────────────────────────────────
create table public.achievements (
  id                uuid default uuid_generate_v4() primary key,
  user_id           uuid references public.users(id) on delete cascade not null,
  group_id          uuid references public.groups(id) on delete cascade not null,
  achievement_type  achievement_type not null,
  unlocked_at       timestamptz default now() not null,
  unique(user_id, group_id, achievement_type)
);

-- ─── USER SETTINGS TABLE ──────────────────────────────────────────────────────
create table public.user_settings (
  id                        uuid default gen_random_uuid() primary key,
  user_id                   uuid unique references auth.users(id) on delete cascade,
  language                  varchar default 'es' not null,
  currency                  varchar default 'USD' not null,
  theme                     varchar default 'light' not null,
  push_notifications        boolean default true,
  contribution_reminders    boolean default true,
  achievement_notifications boolean default true,
  created_at                timestamptz default timezone('utc', now()) not null,
  updated_at                timestamptz default timezone('utc', now()) not null
);

-- ─── PUSH TOKENS TABLE ───────────────────────────────────────────────────────
create table public.push_tokens (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  token       text not null,
  platform    varchar not null,
  is_active   boolean default true,
  created_at  timestamptz default timezone('utc', now()) not null,
  updated_at  timestamptz default timezone('utc', now()) not null,
  unique(user_id, platform)
);

-- ─── HELPER: updated_at trigger ───────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql
set search_path to 'public' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.handle_updated_at();

create trigger handle_push_tokens_updated_at
  before update on public.push_tokens
  for each row execute function public.handle_updated_at();

create trigger handle_groups_updated_at
  before update on public.groups
  for each row execute function public.handle_updated_at();

-- ─── FUNCTIONS & RPCs ─────────────────────────────────────────────────────────

-- Update member amount, streak (period-based), points and status after a contribution
-- Streak counts consecutive PERIODS where the user met the per-period target.
-- A period is completed when the sum of contributions in that period >= per_period_target.
-- Excess contributions do NOT carry over to the next period (encourages consistent engagement).
create or replace function public.update_member_after_contribution(
  p_user_id uuid, p_group_id uuid, p_amount numeric
) returns void language plpgsql security definer
set search_path to 'public' as $$
declare
  v_member record;
  v_group record;
  v_today date := current_date;
  v_period_days integer;
  v_group_start date;
  v_current_period integer;
  v_period_start date;
  v_period_end date;
  v_period_contributions numeric;
  v_per_period_target numeric;
  v_total_periods integer;
  v_new_streak integer;
  v_streak_bonus integer := 0;
  v_goal_already_met boolean;
begin
  select * into v_member from group_members
  where user_id = p_user_id and group_id = p_group_id for update;
  if not found then raise exception 'Member not found'; end if;

  select * into v_group from groups where id = p_group_id;

  v_period_days := case v_group.frequency
    when 'daily' then 1
    when 'weekly' then 7
    when 'biweekly' then 14
    when 'monthly' then 30
    when 'custom' then coalesce(v_group.custom_frequency_days, 7)
    else 7
  end;

  v_group_start := v_group.created_at::date;
  v_current_period := greatest(0, floor((v_today - v_group_start)::numeric / v_period_days));
  v_period_start := v_group_start + (v_current_period * v_period_days);
  v_period_end := v_period_start + v_period_days - 1;
  v_total_periods := greatest(1, ceil(((v_group.deadline - v_group_start)::numeric) / v_period_days));
  v_per_period_target := v_member.individual_goal / v_total_periods;
  v_goal_already_met := (v_member.current_amount + p_amount) >= v_member.individual_goal;

  -- Sum contributions in the current period (including the just-inserted one)
  select coalesce(sum(amount), 0) into v_period_contributions
  from contributions
  where user_id = p_user_id and group_id = p_group_id
    and created_at::date >= v_period_start and created_at::date <= v_period_end;

  if v_period_contributions >= v_per_period_target or v_goal_already_met then
    -- Period is completed
    if v_member.last_completed_period = v_current_period then
      v_new_streak := v_member.streak_days; v_streak_bonus := 0;
    elsif v_member.last_completed_period = v_current_period - 1 then
      v_new_streak := v_member.streak_days + 1; v_streak_bonus := 5;
    elsif v_member.last_completed_period < 0 then
      v_new_streak := 1; v_streak_bonus := 5;
    else
      v_new_streak := 1; v_streak_bonus := 5;
    end if;

    update group_members set
      current_amount = current_amount + p_amount,
      streak_days = v_new_streak,
      last_completed_period = v_current_period,
      total_points = v_member.total_points + floor(p_amount * 0.25) + v_streak_bonus,
      last_contribution_date = v_today,
      status = case
        when (current_amount + p_amount) / nullif(individual_goal, 0) >= 0.9 then 'on_track'::member_status
        when (current_amount + p_amount) / nullif(individual_goal, 0) >= 0.6 then 'at_risk'::member_status
        else 'behind'::member_status
      end
    where user_id = p_user_id and group_id = p_group_id;
  else
    -- Period NOT yet completed — update amount, no streak change
    update group_members set
      current_amount = current_amount + p_amount,
      total_points = v_member.total_points + floor(p_amount * 0.25),
      last_contribution_date = v_today,
      status = case
        when (current_amount + p_amount) / nullif(individual_goal, 0) >= 0.9 then 'on_track'::member_status
        when (current_amount + p_amount) / nullif(individual_goal, 0) >= 0.6 then 'at_risk'::member_status
        else 'behind'::member_status
      end
    where user_id = p_user_id and group_id = p_group_id;
  end if;
end;
$$;

-- Fallback: simple increment without streak/points
create or replace function public.increment_member_amount(
  p_user_id uuid, p_group_id uuid, p_amount numeric
) returns void language plpgsql security definer
set search_path to 'public' as $$
begin
  update public.group_members
  set current_amount = current_amount + p_amount,
      last_contribution_date = current_date
  where user_id = p_user_id and group_id = p_group_id;
end;
$$;

-- Create a new group + auto-join the creator (SECURITY DEFINER)
create or replace function public.create_group(
  p_name text,
  p_emoji text,
  p_deadline date,
  p_goal_amount numeric,
  p_frequency frequency_type,
  p_custom_frequency_days integer default null,
  p_division_type division_type default 'equal'
) returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_user_id uuid := auth.uid();
  v_group_id uuid;
  v_invite_code text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Generate unique 8-char invite code
  loop
    v_invite_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    exit when not exists (select 1 from public.groups where invite_code = v_invite_code);
  end loop;

  insert into public.groups (name, emoji, deadline, goal_amount, frequency, custom_frequency_days, division_type, invite_code, created_by)
  values (p_name, p_emoji, p_deadline, p_goal_amount, p_frequency, p_custom_frequency_days, p_division_type, v_invite_code, v_user_id)
  returning id into v_group_id;

  -- Auto-join the creator as first member
  insert into public.group_members (group_id, user_id, individual_goal)
  values (v_group_id, v_user_id, p_goal_amount);

  return jsonb_build_object(
    'id', v_group_id,
    'name', p_name,
    'emoji', p_emoji,
    'deadline', p_deadline,
    'goal_amount', p_goal_amount,
    'frequency', p_frequency,
    'custom_frequency_days', p_custom_frequency_days,
    'division_type', p_division_type,
    'invite_code', v_invite_code,
    'created_by', v_user_id
  );
end;
$$;

-- Join a group by invite code (SECURITY DEFINER to bypass RLS)
create or replace function public.join_group_by_code(
  p_invite_code text, p_individual_goal numeric default null
) returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_group record; v_user_id uuid := auth.uid(); v_existing record; v_goal_amount numeric;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;

  select * into v_group from public.groups where invite_code = p_invite_code;
  if not found then raise exception 'Invalid invite code'; end if;

  select id into v_existing from public.group_members
  where group_id = v_group.id and user_id = v_user_id;
  if found then raise exception 'Already a member of this group'; end if;

  v_goal_amount := case
    when v_group.division_type = 'custom' and p_individual_goal is not null then p_individual_goal
    else v_group.goal_amount
  end;

  insert into public.group_members (group_id, user_id, individual_goal, current_amount, streak_days, total_points, last_completed_period)
  values (v_group.id, v_user_id, v_goal_amount, 0, 0, 0, -1);

  return jsonb_build_object(
    'id', v_group.id, 'name', v_group.name, 'emoji', v_group.emoji,
    'deadline', v_group.deadline, 'goal_amount', v_group.goal_amount,
    'frequency', v_group.frequency, 'custom_frequency_days', v_group.custom_frequency_days,
    'division_type', v_group.division_type, 'invite_code', v_group.invite_code,
    'created_by', v_group.created_by, 'created_at', v_group.created_at
  );
end;
$$;

-- Preview group info by invite code (for join screen)
create or replace function public.peek_group_by_code(p_invite_code text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_group record; v_member_count integer;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  select * into v_group from public.groups where invite_code = p_invite_code;
  if not found then raise exception 'Invalid invite code'; end if;

  select count(*) into v_member_count from public.group_members where group_id = v_group.id;

  return jsonb_build_object(
    'id', v_group.id, 'name', v_group.name, 'emoji', v_group.emoji,
    'deadline', v_group.deadline, 'goal_amount', v_group.goal_amount,
    'frequency', v_group.frequency, 'division_type', v_group.division_type,
    'member_count', v_member_count
  );
end;
$$;

-- Delete own account (SECURITY DEFINER to bypass RLS)
create or replace function public.delete_own_account()
returns void language plpgsql security definer
set search_path to 'public' as $$
begin
  delete from public.user_settings where user_id = auth.uid();
  delete from public.users where id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;

-- ─── PHASE 2: Group & Contribution management RPCs ───────────────────────────

-- Leave group (non-creator only)
create or replace function public.leave_group(p_group_id uuid)
returns void language plpgsql security definer
set search_path to 'public' as $$
begin
  if exists (select 1 from public.groups where id = p_group_id and created_by = auth.uid()) then
    raise exception 'CREATOR_CANNOT_LEAVE';
  end if;
  delete from public.group_members where group_id = p_group_id and user_id = auth.uid();
end;
$$;

-- Delete group (creator only, cascades via FK)
create or replace function public.delete_group(p_group_id uuid)
returns void language plpgsql security definer
set search_path to 'public' as $$
begin
  if not exists (select 1 from public.groups where id = p_group_id and created_by = auth.uid()) then
    raise exception 'NOT_CREATOR';
  end if;
  delete from public.groups where id = p_group_id;
end;
$$;

-- Update group (creator only) — resets streaks if frequency changes
create or replace function public.update_group(
  p_group_id uuid,
  p_name text default null,
  p_emoji text default null,
  p_deadline timestamptz default null,
  p_goal_amount numeric default null,
  p_frequency text default null,
  p_custom_frequency_days int default null
)
returns void language plpgsql security definer
set search_path to 'public' as $$
declare
  v_group record;
  v_frequency_changed boolean := false;
begin
  select * into v_group from public.groups where id = p_group_id and created_by = auth.uid();
  if not found then raise exception 'NOT_CREATOR'; end if;

  if p_frequency is not null and p_frequency::frequency_type <> v_group.frequency then
    v_frequency_changed := true;
  end if;
  if p_custom_frequency_days is not null and v_group.frequency = 'custom'
     and p_custom_frequency_days <> coalesce(v_group.custom_frequency_days, 0) then
    v_frequency_changed := true;
  end if;

  update public.groups set
    name = coalesce(p_name, name),
    emoji = coalesce(p_emoji, emoji),
    deadline = coalesce(p_deadline, deadline),
    goal_amount = coalesce(p_goal_amount, goal_amount),
    frequency = coalesce(p_frequency, frequency::text)::frequency_type,
    custom_frequency_days = coalesce(p_custom_frequency_days, custom_frequency_days),
    updated_at = now()
  where id = p_group_id;

  if v_group.division_type = 'equal' and p_goal_amount is not null then
    update public.group_members set
      individual_goal = p_goal_amount
    where group_id = p_group_id;
  end if;

  -- Reset all streaks when frequency changes (period boundaries shift)
  if v_frequency_changed then
    update public.group_members set
      streak_days = 0,
      last_completed_period = -1
    where group_id = p_group_id;
  end if;
end;
$$;

-- Delete contribution (author only, reverts member amount, recalculates streak for current period)
create or replace function public.delete_contribution(p_contribution_id uuid)
returns void language plpgsql security definer
set search_path to 'public' as $$
declare
  v_contrib record;
  v_group record;
  v_member record;
  v_period_days integer;
  v_group_start date;
  v_current_period integer;
  v_contrib_period integer;
  v_period_start date;
  v_period_end date;
  v_period_contributions numeric;
  v_per_period_target numeric;
  v_total_periods integer;
  v_today date := current_date;
begin
  select * into v_contrib from public.contributions where id = p_contribution_id and user_id = auth.uid();
  if not found then raise exception 'NOT_AUTHOR'; end if;

  select * into v_group from public.groups where id = v_contrib.group_id;
  select * into v_member from public.group_members
  where group_id = v_contrib.group_id and user_id = auth.uid();

  v_period_days := case v_group.frequency
    when 'daily' then 1 when 'weekly' then 7 when 'biweekly' then 14
    when 'monthly' then 30 when 'custom' then coalesce(v_group.custom_frequency_days, 7) else 7
  end;

  v_group_start := v_group.created_at::date;
  v_contrib_period := floor((v_contrib.created_at::date - v_group_start)::numeric / v_period_days);
  v_current_period := floor((v_today - v_group_start)::numeric / v_period_days);

  update public.group_members set
    current_amount = current_amount - v_contrib.amount
  where group_id = v_contrib.group_id and user_id = auth.uid();

  update public.groups set
    total_saved = total_saved - v_contrib.amount
  where id = v_contrib.group_id;

  delete from public.contributions where id = p_contribution_id;

  -- Re-evaluate period if the deleted contribution was in the current completed period
  if v_contrib_period = v_current_period and v_member.last_completed_period = v_current_period then
    v_total_periods := greatest(1, ceil(((v_group.deadline - v_group_start)::numeric) / v_period_days));
    v_per_period_target := v_member.individual_goal / v_total_periods;
    v_period_start := v_group_start + (v_current_period * v_period_days);
    v_period_end := v_period_start + v_period_days - 1;

    select coalesce(sum(amount), 0) into v_period_contributions
    from contributions
    where user_id = auth.uid() and group_id = v_contrib.group_id
      and created_at::date >= v_period_start and created_at::date <= v_period_end;

    if v_period_contributions < v_per_period_target
       and (v_member.current_amount - v_contrib.amount) < v_member.individual_goal then
      update public.group_members set
        last_completed_period = v_member.last_completed_period - 1,
        streak_days = greatest(0, v_member.streak_days - 1)
      where group_id = v_contrib.group_id and user_id = auth.uid();
    end if;
  end if;
end;
$$;

-- Update contribution (author only, adjusts member total, recalculates streak for current period)
create or replace function public.update_contribution(
  p_contribution_id uuid,
  p_amount numeric default null,
  p_note text default null
)
returns void language plpgsql security definer
set search_path to 'public' as $$
declare
  v_contrib record;
  v_group record;
  v_member record;
  v_diff numeric;
  v_period_days integer;
  v_group_start date;
  v_contrib_period integer;
  v_current_period integer;
  v_period_start date;
  v_period_end date;
  v_period_contributions numeric;
  v_per_period_target numeric;
  v_total_periods integer;
  v_today date := current_date;
begin
  select * into v_contrib from public.contributions where id = p_contribution_id and user_id = auth.uid();
  if not found then raise exception 'NOT_AUTHOR'; end if;

  v_diff := coalesce(p_amount, v_contrib.amount) - v_contrib.amount;

  update public.contributions set
    amount = coalesce(p_amount, amount),
    note = coalesce(p_note, note)
  where id = p_contribution_id;

  if v_diff <> 0 then
    update public.group_members set
      current_amount = current_amount + v_diff
    where group_id = v_contrib.group_id and user_id = auth.uid();

    update public.groups set
      total_saved = total_saved + v_diff
    where id = v_contrib.group_id;

    select * into v_group from public.groups where id = v_contrib.group_id;
    select * into v_member from public.group_members
    where group_id = v_contrib.group_id and user_id = auth.uid();

    v_period_days := case v_group.frequency
      when 'daily' then 1 when 'weekly' then 7 when 'biweekly' then 14
      when 'monthly' then 30 when 'custom' then coalesce(v_group.custom_frequency_days, 7) else 7
    end;

    v_group_start := v_group.created_at::date;
    v_contrib_period := floor((v_contrib.created_at::date - v_group_start)::numeric / v_period_days);
    v_current_period := floor((v_today - v_group_start)::numeric / v_period_days);

    if v_contrib_period = v_current_period then
      v_total_periods := greatest(1, ceil(((v_group.deadline - v_group_start)::numeric) / v_period_days));
      v_per_period_target := v_member.individual_goal / v_total_periods;
      v_period_start := v_group_start + (v_current_period * v_period_days);
      v_period_end := v_period_start + v_period_days - 1;

      select coalesce(sum(amount), 0) into v_period_contributions
      from contributions
      where user_id = auth.uid() and group_id = v_contrib.group_id
        and created_at::date >= v_period_start and created_at::date <= v_period_end;

      if v_period_contributions >= v_per_period_target and v_member.last_completed_period < v_current_period then
        if v_member.last_completed_period = v_current_period - 1 then
          update public.group_members set
            streak_days = streak_days + 1, last_completed_period = v_current_period, total_points = total_points + 5
          where group_id = v_contrib.group_id and user_id = auth.uid();
        else
          update public.group_members set
            streak_days = 1, last_completed_period = v_current_period, total_points = total_points + 5
          where group_id = v_contrib.group_id and user_id = auth.uid();
        end if;
      elsif v_period_contributions < v_per_period_target
            and v_member.last_completed_period = v_current_period
            and v_member.current_amount < v_member.individual_goal then
        update public.group_members set
          streak_days = greatest(0, streak_days - 1), last_completed_period = v_current_period - 1
        where group_id = v_contrib.group_id and user_id = auth.uid();
      end if;
    end if;
  end if;
end;
$$;

-- ─── HELPER: get user's group IDs (SECURITY DEFINER to avoid RLS recursion) ──
create or replace function public.user_group_ids(p_user_id uuid)
returns setof uuid language sql security definer stable
set search_path to 'public'
as $$
  select group_id from public.group_members where user_id = p_user_id;
$$;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table public.users         enable row level security;
alter table public.groups        enable row level security;
alter table public.group_members enable row level security;
alter table public.contributions enable row level security;
alter table public.achievements  enable row level security;
alter table public.user_settings enable row level security;
alter table public.push_tokens   enable row level security;

-- Users
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_select_group_mates" on public.users for select using (
  id in (select gm.user_id from public.group_members gm
    where gm.group_id in (select public.user_group_ids(auth.uid())))
);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

-- Groups (use helper to avoid recursion through group_members)
create policy "groups_select_member" on public.groups for select using (
  id in (select public.user_group_ids(auth.uid()))
);
create policy "groups_insert_auth" on public.groups for insert with check (auth.uid() = created_by);
create policy "groups_update_creator" on public.groups for update using (auth.uid() = created_by) with check (auth.uid() = created_by);
create policy "groups_delete_creator" on public.groups for delete using (auth.uid() = created_by);

-- Group members (use helper to avoid self-referencing recursion)
create policy "members_select_group" on public.group_members for select using (
  group_id in (select public.user_group_ids(auth.uid()))
);
create policy "members_insert_self" on public.group_members for insert with check (auth.uid() = user_id);
create policy "members_update_self" on public.group_members for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "members_delete_self" on public.group_members for delete using (auth.uid() = user_id);

-- Contributions (use helper)
create policy "contributions_select_group" on public.contributions for select using (
  group_id in (select public.user_group_ids(auth.uid()))
);
create policy "contributions_insert_own" on public.contributions for insert with check (auth.uid() = user_id);

-- Achievements
create policy "achievements_select_own" on public.achievements for select using (auth.uid() = user_id);
create policy "achievements_select_group" on public.achievements for select using (
  group_id in (select public.user_group_ids(auth.uid()))
);
create policy "achievements_insert_own" on public.achievements for insert with check (auth.uid() = user_id);

-- User settings
create policy "user_settings_select" on public.user_settings for select using (auth.uid() = user_id);
create policy "user_settings_insert" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "user_settings_update" on public.user_settings for update using (auth.uid() = user_id);
create policy "user_settings_delete" on public.user_settings for delete using (auth.uid() = user_id);

-- Push tokens
create policy "push_tokens_select" on public.push_tokens for select using (auth.uid() = user_id);
create policy "push_tokens_insert" on public.push_tokens for insert with check (auth.uid() = user_id);
create policy "push_tokens_update" on public.push_tokens for update using (auth.uid() = user_id);
create policy "push_tokens_delete" on public.push_tokens for delete using (auth.uid() = user_id);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
create index idx_group_members_user    on group_members(user_id);
create index idx_group_members_group   on group_members(group_id);
create index idx_contributions_group   on contributions(group_id);
create index idx_contributions_user    on contributions(user_id);
create index idx_contributions_date    on contributions(created_at desc);
create index idx_achievements_user     on achievements(user_id);
create index idx_groups_invite_code    on groups(invite_code);

-- ─── REALTIME ─────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table contributions;
alter publication supabase_realtime add table group_members;

-- ─── STORAGE ──────────────────────────────────────────────────────────────────
-- Create 'avatars' bucket via Supabase Dashboard > Storage:
--   Name: avatars | Public: Yes | MIME: image/jpeg, image/png, image/webp | Max: 5MB
