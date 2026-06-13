# MindBridge — Supabase Setup Guide

Step-by-step instructions to get your database running.

---

## Step 1: Create your Supabase project

1. Go to https://supabase.com and sign in
2. Click **New Project**
3. Settings:
   - **Name**: MindBridge
   - **Database Password**: generate a strong one, save it
   - **Region**: `ap-south-1` (Asia Pacific - Mumbai) ← critical for DPDPA compliance
   - **Plan**: Free tier is fine for dev
4. Wait ~2 minutes for the project to provision

---

## Step 2: Get your credentials

In your Supabase project dashboard:

1. Go to **Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`
3. Paste these into your `.env.local` file

---

## Step 3: Run the migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `supabase/migrations/001_initial_schema.sql` from this project
4. Paste the entire contents into the SQL Editor
5. Click **Run** (Ctrl+Enter)
6. You should see: `Success. No rows returned`
7. Check **Table Editor** — you should see 6 tables: users, therapists, checkins, checkin_messages, mood_entries, bookings

---

## Step 4: Run the seed data

1. In SQL Editor, click **New Query**
2. Open `supabase/seed/seed.sql`
3. Paste and click **Run**
4. You should see a result table with 5 therapists listed
5. Check **Table Editor → therapists** to confirm

---

## Step 5: Configure Auth

In Supabase dashboard → **Authentication → Settings**:

1. **Site URL**: `http://localhost:3000`
2. **Redirect URLs** — add:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```
3. **Email Auth**: leave enabled (no email confirmations needed for dev)
4. Optional — **Google OAuth**:
   - Go to Authentication → Providers → Google
   - You need a Google Cloud Console project with OAuth credentials
   - Add `https://your-project.supabase.co/auth/v1/callback` as an authorized redirect URI

---

## Step 6: Create the auth callback route

Create `app/auth/callback/route.ts` — Supabase needs this to handle OAuth redirects.

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
}
```

---

## Step 7: Verify everything works

Run these queries in SQL Editor to verify your setup:

```sql
-- Should return 6 tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Should return 5 therapists
SELECT full_name, session_fee_inr/100 AS fee_rupees, average_rating
FROM therapists ORDER BY average_rating DESC;

-- Should return 4 views
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public';

-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- All should show rowsecurity = true
```

---

## Step 8: Set yourself as admin (optional, for later)

After you sign up in the app:

1. Go to **Authentication → Users** in Supabase dashboard
2. Copy your user UUID
3. Add it to `.env.local`:
   ```
   ADMIN_USER_IDS=your-uuid-here
   ```

---

## Quick reference — table structure

| Table | Rows after seed | Purpose |
|---|---|---|
| `users` | 0 (auto-created on signup) | Consumer profiles |
| `therapists` | 5 | Service providers |
| `checkins` | 0 | AI assessment sessions |
| `checkin_messages` | 0 | Conversation history |
| `mood_entries` | 0 | Daily mood logs |
| `bookings` | 0 | Session bookings |

---

## Troubleshooting

**"relation auth.users does not exist"**
→ Make sure you're running the SQL in your Supabase project's SQL Editor, not a local Postgres instance.

**"RLS policy violation" errors in the app**
→ Check that your `.env.local` has the correct anon key (not the service role key) for `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Therapists not showing in the app**
→ The RLS policy on therapists only shows `verified` therapists. The seed sets `verification_status = 'verified'`. If you're not seeing them, run: `SELECT id, full_name, verification_status, is_active FROM therapists;`

**"duplicate key" error when running seed**
→ The therapists already exist. Run: `DELETE FROM therapists;` then run seed again.
