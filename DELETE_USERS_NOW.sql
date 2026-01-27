-- COPY AND PASTE THIS INTO SUPABASE SQL EDITOR
-- This will fix RLS and delete all users

-- Step 1: Add DELETE policy (if it doesn't exist)
DROP POLICY IF EXISTS "Users can delete own data" ON users;
CREATE POLICY "Users can delete own data" ON users
  FOR DELETE USING (true);

-- Step 2: Delete all users
DELETE FROM users;

-- Step 3: Verify (should return 0 rows)
SELECT COUNT(*) as remaining_users FROM users;
