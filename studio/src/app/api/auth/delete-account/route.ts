import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { verifyIdToken } from '@/lib/api-auth';

const USER_COLLECTIONS = [
  'assessments',
  'generations',
  'budgets',
  'bookmarks',
  'conversations',
  'messages',
  'notifications',
  'export_assessments',
  'invoices',
  'referral_codes',
  'newsletter_subscriptions',
  'praz_documents',
  'whatsapp_sessions',
  'analytics_events',
  'bruteforce_attempts',
  'ai_semantic_cache',
];

async function exportUserData(uid: string): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    userId: uid,
  };

  for (const col of USER_COLLECTIONS) {
    try {
      const snap = await adminDb.collection(col).where('userId', '==', uid).get();
      data[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      data[col] = [];
    }
  }

  // Also export nested conversation threads/messages
  try {
    const convSnap = await adminDb.collection('conversations').where('participants', 'array-contains', uid).get();
    const convData: Array<Record<string, unknown>> = [];
    for (const convDoc of convSnap.docs) {
      const threadsSnap = await convDoc.ref.collection('threads').get();
      const threads = threadsSnap.docs.map(t => ({
        id: t.id,
        ...t.data(),
        messages: [] as Array<Record<string, unknown>>,
      }));
      for (const thread of threads) {
        const msgsSnap = await convDoc.ref.collection('threads').doc(thread.id).collection('messages').get();
        thread.messages = msgsSnap.docs.map(m => ({ id: m.id, ...m.data() }));
      }
      convData.push({ id: convDoc.id, ...convDoc.data(), threads });
    }
    data.conversations_nested = convData;
  } catch {
    data.conversations_nested = [];
  }

  // Export profile
  try {
    const userDoc = await adminDb.doc(`users/${uid}`).get();
    data.profile = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
  } catch {
    data.profile = null;
  }

  return data;
}

async function deleteUserData(uid: string): Promise<string[]> {
  const deleted: string[] = [];

  // Delete top-level user-scoped collections
  for (const col of USER_COLLECTIONS) {
    try {
      const snap = await adminDb.collection(col).where('userId', '==', uid).get();
      if (snap.empty) continue;

      const batch = adminDb.batch();
      snap.forEach(docSnap => batch.delete(adminDb.doc(`${col}/${docSnap.id}`)));
      await batch.commit();
      deleted.push(`${col}: ${snap.size} docs`);
    } catch (err) {
      console.warn(`[DeleteAccount] Error deleting ${col}:`, err);
      deleted.push(`${col}: error`);
    }
  }

  // Delete nested conversation threads and messages
  try {
    const convSnap = await adminDb.collection('conversations').where('participants', 'array-contains', uid).get();
    for (const convDoc of convSnap.docs) {
      // Delete all threads and their nested messages
      const threadsSnap = await convDoc.ref.collection('threads').get();
      for (const threadDoc of threadsSnap.docs) {
        // Delete messages subcollection
        const msgsSnap = await threadDoc.ref.collection('messages').get();
        if (!msgsSnap.empty) {
          const msgBatch = adminDb.batch();
          msgsSnap.forEach(m => msgBatch.delete(m.ref));
          await msgBatch.commit();
        }
        await threadDoc.ref.delete();
      }
      // Delete the conversation document itself
      await convDoc.ref.delete();
    }
    deleted.push(`conversations: ${convSnap.size} docs (with nested threads/messages)`);
  } catch (err) {
    console.warn('[DeleteAccount] Error deleting conversations:', err);
    deleted.push('conversations: error');
  }

  // Delete user profile
  try {
    await adminDb.doc(`users/${uid}`).delete();
    deleted.push('users: 1 doc');
  } catch (err) {
    console.warn('[DeleteAccount] Error deleting user doc:', err);
    deleted.push('users: error');
  }

  // Clean up Firestore rate limit counters for this user
  try {
    const rlSnap = await adminDb.collection('ratelimit_counters')
      .where('key', '>=', `user:${uid}`)
      .where('key', '<', `user:${uid}\uf8ff`)
      .get();
    if (!rlSnap.empty) {
      const rlBatch = adminDb.batch();
      rlSnap.forEach(d => rlBatch.delete(d.ref));
      await rlBatch.commit();
      deleted.push(`ratelimit_counters: ${rlSnap.size} docs`);
    }
  } catch {
    // Non-critical
  }

  return deleted;
}

export const POST = withIpRateLimit(
  { maxRequests: 5, windowMs: 60 * 60 * 1000, keyPrefix: 'ratelimit:delete-account' },
  async (req: NextRequest): Promise<NextResponse> => {
  try {
    const { idToken, exportOnly } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const verified = await verifyIdToken(idToken);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { uid } = verified;

    if (exportOnly) {
      const data = await exportUserData(uid);
      return NextResponse.json({ success: true, data });
    }

    const deleted = await deleteUserData(uid);

    const response = NextResponse.json({
      success: true,
      deleted,
      message: 'Your account data has been deleted. You will be signed out.',
    });

    response.cookies.set('__session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error: unknown) {
    console.error('[DeleteAccount] Error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
},
);
