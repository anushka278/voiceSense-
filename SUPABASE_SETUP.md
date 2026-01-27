# Supabase Setup Guide

This guide will help you set up Supabase for the Sage app to replace localStorage with cloud database storage.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: `sage-app` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project"
6. Wait 2-3 minutes for the project to be set up

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

Copy both of these - you'll need them in the next step.

## Step 3: Set Up Your Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file `supabase/schema.sql` from this project
4. Copy the entire contents
5. Paste it into the SQL Editor
6. Click "Run" (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

This creates all the necessary tables, indexes, and security policies.

## Step 4: Add Supabase Credentials to Your Project

1. In your project root directory, open or create `.env.local`
2. Add these lines:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini API (if you're using it)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

Replace:
- `https://your-project-id.supabase.co` with your **Project URL**
- `your-anon-key-here` with your **anon/public key**

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NzE5MjEyMCwiZXhwIjoxOTYyNzY4MTIwfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

## Step 5: Restart Your Development Server

After adding the credentials:

1. Stop your development server (Ctrl+C or Cmd+C)
2. Start it again: `npm run dev`

## Step 6: Verify Setup

1. Open your app in the browser
2. Try signing up a new account
3. Check your Supabase dashboard → **Table Editor** → **users** table
4. You should see your new user account!

## Database Tables Created

The schema creates these tables:

- **users** - User accounts and profiles
- **talk_sessions** - Conversation sessions with Sage
- **health_cards** - Health information extracted from conversations
- **speech_analyses** - Speech analysis data
- **game_results** - Cognitive game results
- **insights** - Generated insights
- **family_requests** - Family connection requests

## Security Notes

⚠️ **Important Security Information:**

1. **Password Storage**: Currently using simple Base64 encoding (NOT secure)
   - **For production**: Migrate to Supabase Auth for proper password hashing
   - The current implementation is for development only

2. **Row Level Security (RLS)**: Currently allows all operations
   - **For production**: Add proper RLS policies based on user authentication
   - Consider using Supabase Auth instead of custom username/password

3. **API Keys**: Never commit `.env.local` to git (already in `.gitignore`)

## Troubleshooting

**"Supabase credentials are not set" warning:**
- Make sure `.env.local` exists in the root directory
- Verify the variable names are exactly `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after adding credentials

**Database errors:**
- Make sure you ran the SQL schema in the Supabase SQL Editor
- Check that all tables were created (go to Table Editor in Supabase dashboard)

**Connection errors:**
- Verify your Project URL is correct
- Check that your Supabase project is active (not paused)
- Ensure your anon key is correct

## Next Steps

1. ✅ Database is set up
2. ✅ Credentials are configured
3. ⏭️ Update the store to use Supabase (code changes needed)
4. ⏭️ Test data persistence
5. ⏭️ Migrate existing localStorage data (optional)

## Migration from localStorage

If you have existing users in localStorage, you can:
1. Export data from localStorage
2. Import into Supabase using the Supabase dashboard or API
3. Or let users re-register (simpler for development)

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
