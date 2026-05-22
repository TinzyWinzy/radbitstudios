import { adminDb } from '@/lib/firebase/firebase-admin';

export type OutboundStatus = 'pending' | 'sent' | 'failed';
export type OutboundTemplate = 'assessment_results_ready' | 'booking_reminder' | 'expo_invite';

export interface OutboundMessage {
  id?: string;
  userId: string;
  phoneNumber: string;
  template: OutboundTemplate;
  params: Record<string, string>;
  scheduledAt: Date;
  status: OutboundStatus;
  sentAt?: Date;
  error?: string;
  createdAt: Date;
}

export async function enqueueOutboundMessage(
  userId: string,
  phoneNumber: string,
  template: OutboundTemplate,
  params: Record<string, string>,
  delayMs: number = 0,
): Promise<string> {
  const scheduledAt = new Date(Date.now() + delayMs);
  const docRef = await adminDb.collection('whatsapp_outbound').add({
    userId,
    phoneNumber,
    template,
    params,
    scheduledAt,
    status: 'pending',
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function processOutboundQueue(): Promise<number> {
  const now = new Date();
  const snapshot = await adminDb.collection('whatsapp_outbound')
    .where('status', '==', 'pending')
    .where('scheduledAt', '<=', now)
    .limit(50)
    .get();

  let processed = 0;
  const { sendWhatsAppTemplate } = await import('./whatsapp-handler');

  for (const doc of snapshot.docs) {
    const msg = doc.data() as OutboundMessage;
    try {
      const success = await sendWhatsAppTemplate(
        msg.phoneNumber,
        msg.template,
        msg.params,
      );
      if (success) {
        await doc.ref.update({ status: 'sent', sentAt: new Date() });
      } else {
        await doc.ref.update({ status: 'failed', error: 'Send returned false' });
      }
    } catch (err: any) {
      await doc.ref.update({ status: 'failed', error: err.message });
    }
    processed++;
  }

  return processed;
}

export async function getPendingOutboundCount(): Promise<number> {
  const snapshot = await adminDb.collection('whatsapp_outbound')
    .where('status', '==', 'pending')
    .count()
    .get();
  return snapshot.data()?.count || 0;
}
