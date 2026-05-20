import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initAdmin() {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    return initializeApp({
      credential: cert(JSON.parse(serviceAccountKey)),
    });
  }

  // Falls back to GOOGLE_APPLICATION_CREDENTIALS or ADC
  // (works on Cloud Run / Firebase App Hosting without extra config)
  return initializeApp();
}

const adminApp = initAdmin();
const adminDb = getFirestore(adminApp);

export { adminApp, adminDb };
