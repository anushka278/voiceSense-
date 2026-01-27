# 🚨 QUICK FIX: Delete All Users

## The Problem
Row Level Security (RLS) is blocking DELETE operations. You need to add a DELETE policy first.

## Solution: Run This SQL in Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Click "SQL Editor"** (left sidebar)
4. **Copy and paste this SQL**:

```sql
-- Add DELETE policy
DROP POLICY IF EXISTS "Users can delete own data" ON users;
CREATE POLICY "Users can delete own data" ON users
  FOR DELETE USING (true);

-- Delete all users
DELETE FROM users;
```

5. **Click "Run"**
6. **Verify**: Run `SELECT COUNT(*) FROM users;` - should return 0

## Then Clear Browser Storage

Open browser console (F12) and run:
```javascript
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cleared!');
```

## After This
Try signing up with "meghana076" again - it should work!
