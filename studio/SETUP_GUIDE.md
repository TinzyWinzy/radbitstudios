# 🚀 Radbit SME Hub - Setup Guide for 9.5 Maturity

This guide walks you through activating the monitoring, error tracking, and staging infrastructure.

---

## ✅ What's Already Done

- [x] Sentry error tracking integration
- [x] Health check endpoint (`/api/health`)
- [x] Staging/preview deployment workflows
- [x] Uptime monitoring (GitHub Actions)
- [x] CI/CD pipeline updates

---

## 🔧 Step 1: Set Up Sentry

### Option A: Automated (Recommended)
```bash
chmod +x scripts/setup-sentry.sh
./scripts/setup-sentry.sh
```

### Option B: Manual
1. Create account at https://sentry.io
2. Create project: `sme-hub` (Next.js platform)
3. Get your DSN from Project Settings > Client Keys (DSN)
4. Create auth token: Account Settings > API Keys > Create Token
   - Required scopes: `project:read`, `project:write`, `project:releases`, `org:read`

### Add to GitHub Secrets
Go to: `https://github.com/<org>/radbit-studio/settings/secrets/actions`

| Secret Name | Value |
|-------------|-------|
| `SENTRY_ORG` | Your Sentry org slug |
| `SENTRY_PROJECT` | `sme-hub` |
| `SENTRY_AUTH_TOKEN` | Your auth token |
| `SENTRY_DSN` | Your DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | Same as SENTRY_DSN |

### Add to `.env.local`
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
SENTRY_ORG=your-org
SENTRY_PROJECT=sme-hub
SENTRY_AUTH_TOKEN=sntrys_xxx
```

---

## 🔥 Step 2: Set Up Firebase Staging

### Option A: Automated
```bash
chmod +x scripts/setup-firebase-staging.sh
./scripts/setup-firebase-staging.sh
```

### Option B: Manual
1. Go to https://console.firebase.google.com
2. Create new project: `radbit-sme-hub-ck05x-staging`
3. Enable:
   - Firestore Database
   - Authentication
   - Storage
4. Go to Project Settings > Service Accounts
5. Generate new private key (JSON)
6. Save the JSON content

### Add to GitHub Secrets

| Secret Name | Value |
|-------------|-------|
| `FIREBASE_SERVICE_ACCOUNT_STAGING` | JSON content from step 6 |
| `STAGING_FIREBASE_APP_ID` | From Project Settings > General |
| `STAGING_FIREBASE_API_KEY` | From Project Settings > General |
| `STAGING_FIREBASE_MESSAGING_SENDER_ID` | From Project Settings > General |

---

## 🔐 Step 3: Set Up GitHub Secrets (All at Once)

### Option A: Automated (requires GitHub CLI)
```bash
chmod +x scripts/setup-github-secrets.sh
./scripts/setup-github-secrets.sh
```

### Option B: Manual
Use the GitHub web UI at:
`https://github.com/<org>/radbit-studio/settings/secrets/actions`

---

## 🧪 Step 4: Test Locally

```bash
npm run dev
```

Visit: http://localhost:9002/api/health

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-19T15:57:39.345Z",
  "uptime": 16,
  "checks": {
    "database": "ok",
    "firebase": "ok",
    "memory": "ok"
  },
  "version": "0.1.0"
}
```

---

## 🚀 Step 5: Deploy to Test

```bash
git add .
git commit -m "feat: add monitoring, staging, and error tracking"
git push origin main
```

This will trigger:
1. **CI Pipeline**: lint → typecheck → test → build → Sentry upload
2. **Staging Deployment**: Auto-deploy to staging Firebase project
3. **Uptime Monitoring**: Start checking `/api/health` every 5 minutes

---

## 📊 Step 6: Verify

### Sentry Dashboard
- Go to https://sentry.io
- Check for events from your project
- Verify source maps are uploaded

### Firebase Console
- Go to staging project: https://console.firebase.google.com/project/radbit-sme-hub-ck05x-staging
- Check Hosting > Preview channels

### GitHub Actions
- Go to: `https://github.com/<org>/radbit-studio/actions`
- Verify all workflows pass:
  - CI
  - Staging Deployment
  - Uptime Monitoring

---

## 🎯 Maturity Checklist

| Area | Status | Notes |
|------|--------|-------|
| Error Tracking | ✅ Ready | Activate with Sentry DSN |
| Health Checks | ✅ Live | `/api/health` endpoint working |
| Staging Env | ✅ Ready | Activate with Firebase project |
| Preview Deploys | ✅ Ready | PR previews via Firebase channels |
| Uptime Monitoring | ✅ Ready | Runs every 5 min via GitHub Actions |
| CI/CD | ✅ Live | Source maps upload on main |

---

## 📞 Need Help?

- Sentry docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Firebase docs: https://firebase.google.com/docs/hosting
- GitHub Actions: https://docs.github.com/en/actions

---

**Current Maturity: 8.5/10** → **After activation: 9.5/10** 🎉
