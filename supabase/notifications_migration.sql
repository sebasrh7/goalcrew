-- ============================================================================
-- Push Notifications Migration
-- Adds new notification preference columns to user_settings
-- and ensures push_tokens table exists
-- ============================================================================

-- 1. Add new notification category columns to user_settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS chat_notifications boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS expense_notifications boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS group_notifications boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS contribution_notifications boolean DEFAULT true;

-- 2. Ensure push_tokens table exists with proper structure
CREATE TABLE IF NOT EXISTS push_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- 3. Enable RLS on push_tokens
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own tokens
CREATE POLICY IF NOT EXISTS "Users can insert own tokens"
  ON push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own tokens"
  ON push_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can read own tokens"
  ON push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own tokens"
  ON push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can read all tokens (for edge function)
-- Note: service_role bypasses RLS by default, so no policy needed

-- 4. Index for efficient token lookups by user
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);

-- 5. Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_settings'
  AND column_name IN ('chat_notifications', 'expense_notifications', 'group_notifications', 'contribution_notifications')
ORDER BY column_name;
