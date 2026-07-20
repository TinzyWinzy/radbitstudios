import webpush from 'web-push';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'PushService' });

const VAPID_PUBLIC_KEY = 'BCyIqROE6j9cAdFTDhbGJSh8GZZZQSWIdY_XTYQER3eTQWy6F4kjbm0F9wFKnvrLTRfk71pFcfJ-A1BFN2eGCmE';

function getVapidPrivateKey(): string {
  const key = process.env.VAPID_PRIVATE_KEY;
  if (!key) {
    throw new Error('VAPID_PRIVATE_KEY environment variable is not set');
  }
  return key;
}

let vapidInitialized = false;

function ensureVapid(): void {
  if (vapidInitialized) return;
  webpush.setVapidDetails(
    'mailto:hello@radbitstudios.co.zw',
    VAPID_PUBLIC_KEY,
    getVapidPrivateKey(),
  );
  vapidInitialized = true;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export async function sendPush(
  userId: string,
  title: string,
  body: string,
  link?: string,
): Promise<boolean> {
  try {
    ensureVapid();

    const deviceSnapshot = await adminDb.collection('push_subscriptions')
      .where('userId', '==', userId)
      .get();
    const subscriptions = deviceSnapshot.docs
      .filter(doc => doc.data().active === true)
      .map(doc => ({ ref: doc.ref, subscription: doc.data().subscription as PushSubscriptionData }));
    if (subscriptions.length === 0) {
      // Temporary migration fallback for subscriptions saved by older clients.
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const legacy = userDoc.data()?.pushSubscription as PushSubscriptionData | undefined;
      if (legacy?.endpoint) subscriptions.push({ ref: userDoc.ref, subscription: legacy });
    }
    if (subscriptions.length === 0) return false;

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: {
        url: link || '/',
        click_action: link || '/',
      },
    });

    let delivered = 0;
    await Promise.all(subscriptions.map(async ({ ref, subscription }) => {
      try {
        await webpush.sendNotification(subscription as any, payload, { TTL: 86400 });
        delivered++;
        if (ref.parent.id === 'push_subscriptions') await ref.update({ lastDeliveredAt: new Date(), updatedAt: new Date() });
      } catch (error: unknown) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          if (ref.parent.id === 'push_subscriptions') await ref.delete();
          else await ref.update({ pushSubscription: null });
        } else {
          log.error({ userId, statusCode, err: error }, 'Push delivery failed for device');
        }
      }
    }));
    return delivered > 0;
  } catch (err: unknown) {
    const statusCode = (err as any)?.statusCode;
    if (statusCode === 410 || statusCode === 404) {
      log.warn({ userId, statusCode }, 'Push subscription expired or gone, clearing');
      await adminDb.collection('users').doc(userId).update({
        pushSubscription: null,
      });
    } else {
      log.error({ userId, err }, 'Push send failed');
    }
    return false;
  }
}

export async function sendPushToAll(
  title: string,
  body: string,
  link?: string,
): Promise<number> {
  ensureVapid();

  const snapshot = await adminDb.collection('push_subscriptions').get();
  const userIds = [...new Set(snapshot.docs.filter(doc => doc.data().active === true).map(doc => doc.data().userId as string).filter(Boolean))];

  let sent = 0;
  for (const userId of userIds) {
    const ok = await sendPush(userId, title, body, link);
    if (ok) sent++;
  }

  return sent;
}
