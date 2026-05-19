#!/usr/bin/env bash

set -e

echo "🔥 Radbit SME Hub - Firebase Staging Setup"
echo "==========================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo "📦 Installing Firebase CLI..."
  npm install -g firebase-tools
fi

echo "✅ Firebase CLI installed"
echo ""

# Check if user is authenticated with Firebase
if ! firebase projects:list &> /dev/null; then
  echo "🔐 Please authenticate with Firebase:"
  echo "   Run: firebase login"
  read -p "Have you authenticated? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please authenticate and try again"
    exit 1
  fi
fi

# Create staging project
STAGING_PROJECT_ID="radbit-sme-hub-ck05x-staging"
echo "📝 Creating staging Firebase project: $STAGING_PROJECT_ID"

firebase projects:create "$STAGING_PROJECT_ID" --display-name "Radbit SME Hub (Staging)" || true

echo ""
echo "✅ Staging project created!"
echo ""

# Enable required services
echo "🔧 Enabling required services..."
firebase experiments:enable webframeworks

echo ""
echo "📋 Next steps:"
echo "   1. Go to Firebase Console: https://console.firebase.google.com/project/$STAGING_PROJECT_ID"
echo "   2. Enable Firestore, Authentication, and Storage"
echo "   3. Create a service account for CI/CD:"
echo "      - Go to Project Settings > Service Accounts"
echo "      - Generate new private key"
echo "      - Add to GitHub secrets as FIREBASE_SERVICE_ACCOUNT_STAGING"
echo ""
echo "   4. Get Firebase config from Project Settings > General > Your apps"
echo "      - Add to GitHub secrets:"
echo "        STAGING_FIREBASE_APP_ID"
echo "        STAGING_FIREBASE_API_KEY"
echo "        STAGING_FIREBASE_MESSAGING_SENDER_ID"
echo ""

# Generate service account command
echo "🔑 To generate service account key:"
echo "   firebase init hosting"
echo "   # Then go to Firebase Console > Project Settings > Service Accounts"
echo "   # Generate new private key and save as JSON"
echo ""

echo "🎉 Firebase staging setup complete!"
echo "   Run: firebase use --add to link the staging project"
