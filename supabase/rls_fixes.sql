-- ============================================================================
-- GoalCrew: RLS Policy Fixes
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- ─── 1. EXPENSES: Add UPDATE policy ─────────────────────────────────────────
-- Allows the payer or group creator to update an expense
DROP POLICY IF EXISTS "Payer or creator can update expenses" ON expenses;
CREATE POLICY "Payer or creator can update expenses"
  ON expenses FOR UPDATE
  USING (
    paid_by = auth.uid() OR
    EXISTS (SELECT 1 FROM groups g WHERE g.id = expenses.group_id AND g.created_by = auth.uid())
  )
  WITH CHECK (
    paid_by = auth.uid() OR
    EXISTS (SELECT 1 FROM groups g WHERE g.id = expenses.group_id AND g.created_by = auth.uid())
  );

-- ─── 2. EXPENSE_SPLITS: Add DELETE policy ───────────────────────────────────
-- Needed so cascade and manual cleanup work via the expense owner
DROP POLICY IF EXISTS "Expense owner can delete splits" ON expense_splits;
CREATE POLICY "Expense owner can delete splits"
  ON expense_splits FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM expenses e
    WHERE e.id = expense_splits.expense_id
    AND (e.paid_by = auth.uid() OR EXISTS (
      SELECT 1 FROM groups g WHERE g.id = e.group_id AND g.created_by = auth.uid()
    ))
  ));

-- ─── 3. EXPENSE_SPLITS: Add UPDATE policy ───────────────────────────────────
DROP POLICY IF EXISTS "Expense owner can update splits" ON expense_splits;
CREATE POLICY "Expense owner can update splits"
  ON expense_splits FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM expenses e
    JOIN group_members gm ON gm.group_id = e.group_id AND gm.user_id = auth.uid()
    WHERE e.id = expense_splits.expense_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM expenses e
    JOIN group_members gm ON gm.group_id = e.group_id AND gm.user_id = auth.uid()
    WHERE e.id = expense_splits.expense_id
  ));

-- ─── 4. CONTRIBUTIONS: Add UPDATE & DELETE policies ─────────────────────────
-- These complement the existing SECURITY DEFINER RPCs
DROP POLICY IF EXISTS "Author can update own contributions" ON contributions;
CREATE POLICY "Author can update own contributions"
  ON contributions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Author can delete own contributions" ON contributions;
CREATE POLICY "Author can delete own contributions"
  ON contributions FOR DELETE
  USING (auth.uid() = user_id);

-- ─── 5. EXPENSE_SETTLEMENTS: Add UPDATE policy ─────────────────────────────
DROP POLICY IF EXISTS "Payer can update own settlements" ON expense_settlements;
CREATE POLICY "Payer can update own settlements"
  ON expense_settlements FOR UPDATE
  USING (paid_by = auth.uid())
  WITH CHECK (paid_by = auth.uid());

-- ─── 6. ATOMIC EXPENSE + SPLITS RPC ─────────────────────────────────────────
-- Inserts expense and splits in a single transaction
CREATE OR REPLACE FUNCTION add_expense_with_splits(
  p_group_id uuid,
  p_paid_by uuid,
  p_amount numeric,
  p_description text,
  p_split_type text,
  p_receipt_url text DEFAULT NULL,
  p_splits jsonb DEFAULT '[]'::jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_expense_id uuid;
  v_split jsonb;
BEGIN
  -- Verify caller is a group member
  IF NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this group';
  END IF;

  -- Verify paid_by is a group member
  IF NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id AND user_id = p_paid_by
  ) THEN
    RAISE EXCEPTION 'Payer is not a member of this group';
  END IF;

  -- Insert expense
  INSERT INTO expenses (group_id, paid_by, amount, description, split_type, receipt_url)
  VALUES (p_group_id, p_paid_by, p_amount, p_description, p_split_type, p_receipt_url)
  RETURNING id INTO v_expense_id;

  -- Insert splits
  FOR v_split IN SELECT * FROM jsonb_array_elements(p_splits)
  LOOP
    INSERT INTO expense_splits (expense_id, user_id, amount)
    VALUES (
      v_expense_id,
      (v_split->>'user_id')::uuid,
      (v_split->>'amount')::numeric
    );
  END LOOP;

  RETURN v_expense_id;
END;
$$;
