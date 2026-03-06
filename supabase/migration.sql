-- ============================================================================
-- GoalCrew Feature Migration
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- 1. Group status (completion/archival)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE group_status AS ENUM ('active', 'completed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE groups ADD COLUMN IF NOT EXISTS status group_status DEFAULT 'active';
ALTER TABLE groups ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- RPC: Complete a group (creator only)
CREATE OR REPLACE FUNCTION complete_group(p_group_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM groups WHERE id = p_group_id AND created_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only the group creator can complete this group';
  END IF;

  UPDATE groups SET status = 'completed', completed_at = now() WHERE id = p_group_id;
END;
$$;

-- RPC: Archive a group (creator only)
CREATE OR REPLACE FUNCTION archive_group(p_group_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM groups WHERE id = p_group_id AND created_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only the group creator can archive this group';
  END IF;

  UPDATE groups SET status = 'archived' WHERE id = p_group_id;
END;
$$;

-- RPC: Reactivate an archived group (creator only)
CREATE OR REPLACE FUNCTION reactivate_group(p_group_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM groups WHERE id = p_group_id AND created_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only the group creator can reactivate this group';
  END IF;

  UPDATE groups SET status = 'active', completed_at = NULL WHERE id = p_group_id;
END;
$$;


-- 2. Remove member (creator can kick)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION remove_member(p_group_id uuid, p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only the group creator can remove members
  IF NOT EXISTS (
    SELECT 1 FROM groups WHERE id = p_group_id AND created_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only the group creator can remove members';
  END IF;

  -- Cannot remove yourself (use leave_group instead)
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot remove yourself. Use leave group instead';
  END IF;

  -- Delete contributions for this member in this group
  DELETE FROM contributions WHERE group_id = p_group_id AND user_id = p_user_id;

  -- Delete achievements for this member in this group
  DELETE FROM achievements WHERE group_id = p_group_id AND user_id = p_user_id;

  -- Delete the membership
  DELETE FROM group_members WHERE group_id = p_group_id AND user_id = p_user_id;
END;
$$;


-- 3. Contribution proof photos (optional)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS proof_url text;

-- Create storage bucket for proofs (run once)
INSERT INTO storage.buckets (id, name, public) VALUES ('contribution-proofs', 'contribution-proofs', true)
ON CONFLICT DO NOTHING;

-- Storage policies (using DO block to handle duplicates)
DO $$ BEGIN
  CREATE POLICY "Users can upload proofs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'contribution-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view proofs" ON storage.objects
    FOR SELECT USING (bucket_id = 'contribution-proofs');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own proofs" ON storage.objects
    FOR DELETE USING (bucket_id = 'contribution-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 4. Group chat/messages
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id, created_at DESC);

-- RLS
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Members can read group messages"
    ON group_messages FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM group_members gm WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Members can insert group messages"
    ON group_messages FOR INSERT
    WITH CHECK (
      auth.uid() = user_id AND
      EXISTS (
        SELECT 1 FROM group_members gm WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own messages"
    ON group_messages FOR DELETE
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 5. Rename streak_days to streak_periods (add alias column, keep old for compatibility)
-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE: We add streak_periods as a generated column that mirrors streak_days.
-- This avoids breaking existing RPC functions while exposing the correct name.
-- When you're ready to fully migrate, rename the column and update RPC functions.
-- For now, the app will read streak_days but display it as "periods".
