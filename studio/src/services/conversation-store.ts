import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  createdAt: Date;
}

export interface ConversationThread {
  threadId: string;
  userId: string;
  title: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

const MAX_CONTEXT_MESSAGES = 10;

export async function createThread(userId: string, title: string): Promise<string> {
  const col = adminDb.collection('conversations').doc(userId).collection('threads');
  const docRef = await col.add({
    userId,
    title,
    model: 'gemini-2.5-flash',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    messageCount: 0,
  });
  return docRef.id;
}

export async function getThreads(userId: string): Promise<ConversationThread[]> {
  const snap = await adminDb.collection('conversations').doc(userId)
    .collection('threads')
    .orderBy('updatedAt', 'desc')
    .limit(20)
    .get();

  return snap.docs.map(d => {
    const data = d.data();
    return {
      threadId: d.id,
      userId: data.userId,
      title: data.title,
      model: data.model || 'gemini-2.5-flash',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      messageCount: data.messageCount || 0,
    };
  });
}

export async function getMessages(
  userId: string,
  threadId: string,
  limit = 50,
): Promise<ConversationMessage[]> {
  const snap = await adminDb.collection('conversations').doc(userId)
    .collection('threads').doc(threadId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get();

  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      role: data.role,
      content: data.content,
      tokens: data.tokens,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });
}

export async function addMessage(
  userId: string,
  threadId: string,
  role: 'user' | 'assistant',
  content: string,
  tokens?: number,
): Promise<string> {
  const msgCol = adminDb.collection('conversations').doc(userId)
    .collection('threads').doc(threadId)
    .collection('messages');

  const docRef = await msgCol.add({
    role,
    content,
    tokens: tokens || 0,
    createdAt: FieldValue.serverTimestamp(),
  });

  await adminDb.collection('conversations').doc(userId)
    .collection('threads').doc(threadId)
    .update({
      updatedAt: FieldValue.serverTimestamp(),
      messageCount: FieldValue.increment(1),
    });

  return docRef.id;
}

export function buildContextFromHistory(messages: ConversationMessage[]): string {
  const recent = messages.slice(-MAX_CONTEXT_MESSAGES);
  if (recent.length === 0) return '';

  return '\n\nPrevious conversation:\n' + recent.map(m =>
    `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, 500)}`
  ).join('\n');
}
