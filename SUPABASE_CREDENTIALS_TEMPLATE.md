# Supabase Credentials Template

Copy this template and fill in your actual Supabase credentials.

## Your Supabase Credentials

After creating your Supabase project, add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

## Where to Find These Values

1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon) → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Example .env.local File

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NzE5MjEyMCwiZXhwIjoxOTYyNzY4MTIwfQ.abcdefghijklmnopqrstuvwxyz1234567890

# Gemini API (optional)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

## Important Notes

- ⚠️ Never commit `.env.local` to git (it's already in `.gitignore`)
- ✅ Restart your dev server after adding credentials
- ✅ Make sure there are no spaces around the `=` sign
- ✅ Don't use quotes around the values
