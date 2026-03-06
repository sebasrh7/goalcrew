-- ============================================================================
-- GoalCrew Schema Verification (TABLE OUTPUT)
-- Run this in Supabase SQL Editor - results appear in the Results tab
-- ============================================================================

SELECT item, status FROM (

  -- 1. Core tables
  SELECT 'TABLE: users' AS item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users')
    THEN 'OK' ELSE 'MISSING' END AS status
  UNION ALL
  SELECT 'TABLE: groups',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='groups')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'TABLE: group_members',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='group_members')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'TABLE: contributions',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contributions')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'TABLE: achievements',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='achievements')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'TABLE: group_messages',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='group_messages')
    THEN 'OK' ELSE 'MISSING' END

  -- 2. Enum
  UNION ALL
  SELECT 'ENUM: group_status',
    CASE WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'group_status')
    THEN 'OK' ELSE 'MISSING' END

  -- 3. Columns
  UNION ALL
  SELECT 'COLUMN: groups.status',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='groups' AND column_name='status')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'COLUMN: groups.completed_at',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='groups' AND column_name='completed_at')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'COLUMN: groups.invite_code',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='groups' AND column_name='invite_code')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'COLUMN: groups.frequency',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='groups' AND column_name='frequency')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'COLUMN: groups.division_type',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='groups' AND column_name='division_type')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'COLUMN: contributions.proof_url',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contributions' AND column_name='proof_url')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'COLUMN: group_members.streak_days',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='group_members' AND column_name='streak_days')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'COLUMN: group_members.current_amount',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='group_members' AND column_name='current_amount')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'COLUMN: group_members.individual_goal',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='group_members' AND column_name='individual_goal')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'COLUMN: group_members.total_points',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='group_members' AND column_name='total_points')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'COLUMN: group_members.last_completed_period',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='group_members' AND column_name='last_completed_period')
    THEN 'OK' ELSE 'MISSING' END

  -- 4. RPC functions
  UNION ALL
  SELECT 'FUNCTION: complete_group',
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'complete_group')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'FUNCTION: archive_group',
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'archive_group')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'FUNCTION: reactivate_group',
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'reactivate_group')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'FUNCTION: remove_member',
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'remove_member')
    THEN 'OK' ELSE 'MISSING' END

  -- 5. Storage buckets
  UNION ALL
  SELECT 'STORAGE: contribution-proofs',
    CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'contribution-proofs')
    THEN 'OK' ELSE 'MISSING' END
  UNION ALL
  SELECT 'STORAGE: avatars',
    CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars')
    THEN 'OK (optional)' ELSE 'MISSING (optional)' END

  -- 6. RLS on group_messages
  UNION ALL
  SELECT 'RLS: group_messages',
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='group_messages' AND rowsecurity = true)
    THEN 'OK' ELSE 'MISSING' END

  -- 7. Policies on group_messages
  UNION ALL
  SELECT 'POLICIES: group_messages (need 3)',
    (SELECT count(*)::text || '/3' FROM pg_policies WHERE tablename = 'group_messages')

  -- 8. Storage policies
  UNION ALL
  SELECT 'POLICIES: contribution-proofs storage (need 3)',
    (SELECT count(*)::text || '/3' FROM pg_policies
     WHERE tablename = 'objects' AND schemaname = 'storage'
       AND policyname IN ('Users can upload proofs', 'Public can view proofs', 'Users can delete own proofs'))

  -- 9. Index
  UNION ALL
  SELECT 'INDEX: idx_group_messages_group',
    CASE WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_group_messages_group')
    THEN 'OK' ELSE 'MISSING' END

) checks
ORDER BY
  CASE WHEN status = 'MISSING' THEN 0
       WHEN status LIKE 'MISSING%' THEN 1
       WHEN status NOT IN ('OK', 'OK (optional)') THEN 2
       ELSE 3 END,
  item;
