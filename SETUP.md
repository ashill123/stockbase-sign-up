# Stockbase Waitlist Setup Guide

Complete setup instructions for analytics, email confirmation, and waitlist data collection.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Supabase Database Setup](#1-supabase-database-setup)
3. [Resend Email Setup](#2-resend-email-setup)
4. [PostHog Analytics Setup](#3-posthog-analytics-setup)
5. [Environment Variables](#4-environment-variables)
6. [Vercel Deployment](#5-vercel-deployment)
7. [Testing](#6-testing)
8. [Monitoring](#7-monitoring)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables template
cp .env.example .env.local

# 3. Follow setup instructions below to get API keys
# 4. Fill in .env.local with your keys
# 5. Set up Supabase database (run SQL schema)
# 6. Deploy to Vercel
vercel deploy
```

---

## 1. Supabase Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
   - **Name:** `stockbase-waitlist`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is sufficient

### Step 2: Run Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this repo
4. Paste into the SQL editor
5. Click "Run" to execute

This will create:
- `waitlist` table with proper columns and indexes
- Row Level Security (RLS) policies
- Analytics views for tracking signup metrics
- Automatic timestamp triggers
- `chat_sessions` and `chat_messages` tables for storing chat conversations

### Step 3: Get API Credentials

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** → `SUPABASE_URL` in `.env.local`
   - **Project API keys** → **service_role** (secret) → `SUPABASE_SERVICE_KEY` in `.env.local`

⚠️ **Important:** Use the `service_role` key (NOT the `anon` key) for server-side operations.

### Step 4: Verify Setup

```bash
# Test query in Supabase SQL Editor:
SELECT * FROM waitlist;
SELECT * FROM waitlist_stats;
```

---

## 2. Resend Email Setup

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email address

### Step 2: Add Your Domain

1. Go to **Domains** in the Resend dashboard
2. Click "Add Domain"
3. Enter your domain (e.g., `stockbase.com`)
4. Add the DNS records to your domain provider:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT)

**For testing without a custom domain:**
- Resend allows sending to your own email address
- You can use `onboarding@resend.dev` as the sender for testing
- Production requires a verified domain

### Step 3: Get API Key

1. Go to **API Keys** in Resend dashboard
2. Click "Create API Key"
   - **Name:** `Stockbase Production`
   - **Permission:** Full Access
3. Copy the key → `RESEND_API_KEY` in `.env.local`

### Step 4: Update Email Template

Edit `api/submit-waitlist.ts` line 78:

```typescript
from: 'Stockbase <noreply@yourdomain.com>', // Change to your verified domain
```

### Step 5: Test Email Sending

```bash
# After deployment, test with:
curl -X POST https://your-site.vercel.app/api/submit-waitlist \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"your@email.com"}'
```

---

## 3. PostHog Analytics Setup

### Step 1: Create PostHog Account

1. Go to [posthog.com](https://posthog.com/signup)
2. Sign up (free tier: 1M events/month)
3. Choose **Cloud** (recommended) or self-hosted

### Step 2: Create Project

1. After signup, you'll be prompted to create a project
   - **Name:** `Stockbase Waitlist`
   - **Company Name:** Your company
2. Click "Create Project"

### Step 3: Get API Key

1. Go to **Project Settings** (gear icon)
2. Copy **Project API Key** → `VITE_POSTHOG_API_KEY` in `.env.local`
3. Note the **Host URL** (usually `https://us.i.posthog.com` or `https://eu.i.posthog.com`)

### Step 4: Configure Analytics Events

PostHog will automatically track:
- Page views
- Modal opens/closes
- Form submissions
- Chat interactions
- CTA clicks
- Conversion events

### Step 5: Set Up Dashboards (Optional)

Create a dashboard in PostHog:

**Key Metrics to Track:**
- Total waitlist signups (count of `waitlist_signup_success`)
- Conversion rate (signups / modal_opened)
- Chat engagement (count of `chat_message_sent`)
- Drop-off points (where users close without converting)
- Time to conversion

**Recommended Insights:**
1. Funnel: `modal_opened` → `waitlist_form_started` → `waitlist_signup_success`
2. Trend: Signups over time
3. Retention: Users who return to chat mode
4. Session recordings (enable in Project Settings)

---

## 4. Environment Variables

### Local Development (`.env.local`)

```bash
# Copy from .env.example
cp .env.example .env.local
```

Fill in all values from the setup steps above.

### Vercel Production Environment

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - Variable name (e.g., `SUPABASE_URL`)
   - Value (paste your actual key)
   - Environment: Select **Production**, **Preview**, **Development**
4. Click "Save"

**Required Variables:**
- `GEMINI_API_KEY` (Gemini, server-side)
- `VITE_GA_MEASUREMENT_ID` (Google Analytics 4)
- `SUPABASE_URL` (Supabase)
- `SUPABASE_SERVICE_KEY` (Supabase)
- `RESEND_API_KEY` (Resend)

---

## 5. Vercel Deployment

### Initial Deploy

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel deploy --prod
```

### Set Environment Variables in Vercel

**Option 1: Via CLI**
```bash
vercel env add SUPABASE_URL
# Paste your value when prompted
# Repeat for all variables
```

**Option 2: Via Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all variables from `.env.local`

### Redeploy After Setting Env Vars

```bash
vercel deploy --prod
```

---

## 6. Testing

### Test Form Submission

```bash
curl -X POST https://your-site.vercel.app/api/submit-waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully added to waitlist",
  "data": {
    "id": "uuid-here",
    "email": "john@example.com"
  }
}
```

### Test Analytics

1. Open your deployed site
2. Open browser DevTools → Console
3. Interact with the site:
   - Open modal
   - Fill form
   - Send chat message
   - Submit form
4. Go to PostHog dashboard → **Live Events**
5. Verify events are being tracked

### Test Email Delivery

1. Submit the form with your email
2. Check your inbox (including spam folder)
3. Verify email formatting and content
4. Check Resend dashboard → **Emails** for delivery status

### Verify Database

```sql
-- Run in Supabase SQL Editor
SELECT * FROM waitlist ORDER BY created_at DESC LIMIT 10;
SELECT * FROM waitlist_stats;
```

---

## 7. Monitoring

### Supabase Monitoring

**Database Health:**
- Dashboard → **Database** → View active connections, query performance
- **Table Editor** → View waitlist entries in real-time

**Analytics View:**
```sql
SELECT * FROM waitlist_stats;
```

Returns:
- Total signups
- Signups in last 24h, 7d, 30d
- Status breakdown (pending, invited, active)
- First and latest signup timestamps

### Resend Monitoring

**Email Delivery:**
- Dashboard → **Emails** → View sent emails
- Click email → See delivery status, opens, clicks (if tracked)

**Quota Usage:**
- Dashboard → Shows sent emails vs. plan limits
- Free tier: 100/day, 3000/month

### PostHog Monitoring

**Real-Time Events:**
- Dashboard → **Live Events** → See events as they happen

**Conversion Funnel:**
```
modal_opened → form_started → form_submitted → signup_success
```

**Key Metrics to Watch:**
- Conversion rate (signups / total visitors)
- Average time on page
- Chat engagement rate
- Drop-off rate in form

### Vercel Monitoring

**Deployment Status:**
- Dashboard → **Deployments** → View build logs

**Function Logs:**
- Dashboard → **Functions** → View API logs
- Look for errors in `submit-waitlist` function

**Analytics:**
- Dashboard → **Analytics** → Page views, top pages, devices

---

## 8. Common Issues

### Form Submission Fails

**Check:**
1. Vercel environment variables are set correctly
2. Supabase RLS policies allow service_role access
3. API endpoint is accessible (no CORS errors)
4. Check Vercel function logs for errors

### Emails Not Sending

**Check:**
1. Resend API key is valid
2. Domain is verified in Resend
3. `from` email address uses verified domain
4. Check Resend dashboard for bounce/error logs

### Analytics Not Tracking

**Check:**
1. PostHog API key is correct and has `VITE_` prefix
2. Browser console for PostHog errors
3. Ad blockers may block PostHog (test in incognito)
4. PostHog project is active

### Database Connection Issues

**Check:**
1. Supabase URL is correct
2. Using `service_role` key (not `anon` key)
3. Database is not paused (Supabase free tier pauses after 7 days of inactivity)
4. RLS policies are configured correctly

---

## 9. Next Steps

### Recommended Improvements

1. **Add Webhook to Slack/Discord** when new signups occur
2. **Set up automated email sequences** with Resend
3. **Create admin dashboard** to view waitlist entries
4. **Add referral tracking** (where signups came from)
5. **Implement A/B testing** with PostHog feature flags
6. **Add email verification** before adding to waitlist
7. **Set up automated backups** of Supabase database

### Scaling Considerations

- **Rate Limiting:** Add rate limiting to API endpoint
- **Email Queue:** Use background jobs for email sending
- **Database Indexing:** Add indexes if query performance degrades
- **CDN:** Use Vercel Edge for faster global delivery

---

## 10. Support

**Documentation:**
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
- [PostHog Docs](https://posthog.com/docs)
- [Vercel Docs](https://vercel.com/docs)

**Issues:**
- Report bugs on GitHub: [your-repo-url]/issues

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Using `service_role` key only in server-side API routes
- [ ] Supabase RLS policies are enabled
- [ ] Email addresses are validated before insertion
- [ ] Resend domain is verified (SPF, DKIM, DMARC)
- [ ] PostHog API key has `VITE_` prefix for client-side use
- [ ] No API keys committed to version control
- [ ] Rate limiting added to API endpoints (recommended)

---

✅ **Setup Complete!** Your waitlist is now production-ready with analytics, email confirmation, and data storage.
