import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { adminAuth, adminDb, adminStorage } from '@/lib/firebase/firebase-admin';
import { verifyIdToken } from '@/lib/api-auth';

const USER_COLLECTIONS = [
  { name: 'assessments', field: 'userId' },
  { name: 'generations', field: 'userId' },
  { name: 'messages', field: 'userId' },
  { name: 'notifications', field: 'userId' },
  { name: 'export_assessments', field: 'userId' },
  { name: 'invoices', field: 'userId' },
  { name: 'referral_codes', field: 'userId' },
  { name: 'praz_documents', field: 'userId' },
  { name: 'whatsapp_sessions', field: 'userId' },
  { name: 'analytics_events', field: 'userId' },
  { name: 'ai_semantic_cache', field: 'userId' },
  { name: 'push_subscriptions', field: 'userId' },
  { name: 'onboarding_checklists', field: 'userId' },
  { name: 'business_actions', field: 'userId' },
  { name: 'fiscal_compliance', field: 'userId' },
  { name: 'diaspora_interests', field: 'investorUid' },
] as const;

const USER_ROOT_DOCUMENTS = (uid: string) => [
  `budgets/${uid}`,
  `newsletter_subscriptions/${uid}`,
  `diaspora_investors/${uid}`,
  `agent_threads/${uid}`,
  `financial_oracle/${uid}`,
  `operational_mirror/${uid}`,
  `whatsapp_briefs/${uid}`,
  `conversations/${uid}`,
];

async function exportDocumentTree(
  ref: FirebaseFirestore.DocumentReference,
): Promise<Record<string, unknown> | null> {
  const snap = await ref.get();
  const result: Record<string, unknown> = snap.exists
    ? { id: snap.id, ...snap.data() }
    : { id: snap.id };
  const subcollections = await ref.listCollections();

  for (const collection of subcollections) {
    const children = await collection.get();
    result[collection.id] = await Promise.all(
      children.docs.map(child => exportDocumentTree(child.ref)),
    );
  }

  return snap.exists || subcollections.length > 0 ? result : null;
}

async function exportUserData(uid: string): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    userId: uid,
  };

  try {
    const authUser = await adminAuth.getUser(uid);
    const accountEmail = authUser.email?.toLowerCase();
    if (accountEmail) {
      const subscribers = await adminDb.collection('newsletter_subscribers')
        .where('email', '==', accountEmail)
        .get();
      data.newsletter_subscribers = subscribers.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch {
    data.newsletter_subscribers = [];
  }

  for (const { name, field } of USER_COLLECTIONS) {
    try {
      const snap = await adminDb.collection(name).where(field, '==', uid).get();
      data[name] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      data[name] = [];
    }
  }

  for (const path of USER_ROOT_DOCUMENTS(uid)) {
    try {
      data[path.replace('/', '_')] = await exportDocumentTree(adminDb.doc(path));
    } catch {
      data[path.replace('/', '_')] = null;
    }
  }

  try {
    const projects = await adminDb.collection('projects').where('clientId', '==', uid).get();
    data.projects = projects.docs.map(d => ({ id: d.id, ...d.data() }));
    const taskGroups = await Promise.all(projects.docs.map(project =>
      adminDb.collection('project_tasks').where('projectId', '==', project.id).get()
    ));
    data.project_tasks = taskGroups.flatMap(snap => snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch {
    data.projects = [];
    data.project_tasks = [];
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
  const profile = await adminDb.doc(`users/${uid}`).get();
  const accountEmail = profile.data()?.email as string | undefined;

  // Delete top-level user-scoped collections
  for (const { name, field } of USER_COLLECTIONS) {
    try {
      const snap = await adminDb.collection(name).where(field, '==', uid).get();
      if (snap.empty) continue;
      await Promise.all(snap.docs.map(docSnap => adminDb.recursiveDelete(docSnap.ref)));
      deleted.push(`${name}: ${snap.size} docs`);
    } catch (err) {
      console.warn(`[DeleteAccount] Error deleting ${name}:`, err);
      deleted.push(`${name}: error`);
    }
  }

  for (const path of USER_ROOT_DOCUMENTS(uid)) {
    try {
      const ref = adminDb.doc(path);
      await adminDb.recursiveDelete(ref);
      deleted.push(`${path}: deleted`);
    } catch (err) {
      console.warn(`[DeleteAccount] Error deleting ${path}:`, err);
      deleted.push(`${path}: error`);
    }
  }

  // Delete customer projects, their task records and private storage objects.
  try {
    const projects = await adminDb.collection('projects').where('clientId', '==', uid).get();
    for (const project of projects.docs) {
      const tasks = await adminDb.collection('project_tasks').where('projectId', '==', project.id).get();
      await Promise.all(tasks.docs.map(task => adminDb.recursiveDelete(task.ref)));
      await adminStorage.bucket().deleteFiles({ prefix: `projects/${project.id}/` }).catch(() => {});
      await adminDb.recursiveDelete(project.ref);
    }
    deleted.push(`projects: ${projects.size} docs with tasks and stored files`);
  } catch (err) {
    console.warn('[DeleteAccount] Error deleting projects:', err);
    deleted.push('projects: error');
  }

  await adminStorage.bucket().deleteFiles({ prefix: `praz/${uid}/` }).catch(() => {});

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
    await profile.ref.delete();
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

  if (accountEmail) {
    try {
      const subscribers = await adminDb.collection('newsletter_subscribers')
        .where('email', '==', accountEmail.toLowerCase())
        .get();
      await Promise.all(subscribers.docs.map(doc => adminDb.recursiveDelete(doc.ref)));
      deleted.push(`newsletter_subscribers: ${subscribers.size} docs`);
    } catch (err) {
      console.warn('[DeleteAccount] Error deleting newsletter subscriber:', err);
      deleted.push('newsletter_subscribers: error');
    }
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

    if (deleted.some(entry => entry.endsWith(': error'))) {
      return NextResponse.json(
        { error: 'Some account records could not be deleted. The account remains active so the request can be retried.', deleted },
        { status: 500 },
      );
    }

    try {
      await adminAuth.deleteUser(uid);
      deleted.push('firebase_auth: deleted');
    } catch (error) {
      console.error('[DeleteAccount] Error deleting Firebase Auth user:', error);
      return NextResponse.json(
        { error: 'Account data was removed, but authentication deletion failed. Please contact support.', deleted },
        { status: 500 },
      );
    }

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
