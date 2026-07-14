import { adminDb } from '@/lib/firebase/firebase-admin';
import { sendEmail } from '@/services/email-service';
import { sendPush } from '@/services/notifications/push-service';

export type NotificationChannel = 'whatsapp' | 'email' | 'in_app' | 'push';
export type NotificationType = 'assessment' | 'insights' | 'tender' | 'news' | 'system';
export type OutboundStatus = 'pending' | 'sent' | 'failed' | 'partial';

const TYPE_TO_PREF_FIELD: Record<NotificationType, string> = {
  assessment: 'notifyAssessment',
  insights: 'notifyInsights',
  tender: 'notifyTender',
  news: 'notifyNews',
  system: 'notifySystem',
};

export interface OutboundPayload {
  id?: string;
  userId: string;
  phoneNumber?: string;
  email?: string;
  channels: NotificationChannel[];
  type: NotificationType;
  title: string;
  body: string;
  template?: string;
  templateParams?: Record<string, string>;
  link?: string;
  scheduledAt: Date;
  status: OutboundStatus;
  channelResults?: Record<NotificationChannel, 'sent' | 'failed' | 'skipped'>;
  createdAt: Date;
}

export async function enqueueNotification(
  userId: string,
  payload: {
    title: string;
    body: string;
    phoneNumber?: string;
    email?: string;
    type?: NotificationType;
    channels?: NotificationChannel[];
    template?: string;
    templateParams?: Record<string, string>;
    link?: string;
    delayMs?: number;
  },
): Promise<string> {
  const channels = payload.channels ?? ['email', 'in_app'];
  const type = payload.type ?? 'system';
  const scheduledAt = new Date(Date.now() + (payload.delayMs ?? 0));
  const docRef = await adminDb.collection('notification_outbound').add({
    userId,
    phoneNumber: payload.phoneNumber ?? null,
    email: payload.email ?? null,
    channels,
    type,
    title: payload.title,
    body: payload.body,
    template: payload.template ?? null,
    templateParams: payload.templateParams ?? null,
    link: payload.link ?? null,
    scheduledAt,
    status: 'pending',
    channelResults: {},
    createdAt: new Date(),
  });
  return docRef.id;
}

async function userPrefersChannel(
  userId: string,
  channel: NotificationChannel,
  type: NotificationType,
): Promise<boolean> {
  if (channel === 'push' || channel === 'in_app') {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const prefField = TYPE_TO_PREF_FIELD[type];
    if (userData?.[prefField] === false) {
      return false;
    }
  }
  return true;
}

export async function processOutboundQueue(): Promise<number> {
  const now = new Date();
  const snapshot = await adminDb.collection('notification_outbound')
    .where('status', '==', 'pending')
    .where('scheduledAt', '<=', now)
    .limit(50)
    .get();

  let processed = 0;
  const { createNotification } = await import('./notifications-service');

  for (const doc of snapshot.docs) {
    const msg = doc.data() as OutboundPayload;
    const results: Record<NotificationChannel, 'sent' | 'failed' | 'skipped'> = {
      whatsapp: 'skipped', email: 'skipped', in_app: 'skipped', push: 'skipped',
    };

    for (const channel of msg.channels) {
      try {
        if (!(await userPrefersChannel(msg.userId, channel, msg.type ?? 'system'))) {
          results[channel] = 'skipped';
          continue;
        }

        let ok = false;
        switch (channel) {
          case 'whatsapp':
            if (msg.phoneNumber && msg.template) {
              const { sendWhatsAppTemplate } = await import('@/services/whatsapp/whatsapp-handler');
              ok = await sendWhatsAppTemplate(msg.phoneNumber, msg.template as any, msg.templateParams ?? {});
            }
            break;
          case 'email':
            if (msg.email) {
              await sendEmail(msg.email, msg.title, msg.body);
              ok = true;
            }
            break;
          case 'in_app':
            await createNotification({
              userId: msg.userId,
              title: msg.title,
              body: msg.body,
              type: msg.type ?? 'system',
              read: false,
              link: msg.link,
            });
            ok = true;
            break;
          case 'push':
            ok = await sendPush(msg.userId, msg.title, msg.body, msg.link);
            break;
        }
        results[channel] = ok ? 'sent' : 'failed';
      } catch {
        results[channel] = 'failed';
      }
    }

    const allSent = Object.values(results).every(r => r === 'sent');
    const anySent = Object.values(results).some(r => r === 'sent');
    await doc.ref.update({
      status: allSent ? 'sent' : anySent ? 'partial' : 'failed',
      channelResults: results,
    });
    processed++;
  }

  return processed;
}

export async function getPendingCount(): Promise<number> {
  const snapshot = await adminDb.collection('notification_outbound')
    .where('status', '==', 'pending')
    .count()
    .get();
  return snapshot.data()?.count || 0;
}
