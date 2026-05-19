#!/usr/bin/env bash

set -e

echo "🔐 Radbit SME Hub - GitHub Secrets Setup"
echo "========================================="
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
  echo "📦 GitHub CLI not found. Please install it:"
  echo "   https://cli.github.com/"
  exit 1
fi

# Check if authenticated with GitHub
if ! gh auth status &> /dev/null; then
  echo "🔐 Please authenticate with GitHub:"
  echo "   Run: gh auth login"
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"
echo ""

# Prompt for secrets
echo "📝 Enter your Sentry credentials:"
read -p "SENTRY_ORG (e.g., radbit-studios): " SENTRY_ORG
read -p "SENTRY_PROJECT (e.g., sme-hub): " SENTRY_PROJECT
read -s -p "SENTRY_AUTH_TOKEN: " SENTRY_AUTH_TOKEN
echo ""
read -s -p "SENTRY_DSN: " SENTRY_DSN
echo ""
read -s -p "NEXT_PUBLIC_SENTRY_DSN (same as SENTRY_DSN): " NEXT_PUBLIC_SENTRY_DSN
echo ""

echo "📝 Enter your Firebase staging credentials:"
read -s -p "STAGING_FIREBASE_APP_ID: " STAGING_FIREBASE_APP_ID
echo ""
read -s -p "STAGING_FIREBASE_API_KEY: " STAGING_FIREBASE_API_KEY
echo ""
read -s -p "STAGING_FIREBASE_MESSAGING_SENDER_ID: " STAGING_FIREBASE_MESSAGING_SENDER_ID
echo ""
read -p "FIREBASE_SERVICE_ACCOUNT (paste JSON content): " FIREBASE_SERVICE_ACCOUNT
echo ""

# Set secrets
echo "🔐 Setting GitHub secrets..."

gh secret set SENTRY_ORG --body "$SENTRY_ORG" --repo "$REPO"
gh secret set SENTRY_PROJECT --body "$SENTRY_PROJECT" --repo "$REPO"
gh secret set SENTRY_AUTH_TOKEN --body "$SENTRY_AUTH_TOKEN" --repo "$REPO"
gh secret set SENTRY_DSN --body "$SENTRY_DSN" --repo "$REPO"
gh secret set NEXT_PUBLIC_SENTRY_DSN --body "$NEXT_PUBLIC_SENTRY_DSN" --repo "$REPO"
gh secret set STAGING_FIREBASE_APP_ID --body "$STAGING_FIREBASE_APP_ID" --repo "$REPO"
gh secret set STAGING_FIREBASE_API_KEY --body "$STAGING_FIREBASE_API_KEY" --repo "$REPO"
gh secret set STAGING_FIREBASE_MESSAGING_SENDER_ID --body "$STAGING_FIREBASE_MESSAGING_SENDER_ID" --repo "$REPO"
gh secret set FIREBASE_SERVICE_ACCOUNT_STAGING --body "$FIREBASE_SERVICE_ACCOUNT" --repo "$REPO"

echo ""
echo "✅ All secrets set!"
echo ""
echo "📋 Secrets configured:"
echo "   - SENTRY_ORG"
echo "   - SENTRY_PROJECT"
echo "   - SENTRY_AUTH_TOKEN"
echo "   - SENTRY_DSN"
echo "   - NEXT_PUBLIC_SENTRY_DSN"
echo "   - STAGING_FIREBASE_APP_ID"
echo "   - STAGING_FIREBASE_API_KEY"
echo "   - STAGING_FIREBASE_MESSAGING_SENDER_ID"
echo "   - FIREBASE_SERVICE_ACCOUNT_STAGING"
echo ""
echo "🎉 GitHub secrets setup complete!"
echo "   Push to main to trigger CI/CD pipelines"
