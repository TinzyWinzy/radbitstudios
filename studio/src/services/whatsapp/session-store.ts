import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface MessageExchange {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface WhatsAppSession {
  phoneNumber: string;
  userId?: string;
  context: MessageExchange[];
  lastActivity: Date;
  activeFlow?: 'mentor' | 'tender_search' | 'tax' | 'linking';
  metadata: Record<string, string>;
}

const MAX_CONTEXT_EXCHANGES = 10;

export async function getOrCreateSession(phoneNumber: string): Promise<WhatsAppSession> {
  const ref = adminDb.doc(`whatsapp_sessions/${phoneNumber}`);
  const snap = await ref.get();

  if (snap.exists) {
    const data = snap.data()!;
    return {
      phoneNumber: data.phoneNumber,
      userId: data.userId,
      context: (data.context || []).map((m: any) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp?.toDate() || new Date(),
      })),
      lastActivity: data.lastActivity?.toDate() || new Date(),
      activeFlow: data.activeFlow,
      metadata: data.metadata || {},
    };
  }

  const session: WhatsAppSession = {
    phoneNumber,
    context: [],
    lastActivity: new Date(),
    metadata: {},
  };

  await ref.set({
    ...session,
    lastActivity: FieldValue.serverTimestamp(),
  });

  return session;
}

export async function addExchange(
  phoneNumber: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  const ref = adminDb.doc(`whatsapp_sessions/${phoneNumber}`);
  const snap = await ref.get();
  if (!snap.exists) return;

  const data = snap.data()!;
  const context: MessageExchange[] = data.context || [];

  context.push({ role, content, timestamp: new Date() });

  if (context.length > MAX_CONTEXT_EXCHANGES) {
    context.splice(0, context.length - MAX_CONTEXT_EXCHANGES);
  }

  await ref.update({
    context: context.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    })),
    lastActivity: FieldValue.serverTimestamp(),
  });
}

export async function linkSessionToUser(
  phoneNumber: string,
  userId: string,
): Promise<void> {
  const ref = adminDb.doc(`whatsapp_sessions/${phoneNumber}`);
  await ref.set({
    phoneNumber,
    userId,
    lastActivity: FieldValue.serverTimestamp(),
    metadata: {},
  }, { merge: true });
}

export async function setActiveFlow(
  phoneNumber: string,
  flow: WhatsAppSession['activeFlow'],
): Promise<void> {
  const ref = adminDb.doc(`whatsapp_sessions/${phoneNumber}`);
  await ref.update({
    activeFlow: flow || FieldValue.delete(),
    lastActivity: FieldValue.serverTimestamp(),
  });
}
