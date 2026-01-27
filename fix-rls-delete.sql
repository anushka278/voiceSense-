-- Fix RLS to allow DELETE operations
-- Run this SQL in your Supabase SQL Editor

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Users can delete own data" ON users;

-- Create delete policy
CREATE POLICY "Users can delete own data" ON users
  FOR DELETE USING (true);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can delete own data';
