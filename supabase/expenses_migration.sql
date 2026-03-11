-- ============================================================================
-- GoalCrew: Expense Splitting Migration
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- 1. Expenses table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  paid_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  receipt_url text,
  split_type text NOT NULL DEFAULT 'equal_all' CHECK (split_type IN ('equal_all', 'equal_selected', 'custom')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_group ON expenses(group_id, created_at DESC);

-- 2. Expense splits table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_expense_splits_expense ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user ON expense_splits(user_id);

-- 3. Expense settlements table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  paid_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paid_to uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expense_settlements_group ON expense_settlements(group_id);

-- 4. RLS Policies
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_settlements ENABLE ROW LEVEL SECURITY;

-- Expenses: members can read
DO $$ BEGIN
  CREATE POLICY "Members can read expenses"
    ON expenses FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM group_members gm WHERE gm.group_id = expenses.group_id AND gm.user_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Expenses: any group member can insert (paidBy may differ from auth user)
DO $$ BEGIN
  CREATE POLICY "Members can insert expenses"
    ON expenses FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM group_members gm WHERE gm.group_id = expenses.group_id AND gm.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Expenses: payer or group creator can delete
DO $$ BEGIN
  CREATE POLICY "Payer or creator can delete expenses"
    ON expenses FOR DELETE
    USING (
      paid_by = auth.uid() OR
      EXISTS (SELECT 1 FROM groups g WHERE g.id = expenses.group_id AND g.created_by = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Expense splits: members can read
DO $$ BEGIN
  CREATE POLICY "Members can read expense splits"
    ON expense_splits FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM expenses e
      JOIN group_members gm ON gm.group_id = e.group_id AND gm.user_id = auth.uid()
      WHERE e.id = expense_splits.expense_id
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Expense splits: members can insert (via expense creation)
DO $$ BEGIN
  CREATE POLICY "Members can insert expense splits"
    ON expense_splits FOR INSERT
    WITH CHECK (EXISTS (
      SELECT 1 FROM expenses e
      JOIN group_members gm ON gm.group_id = e.group_id AND gm.user_id = auth.uid()
      WHERE e.id = expense_splits.expense_id
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Settlements: members can read
DO $$ BEGIN
  CREATE POLICY "Members can read settlements"
    ON expense_settlements FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM group_members gm WHERE gm.group_id = expense_settlements.group_id AND gm.user_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Settlements: payer can insert
DO $$ BEGIN
  CREATE POLICY "Payer can insert settlements"
    ON expense_settlements FOR INSERT
    WITH CHECK (
      auth.uid() = paid_by AND
      EXISTS (
        SELECT 1 FROM group_members gm WHERE gm.group_id = expense_settlements.group_id AND gm.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Settlements: payer can delete own
DO $$ BEGIN
  CREATE POLICY "Payer can delete own settlements"
    ON expense_settlements FOR DELETE
    USING (paid_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Storage bucket for receipts
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('expense-receipts', 'expense-receipts', true)
ON CONFLICT DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Users can upload receipts" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view receipts" ON storage.objects
    FOR SELECT USING (bucket_id = 'expense-receipts');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own receipts" ON storage.objects
    FOR DELETE USING (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Enable realtime for expenses tables
-- ─────────────────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE expense_settlements;
