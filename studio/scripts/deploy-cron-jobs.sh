#!/usr/bin/env bash

# ─── Radbit Cron Job Deployment Script ─────────────────────────────────────
# Deploys Google Cloud Scheduler jobs to trigger Next.js API cron routes.
# Uses Firebase App Hosting URL as the target.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - firebase CLI installed
#   - CRON_SECRET set in Firebase Secret Manager and apphosting.yaml
#
# Usage:
#   ./scripts/deploy-cron-jobs.sh <app-hosting-url>
#
# Example:
#   ./scripts/deploy-cron-jobs.sh https://radbitstudios.co.zw
#
# For local testing against Firebase emulator:
#   ./scripts/deploy-cron-jobs.sh http://localhost:9002
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <app-hosting-url>"
  echo "  e.g. $0 https://radbitstudios.co.zw"
  exit 1
fi

BASE_URL="${1%/}"
CRON_SECRET="${CRON_SECRET:-}"
PROJECT_ID="radbit-sme-hub-ck05x"
LOCATION="us-central1"
TIMEZONE="Africa/Harare"

echo "🔥 Deploying Radbit Cron Jobs"
echo "=============================="
echo "Target URL: $BASE_URL"
echo "Project ID: $PROJECT_ID"
echo ""

if [ -z "$CRON_SECRET" ]; then
  if command -v firebase &> /dev/null; then
    echo "🔐 Fetching CRON_SECRET from Firebase Secret Manager..."
    CRON_SECRET=$(firebase secrets:get CRON_SECRET --project "$PROJECT_ID" 2>/dev/null || echo "")
  fi
  if [ -z "$CRON_SECRET" ]; then
    echo "⚠️  CRON_SECRET not set. Jobs will be deployed without auth."
    echo "   Set it via: echo <secret> | firebase secrets:set CRON_SECRET"
  fi
fi

AUTH_HEADER=""
if [ -n "$CRON_SECRET" ]; then
  AUTH_HEADER="Authorization=Bearer $CRON_SECRET"
fi

check_gcloud() {
  if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
  fi
}

create_scheduler() {
  local NAME="$1"
  local SCHEDULE="$2"
  local URI="$3"
  local DESCRIPTION="$4"
  local BODY="${5:-}"

  echo ""
  echo "📅 Creating/Updating scheduler: $NAME"
  echo "   Schedule: $SCHEDULE"
  echo "   URI: $URI"
  echo "   Desc: $DESCRIPTION"

  # Delete existing job if it exists (to update)
  gcloud scheduler jobs delete "$NAME" \
    --project "$PROJECT_ID" \
    --location "$LOCATION" \
    2>/dev/null || true

  local CMD=(
    gcloud scheduler jobs create http "$NAME"
    --project "$PROJECT_ID"
    --location "$LOCATION"
    --schedule "$SCHEDULE"
    --uri "$URI"
    --time-zone "$TIMEZONE"
    --description "$DESCRIPTION"
    --attempt-deadline "120s"
    --max-retry-attempts "3"
    --min-backoff "30s"
  )

  if [ -n "$AUTH_HEADER" ]; then
    CMD+=(--headers "$AUTH_HEADER")
  fi

  if [ -n "$BODY" ]; then
    CMD+=(--http-method POST)
    CMD+=(--message-body "$BODY")
    CMD+=(--content-type "application/json")
  else
    CMD+=(--http-method GET)
  fi

  "${CMD[@]}"
  echo "   ✅ Deployed"
}

# ─── Check prerequisites ────────────────────────────────────────────────────
check_gcloud

# Confirm project
echo "🔍 Using GCP project: $(gcloud config get-value project 2>/dev/null || echo "$PROJECT_ID")"
gcloud config set project "$PROJECT_ID" 2>/dev/null || true

# ─── 1. RETI Threat Assessment Scanner ─────────────────────────────────────
# Runs every 6 hours to check PRAZ, SADC, AI Strategy, ZIMRA, etc.
create_scheduler \
  "radbit-reti-scan" \
  "0 */6 * * *" \
  "${BASE_URL}/api/cron/reti-scan" \
  "RETI: Scan PRAZ, SADC, AI Strategy, ZIMRA feeds for new policy shifts and generate threat assessment holons"

# ─── 2. News Scraper ───────────────────────────────────────────────────────
# Runs every 4 hours to fetch latest news from 20+ Zimbabwe/Africa sources
create_scheduler \
  "radbit-news-scraper" \
  "0 */4 * * *" \
  "${BASE_URL}/api/scraper/news" \
  "News: Scrape RSS/HTML feeds from 20+ Zimbabwe and Africa news sources"

# ─── 3. Tender Scraper ─────────────────────────────────────────────────────
# Runs every 6 hours to fetch latest tenders from PRAZ and government portals
create_scheduler \
  "radbit-tender-scraper" \
  "0 */6 * * *" \
  "${BASE_URL}/api/scraper/tenders" \
  "Tenders: Scrape PRAZ and government tender portals for new opportunities"

# ─── 4. WhatsApp Outbound Queue ────────────────────────────────────────────
# Runs every 5 minutes to process pending WhatsApp message queue
create_scheduler \
  "radbit-whatsapp-queue" \
  "*/5 * * * *" \
  "${BASE_URL}/api/cron/process-whatsapp-queue" \
  "WhatsApp: Process pending outbound message queue"

echo ""
echo "🎉 All cron jobs deployed successfully!"
echo ""
echo "📋 Summary:"
echo "   reti-scan          - Every 6 hours    - Policy threat assessments"
echo "   news-scraper       - Every 4 hours    - News feed ingestion"
echo "   tender-scraper     - Every 6 hours    - Tender opportunity scraping"
echo "   whatsapp-queue     - Every 5 minutes  - WhatsApp message dispatch"
echo ""
echo "   Timezone: $TIMEZONE"
echo "   View in console: https://console.cloud.google.com/cloudscheduler?project=$PROJECT_ID"
