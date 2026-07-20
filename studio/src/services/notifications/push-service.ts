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
    'mailto:brandontinoz@gmail.com',
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

    const userDoc = await adminDb.collection('users').doc(userId).get();
    const pushSub = userDoc.data()?.pushSubscription as PushSubscriptionData | undefined;

    if (!pushSub?.endpoint) {
      return false;
    }

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

    await webpush.sendNotification(pushSub as any, payload, {
      TTL: 86400,
    });

    return true;
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

  const snapshot = await adminDb
    .collection('users')
    .where('pushSubscription', '!=', null)
    .get();

  let sent = 0;
  for (const doc of snapshot.docs) {
    const ok = await sendPush(doc.id, title, body, link);
    if (ok) sent++;
  }

  return sent;
}
