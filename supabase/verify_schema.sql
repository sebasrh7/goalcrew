-- ============================================================================
-- GoalCrew Schema Verification
-- Run this in Supabase SQL Editor to check everything is in place
-- ============================================================================

DO $$
DECLARE
  _ok boolean := true;
  _missing text[] := '{}';
  _warnings text[] := '{}';
  _count int;
BEGIN

  -- ─── 1. Core tables ───────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users') THEN
    _missing := array_append(_missing, 'TABLE: users');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='groups') THEN
    _missing := array_append(_missing, 'TABLE: groups');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='group_members') THEN
    _missing := array_append(_missing, 'TABLE: group_members');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contributions') THEN
    _missing := array_append(_missing, 'TABLE: contributions');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='achievements') THEN
    _missing := array_append(_missing, 'TABLE: achievements');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='group_messages') THEN
    _missing := array_append(_missing, 'TABLE: group_messages');
  END IF;

  -- ─── 2. group_status enum ─────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'group_status') THEN
    _missing := array_append(_missing, 'ENUM: group_status');
  END IF;

  -- ─── 3. Columns added by migration ────────────────────────────────────────
  -- groups.status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='groups' AND column_name='status'
  ) THEN
    _missing := array_append(_missing, 'COLUMN: groups.status');
  END IF;

  -- groups.completed_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='groups' AND column_name='completed_at'
  ) THEN
    _missing := array_append(_missing, 'COLUMN: groups.completed_at');
  END IF;

  -- contributions.proof_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='contributions' AND column_name='proof_url'
  ) THEN
    _missing := array_append(_missing, 'COLUMN: contributions.proof_url');
  END IF;

  -- group_members.streak_days
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='group_members' AND column_name='streak_days'
  ) THEN
    _missing := array_append(_missing, 'COLUMN: group_members.streak_days');
  END IF;

  -- group_members.current_amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='group_members' AND column_name='current_amount'
  ) THEN
    _missing := array_append(_missing, 'COLUMN: group_members.current_amount');
  END IF;

  -- group_members.individual_goal
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='group_members' AND column_name='individual_goal'
  ) THEN
    _missing := array_append(_missing, 'COLUMN: group_members.individual_goal');
  END IF;

  -- group_members.total_points
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='group_members' AND column_name='total_points'
  ) THEN
    _missing := array_append(_missing, 'COLUMN: group_members.total_points');
  END IF;

  -- group_members.last_completed_period
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='group_members' AND column_name='last_completed_period'
  ) THEN
    _missing := array_append(_missing, 'COLUMN: group_members.last_completed_period');
  END IF;

  -- groups.invite_code
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='groups' AND column_name='invite_code'
  ) THEN
    _missing := array_append(_missing, 'COLUMN: groups.invite_code');
  END IF;

  -- groups.frequency
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='groups' AND column_name='frequency'
  ) THEN
    _missing := array_append(_missing, 'COLUMN: groups.frequency');
  END IF;

  -- groups.division_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='groups' AND column_name='division_type'
  ) THEN
    _missing := array_append(_missing, 'COLUMN: groups.division_type');
  END IF;

  -- ─── 4. RPC functions ─────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'complete_group') THEN
    _missing := array_append(_missing, 'FUNCTION: complete_group');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'archive_group') THEN
    _missing := array_append(_missing, 'FUNCTION: archive_group');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'reactivate_group') THEN
    _missing := array_append(_missing, 'FUNCTION: reactivate_group');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'remove_member') THEN
    _missing := array_append(_missing, 'FUNCTION: remove_member');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_member_after_contribution') THEN
    _warnings := array_append(_warnings, 'FUNCTION: update_member_after_contribution (may be named differently)');
  END IF;

  -- ─── 5. Storage bucket ────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'contribution-proofs') THEN
    _missing := array_append(_missing, 'STORAGE BUCKET: contribution-proofs');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    _warnings := array_append(_warnings, 'STORAGE BUCKET: avatars (needed for profile photos)');
  END IF;

  -- ─── 6. RLS enabled ──────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='group_messages' AND rowsecurity = true
  ) THEN
    _missing := array_append(_missing, 'RLS: group_messages (row security not enabled)');
  END IF;

  -- ─── 7. Policies on group_messages ────────────────────────────────────────
  SELECT count(*) INTO _count FROM pg_policies WHERE tablename = 'group_messages';
  IF _count < 3 THEN
    _missing := array_append(_missing, 'POLICIES: group_messages has ' || _count || '/3 policies (need SELECT, INSERT, DELETE)');
  END IF;

  -- ─── 8. Storage policies for contribution-proofs ──────────────────────────
  SELECT count(*) INTO _count FROM pg_policies
  WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname IN ('Users can upload proofs', 'Public can view proofs', 'Users can delete own proofs');
  IF _count < 3 THEN
    _warnings := array_append(_warnings, 'STORAGE POLICIES: contribution-proofs has ' || _count || '/3 policies');
  END IF;

  -- ─── 9. Index on group_messages ───────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_group_messages_group'
  ) THEN
    _missing := array_append(_missing, 'INDEX: idx_group_messages_group');
  END IF;

  -- ─── RESULTS ──────────────────────────────────────────────────────────────
  IF array_length(_missing, 1) IS NULL AND array_length(_warnings, 1) IS NULL THEN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '  ALL CHECKS PASSED - Schema is complete!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
  ELSE
    IF array_length(_missing, 1) IS NOT NULL THEN
      RAISE NOTICE '';
      RAISE NOTICE '============ MISSING (required) ============';
      FOR i IN 1..array_length(_missing, 1) LOOP
        RAISE NOTICE '  [X] %', _missing[i];
      END LOOP;
    END IF;

    IF array_length(_warnings, 1) IS NOT NULL THEN
      RAISE NOTICE '';
      RAISE NOTICE '============ WARNINGS (check) ==============';
      FOR i IN 1..array_length(_warnings, 1) LOOP
        RAISE NOTICE '  [?] %', _warnings[i];
      END LOOP;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '--------------------------------------------';
    RAISE NOTICE '  Missing: %  |  Warnings: %',
      COALESCE(array_length(_missing, 1), 0),
      COALESCE(array_length(_warnings, 1), 0);
    RAISE NOTICE '--------------------------------------------';
  END IF;

END $$;
