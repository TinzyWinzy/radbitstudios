#!/usr/bin/env bash

set -e

echo "🚀 Radbit SME Hub - Sentry Setup"
echo "================================"
echo ""

# Check if Sentry CLI is installed
if ! command -v sentry-cli &> /dev/null; then
  echo "📦 Installing Sentry CLI..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install getsentry/tools/sentry-cli
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    curl -sL https://sentry.io/get-cli/ | bash
  else
    echo "❌ Please install Sentry CLI manually: https://docs.sentry.io/cli/installation/"
    exit 1
  fi
fi

echo "✅ Sentry CLI installed"
echo ""

# Check if user is authenticated with Sentry
if ! sentry-cli info &> /dev/null; then
  echo "🔐 Please authenticate with Sentry:"
  echo "   Run: sentry-cli login"
  echo "   Or set SENTRY_AUTH_TOKEN environment variable"
  echo ""
  read -p "Have you set SENTRY_AUTH_TOKEN? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please authenticate and try again"
    exit 1
  fi
fi

# Create Sentry project
echo "📝 Creating Sentry project..."
SENTRY_ORG=$(sentry-cli organizations:list --no-input | grep -oP '(?<=\| )\S+(?= \|)' | head -1)
SENTRY_PROJECT="sme-hub"

echo "   Organization: $SENTRY_ORG"
echo "   Project: $SENTRY_PROJECT"

# Create project if it doesn't exist
sentry-cli projects create --org "$SENTRY_ORG" "$SENTRY_PROJECT" --platform nextjs || true

# Get DSN
SENTRY_DSN=$(sentry-cli projects --org "$SENTRY_ORG" set "$SENTRY_PROJECT" keys --help 2>&1 | grep -oP 'https://[^@]+@[^/]+/\d+' | head -1)

if [ -z "$SENTRY_DSN" ]; then
  echo "⚠️  Could not auto-fetch DSN. Please get it from Sentry dashboard:"
  echo "   https://sentry.io/settings/$SENTRY_ORG/projects/$SENTRY_PROJECT/keys/"
  read -p "Enter SENTRY_DSN: " SENTRY_DSN
fi

echo ""
echo "✅ Sentry project configured!"
echo ""
echo "📋 Add these to your GitHub repository secrets:"
echo "   SENTRY_ORG=$SENTRY_ORG"
echo "   SENTRY_PROJECT=$SENTRY_PROJECT"
echo "   SENTRY_AUTH_TOKEN=<your-auth-token>"
echo "   SENTRY_DSN=$SENTRY_DSN"
echo "   NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN"
echo ""
echo "🔧 Add these to your .env.local:"
echo "   NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN"
echo "   SENTRY_ORG=$SENTRY_ORG"
echo "   SENTRY_PROJECT=$SENTRY_PROJECT"
echo "   SENTRY_AUTH_TOKEN=<your-auth-token>"
echo ""

# Update .env.local if it exists
if [ -f ".env.local" ]; then
  echo "📝 Updating .env.local..."
  grep -q "NEXT_PUBLIC_SENTRY_DSN" .env.local && sed -i.bak "s|NEXT_PUBLIC_SENTRY_DSN=.*|NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN|" .env.local || echo "NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN" >> .env.local
  grep -q "SENTRY_ORG" .env.local && sed -i.bak "s|SENTRY_ORG=.*|SENTRY_ORG=$SENTRY_ORG|" .env.local || echo "SENTRY_ORG=$SENTRY_ORG" >> .env.local
  grep -q "SENTRY_PROJECT" .env.local && sed -i.bak "s|SENTRY_PROJECT=.*|SENTRY_PROJECT=$SENTRY_PROJECT|" .env.local || echo "SENTRY_PROJECT=$SENTRY_PROJECT" >> .env.local
  echo "✅ .env.local updated"
fi

echo ""
echo "🎉 Sentry setup complete!"
echo "   Run: npm run dev to test locally"
echo "   Push to main to trigger source map upload in CI"
