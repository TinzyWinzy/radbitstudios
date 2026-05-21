import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';

config({ path: '.env.local' });

function initAdmin() {
  if (getApps().length > 0) return getApps()[0];
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (key) {
    return initializeApp({ credential: cert(JSON.parse(key)) });
  }
  return initializeApp();
}

const adminApp = initAdmin();
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

async function main() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error('Usage: npx tsx scripts/set-admin-role.ts <uid|email>');
    process.exit(1);
  }

  let uid = identifier;

  const isEmail = identifier.includes('@');
  if (isEmail) {
    try {
      const user = await adminAuth.getUserByEmail(identifier);
      uid = user.uid;
      console.log(`Found user: ${user.displayName || 'N/A'} (${user.email})`);
    } catch {
      console.error(`No user found with email: ${identifier}`);
      process.exit(1);
    }
  }

  await adminAuth.setCustomUserClaims(uid, { role: 'super_admin' });
  await adminDb.collection('users').doc(uid).set({ role: 'super_admin' }, { merge: true });

  const user = await adminAuth.getUser(uid);
  console.log(`\nSet super_admin for:`);
  console.log(`  UID:   ${uid}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Name:  ${user.displayName || 'N/A'}`);
  console.log(`\nClaims: ${JSON.stringify(user.customClaims)}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
