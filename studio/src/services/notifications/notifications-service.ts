import { db } from '@/lib/firebase/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'assessment' | 'insights' | 'tender' | 'news' | 'system' | 'community' | 'project';
  read: boolean;
  createdAt: Timestamp;
  link?: string;
}

export async function getNotifications(userId: string, max = 20): Promise<AppNotification[]> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
    limit(100),
  );
  const snap = await getDocs(q);
  return snap.size;
}

export async function markAsRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
}

export async function markAllAsRead(userId: string): Promise<void> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
  );
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { read: true }));
  await batch.commit();
}

export async function createNotification(data: Omit<AppNotification, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'notifications'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
