import { db } from '@/lib/firebase/firebase';
import {
  collection, addDoc, getDocs, getDoc, doc, setDoc, deleteDoc,
  query, orderBy, limit, Timestamp, serverTimestamp,
} from 'firebase/firestore';

export interface Version {
  id?: string;
  data: Record<string, unknown>;
  savedAt: Timestamp;
  savedBy: string;
  label?: string;
}

const MAX_VERSIONS = 50;

/**
 * Save a snapshot of a Firestore document to its `versions` subcollection.
 * Purges oldest versions if over MAX_VERSIONS.
 */
export async function saveVersion(
  collectionName: string,
  docId: string,
  savedBy: string,
  label?: string,
): Promise<string> {
  // Read current document
  const snap = await getDoc(doc(db, collectionName, docId));
  if (!snap.exists()) throw new Error('Document not found');

  const data = snap.data() as Record<string, unknown>;
  // Strip version-related and server timestamp fields from snapshot
  const clean = { ...data };
  delete clean.createdAt;
  delete clean.updatedAt;

  const versionRef = await addDoc(
    collection(db, collectionName, docId, 'versions'),
    {
      data: clean,
      savedAt: serverTimestamp(),
      savedBy,
      label: label || '',
    },
  );

  // Purge old versions if over limit
  const vSnap = await getDocs(
    query(
      collection(db, collectionName, docId, 'versions'),
      orderBy('savedAt', 'desc'),
    ),
  );

  if (vSnap.docs.length > MAX_VERSIONS) {
    const toDelete = vSnap.docs.slice(MAX_VERSIONS);
    await Promise.all(toDelete.map(d => deleteDoc(d.ref)));
  }

  return versionRef.id;
}

/**
 * Get all versions for a document (newest first).
 */
export async function listVersions(
  collectionName: string,
  docId: string,
): Promise<Version[]> {
  const vSnap = await getDocs(
    query(
      collection(db, collectionName, docId, 'versions'),
      orderBy('savedAt', 'desc'),
      limit(MAX_VERSIONS),
    ),
  );
  return vSnap.docs.map(d => ({ id: d.id, ...d.data() } as Version));
}

/**
 * Restore a document to a previous version.
 * Also saves a version snapshot before restoring (as a backup).
 */
export async function restoreVersion(
  collectionName: string,
  docId: string,
  versionId: string,
  restoredBy: string,
): Promise<void> {
  const vRef = doc(db, collectionName, docId, 'versions', versionId);
  const vSnap = await getDoc(vRef);
  if (!vSnap.exists()) throw new Error('Version not found');

  const version = vSnap.data() as Version;

  // Save current state as a version before restoring
  await saveVersion(collectionName, docId, restoredBy, `Auto-backup before restore from ${versionId}`);

  // Restore: write version data back to main document (without id)
  const { id, ...rest } = version;
  await setDoc(doc(db, collectionName, docId), {
    ...rest.data,
    updatedAt: serverTimestamp(),
  });
}
