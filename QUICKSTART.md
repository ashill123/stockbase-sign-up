# Quick Start Checklist

Follow these steps to get your waitlist fully operational.

## ✅ Step 1: Set Up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) → Sign up
2. Create new project: `stockbase-waitlist`
3. Go to **SQL Editor** → New Query
4. Copy/paste entire `supabase-schema.sql` → Run
5. Go to **Settings** → **API**
   - Copy **Project URL** → Add to `.env.local` as `SUPABASE_URL`
   - Copy **service_role key** → Add to `.env.local` as `SUPABASE_SERVICE_KEY`

## ✅ Step 2: Set Up Resend (3 minutes)

1. Go to [resend.com](https://resend.com) → Sign up
2. Go to **API Keys** → Create API Key
3. Copy key → Add to `.env.local` as `RESEND_API_KEY`
4. **(Optional for testing)** For production:
   - Go to **Domains** → Add your domain
   - Update `api/submit-waitlist.ts` line 78 with your domain

## ✅ Step 3: Set Up PostHog (3 minutes)

1. Go to [posthog.com/signup](https://posthog.com/signup)
2. Create project: `Stockbase Waitlist`
3. Go to **Project Settings** (gear icon)
4. Copy **Project API Key** → Add to `.env.local` as `VITE_POSTHOG_API_KEY`
5. Note the **Host** (usually `https://us.i.posthog.com`) → Add as `VITE_POSTHOG_HOST`

## ✅ Step 4: Gemini API (Already Have)

You should already have this in your `.env.local`:
```bash
API_KEY=your_existing_gemini_key
```

## ✅ Step 5: Deploy to Vercel (2 minutes)

```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel deploy --prod
```

## ✅ Step 6: Add Environment Variables to Vercel

**Option A: Via Dashboard (Recommended)**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. **Settings** → **Environment Variables**
4. Add all 6 variables from your `.env.local`:
   - `API_KEY`
   - `VITE_POSTHOG_API_KEY`
   - `VITE_POSTHOG_HOST`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `RESEND_API_KEY`
5. Select all environments (Production, Preview, Development)
6. Save

**Option B: Via CLI**
```bash
vercel env add API_KEY
# Paste value, select Production
# Repeat for all 6 variables
```

## ✅ Step 7: Redeploy

```bash
vercel deploy --prod
```

## ✅ Step 8: Test Everything

### Test Form Submission
```bash
curl -X POST https://your-site.vercel.app/api/submit-waitlist \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"your@email.com"}'
```

### Verify in Supabase
Go to Supabase → **Table Editor** → `waitlist` → See your test entry

### Check Email
Check your inbox for the welcome email

### Test Analytics
1. Visit your site
2. Open PostHog → **Live Events**
3. Click around and watch events appear

---

## 🎉 You're Done!

Your waitlist is now fully functional with:
- ✅ Real database storage
- ✅ Email confirmations
- ✅ Analytics tracking
- ✅ Production deployment

## 📊 Monitor Your Waitlist

**Supabase (Database)**
```sql
-- See all signups
SELECT * FROM waitlist ORDER BY created_at DESC;

-- Get stats
SELECT * FROM waitlist_stats;
```

**PostHog (Analytics)**
- Dashboard → Live Events (real-time)
- Create conversion funnel: modal_opened → form_submitted → signup_success

**Resend (Emails)**
- Dashboard → Emails → See all sent emails and delivery status

---

## 🚨 Troubleshooting

**Form doesn't submit:**
1. Check browser console for errors
2. Verify Vercel environment variables are set
3. Check Vercel function logs: Dashboard → Functions → submit-waitlist

**No email received:**
1. Check spam folder
2. For testing, use `onboarding@resend.dev` as sender (in `api/submit-waitlist.ts`)
3. Check Resend dashboard for delivery status

**Analytics not working:**
1. Ensure `VITE_POSTHOG_API_KEY` has the `VITE_` prefix
2. Check browser console for PostHog errors
3. Disable ad blockers

---

## 📚 Need More Help?

See [SETUP.md](SETUP.md) for detailed documentation.

---

**Total Setup Time: ~15 minutes**
