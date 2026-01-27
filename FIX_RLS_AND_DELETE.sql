-- ============================================
-- COPY THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- ============================================
-- This will:
-- 1. Add the missing DELETE policy for RLS
-- 2. Delete all users
-- 3. Verify deletion

-- Step 1: Add DELETE policy (REQUIRED - RLS is blocking deletions)
DROP POLICY IF EXISTS "Users can delete own data" ON users;
CREATE POLICY "Users can delete own data" ON users
  FOR DELETE USING (true);

-- Step 2: Delete all users
DELETE FROM users;

-- Step 3: Verify deletion (should return 0)
SELECT 
  COUNT(*) as remaining_users,
  array_agg(username) as usernames
FROM users;

-- If the count is 0, deletion was successful!
-- If the count is > 0, there may be a foreign key constraint issue
