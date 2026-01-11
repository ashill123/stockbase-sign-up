# Google Analytics 4 Setup Guide

Complete guide to setting up Google Analytics 4 (GA4) for your Stockbase waitlist.

---

## 📊 Step 1: Create Google Analytics Account (5 minutes)

### 1.1 Sign Up for Google Analytics

1. Go to [analytics.google.com](https://analytics.google.com/)
2. Click **"Start measuring"** or **"Sign in"** if you have a Google account
3. Sign in with your Google account

### 1.2 Create Account

1. Click **"Admin"** (gear icon in bottom left)
2. Click **"Create Account"**
3. **Account Name:** `Stockbase` (or your company name)
4. Check all the data sharing settings you're comfortable with
5. Click **"Next"**

### 1.3 Create Property

1. **Property Name:** `Stockbase Waitlist`
2. **Reporting Time Zone:** Select your timezone
3. **Currency:** Select your currency (USD)
4. Click **"Next"**

### 1.4 Business Information

1. **Industry Category:** Select closest match (e.g., "Technology")
2. **Business Size:** Select your size
3. Click **"Next"**

### 1.5 Business Objectives

1. Select relevant objectives:
   - ✅ **Examine user behavior**
   - ✅ **Measure advertising ROI**
   - ✅ **Generate leads**
2. Click **"Create"**
3. Accept the **Terms of Service**

---

## 🔧 Step 2: Set Up Data Stream

### 2.1 Create Web Data Stream

1. Select **"Web"** platform
2. **Website URL:** `https://your-domain.vercel.app` (your Vercel URL)
3. **Stream Name:** `Stockbase Waitlist - Production`
4. ✅ Enable **"Enhanced measurement"** (recommended)
5. Click **"Create stream"**

### 2.2 Get Your Measurement ID

After creating the stream, you'll see:

```
Measurement ID: G-XXXXXXXXXX
```

**Copy this ID** - you'll need it for `.env.local`

---

## 🔑 Step 3: Add Measurement ID to Your Project

### 3.1 Update `.env.local`

Add the Measurement ID to your `.env.local` file:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### 3.2 Restart Development Server

```bash
npm run dev
```

---

## ✅ Step 4: Verify Tracking is Working

### 4.1 Real-Time Reports

1. In Google Analytics, go to **Reports** → **Realtime**
2. Open your website in a new tab
3. You should see yourself as an active user within ~10 seconds
4. Interact with the site (open modal, click buttons)
5. Watch events appear in real-time

### 4.2 Debug View (Optional)

For detailed debugging:

1. In GA4, go to **Admin** → **Data Streams** → Your stream
2. Scroll down to **"Enhanced measurement"**
3. Click gear icon → **"Show advanced settings"**
4. Enable **"Debug mode"** temporarily

---

## 📈 Step 5: Configure Events & Conversions

### 5.1 Mark Key Events as Conversions

1. Go to **Admin** → **Events**
2. Wait 24-48 hours for events to appear (or generate some by using the site)
3. Mark these as **Conversions** by toggling the switch:
   - ✅ `purchase` (waitlist signup success)
   - ✅ `generate_lead` (form submission)
   - ✅ `begin_checkout` (form started)

### 5.2 Create Custom Events (Optional)

For more granular tracking, create custom events:

1. Go to **Admin** → **Events** → **Create Event**
2. Example: Track users who reach the chat limit
   - **Event name:** `freemium_conversion`
   - **Matching conditions:** `chat_limit_reached` event occurs
   - **Parameter modifications:** Add `conversion_opportunity = true`

---

## 🎯 Step 6: Set Up Goals & Funnels

### 6.1 Create Conversion Funnel

1. Go to **Explore** → **Funnel exploration**
2. Create funnel:
   ```
   Step 1: page_view (Landing)
   Step 2: modal_opened (Engagement)
   Step 3: generate_lead (Form Submission)
   Step 4: purchase (Signup Success)
   ```
3. Save as **"Waitlist Conversion Funnel"**

### 6.2 Create Custom Reports

**Report 1: Engagement Overview**
1. **Explore** → **Free form**
2. Add metrics:
   - Users
   - Sessions
   - Event count (modal_opened)
   - Event count (chat_message_sent)
   - Conversions (purchase)

**Report 2: Form Performance**
1. Add events:
   - `begin_checkout` (form started)
   - `generate_lead` (form submitted)
   - `purchase` (success)
2. Add calculated field: **Form Completion Rate**
   - Formula: `purchase / begin_checkout * 100`

---

## 📊 Events Being Tracked

Your site automatically tracks these GA4 events:

| Event Name | Google Event Type | When It Fires |
|------------|------------------|---------------|
| `page_view` | Automatic | Page loads |
| `modal_opened` | Custom | Modal appears |
| `modal_closed` | Custom | Modal dismissed |
| `select_promotion` | Recommended | CTA clicked |
| `begin_checkout` | Recommended | Form started |
| `form_field_focused` | Custom | Field interaction |
| `generate_lead` | Recommended | Form submitted |
| `purchase` | Recommended | Signup success ✅ |
| `exception` | Automatic | Form errors |
| `chat_mode_entered` | Custom | Switch to AI chat |
| `chat_message_sent` | Custom | User sends message |
| `select_content` | Recommended | Suggestion clicked |
| `chat_limit_reached` | Custom | Freemium gate |

### Event Parameters Tracked

Each event includes relevant parameters:

**Modal Events:**
- `mode`: form or chat
- `trigger`: auto, button, or cta
- `event_category`: engagement
- `event_label`: descriptive label

**Conversion Events:**
- `email_domain`: Company domain
- `user_type`: consumer or business
- `value`: 1 (for purchase event)

**Chat Events:**
- `message_length`: Character count
- `is_first_message`: Boolean
- `response_time_ms`: AI response time

---

## 🚀 Step 7: Deploy to Production

### 7.1 Add to Vercel Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. **Settings** → **Environment Variables**
4. Add variable:
   - **Key:** `VITE_GA_MEASUREMENT_ID`
   - **Value:** `G-XXXXXXXXXX` (your Measurement ID)
   - **Environments:** Production, Preview, Development
5. Click **"Save"**

### 7.2 Redeploy

```bash
vercel deploy --prod
```

Or push to GitHub and Vercel will auto-deploy.

---

## 🔍 Step 8: Monitor & Optimize

### Daily Monitoring

**Real-Time Report:**
- Current active users
- Top pages
- Top events
- Traffic sources

**Conversions Report:**
- Total conversions (signups)
- Conversion rate
- Revenue (if monetized)

### Weekly Analysis

**Engagement Report:**
- Modal open rate
- Chat usage rate
- Form completion rate
- Drop-off points

**Acquisition Report:**
- Traffic sources (organic, direct, referral, social)
- Landing pages
- User demographics

### Monthly Deep Dive

**User Explorer:**
- Individual user journeys
- Behavior patterns
- High-value users

**Path Exploration:**
- Common user paths to conversion
- Unexpected navigation patterns
- Optimization opportunities

---

## 🎨 Custom Dashboards

### Create "Waitlist Dashboard"

1. Go to **Library** → **Create New**
2. Add cards:

**Card 1: Key Metrics**
- Total Users (last 30 days)
- Total Conversions
- Conversion Rate
- Average Engagement Time

**Card 2: Funnel**
- Page Views → Modal Opens → Form Starts → Signups

**Card 3: Real-Time**
- Active users
- Active events
- Recent conversions

**Card 4: Traffic Sources**
- Pie chart of acquisition channels

**Card 5: Form Performance**
- Time series of form starts vs. completions

---

## 🔧 Advanced Configuration

### Enable Enhanced E-commerce (Optional)

For detailed conversion tracking:

1. **Admin** → **Data Settings** → **Data Collection**
2. Enable **"Enhanced Measurement"**
3. Customize which interactions to track:
   - ✅ Page views
   - ✅ Scrolls
   - ✅ Outbound clicks
   - ✅ Site search
   - ✅ Video engagement
   - ✅ File downloads

### Set Up Custom Dimensions

Track additional user properties:

1. **Admin** → **Custom Definitions** → **Create Custom Dimension**
2. Examples:
   - **Dimension:** `email_domain`
   - **Scope:** User
   - **Description:** Company domain from email

### Link to Google Ads (Optional)

If running ads:

1. **Admin** → **Google Ads Links**
2. Link your Google Ads account
3. Import conversions to Google Ads
4. Track ROI and optimize campaigns

---

## 📱 Mobile App Tracking (Future)

When you build a mobile app:

1. Create a new **Data Stream** for iOS/Android
2. Add Firebase SDK to your app
3. Events will flow to the same GA4 property
4. Cross-platform reporting automatically available

---

## 🛠️ Troubleshooting

### Events Not Showing Up

**Check:**
1. Measurement ID is correct in `.env.local`
2. Environment variable has `VITE_` prefix
3. Restarted dev server after adding env var
4. Browser console for errors (check Network tab for gtag requests)
5. Ad blockers disabled (they block GA)

**Debug:**
```javascript
// Add to browser console
window.dataLayer
// Should show array of events
```

### Real-Time Report Shows 0 Users

**Solutions:**
1. Wait 10-30 seconds after page load
2. Clear browser cache
3. Test in incognito mode (avoids extensions)
4. Check if GA is blocked by browser/extension
5. Verify Measurement ID format: `G-XXXXXXXXXX`

### Conversion Events Not Triggering

**Check:**
1. Events marked as "Conversions" in GA4
2. May take 24-48 hours to appear in Conversions report
3. Check "Realtime" → "Events" to see if events fire
4. Test form submission and check browser console

---

## 📊 Expected Performance Metrics

### Typical Waitlist Page Benchmarks

Based on industry standards:

| Metric | Good | Great | Excellent |
|--------|------|-------|-----------|
| **Conversion Rate** | 5-10% | 10-20% | 20%+ |
| **Modal Open Rate** | 30-50% | 50-70% | 70%+ |
| **Form Completion** | 40-60% | 60-80% | 80%+ |
| **Chat Engagement** | 10-20% | 20-40% | 40%+ |
| **Avg. Time on Page** | 30-60s | 60-90s | 90s+ |

Use these to set goals and track improvements.

---

## 🎯 Next Steps

1. ✅ Create GA4 account
2. ✅ Get Measurement ID
3. ✅ Add to `.env.local`
4. ✅ Deploy to Vercel
5. ✅ Verify tracking in Real-Time report
6. ✅ Mark conversions
7. ✅ Create funnels
8. ✅ Build custom dashboard
9. ✅ Monitor daily

---

## 📚 Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [GA4 Events Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Vercel Analytics Guide](https://vercel.com/docs/analytics)
- [React GA4 Library](https://github.com/PriceRunner/react-ga4)

---

## 🆘 Support

**Google Analytics Help:**
- [GA4 Help Center](https://support.google.com/analytics)
- [GA4 Community](https://support.google.com/analytics/community)

**Implementation Issues:**
- Check browser console for errors
- Review [QUICKSTART.md](QUICKSTART.md) for setup steps
- Test in incognito mode to isolate issues

---

✅ **You're all set!** Google Analytics 4 is now tracking your waitlist with comprehensive event data.
