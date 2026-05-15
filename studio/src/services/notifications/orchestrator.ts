// Notification Orchestrator — channel routing by priority
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

export type NotificationChannel = 'whatsapp' | 'sms' | 'push' | 'email';
export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';

export interface NotificationEvent {
  userId: string;
  template: string;
  data: Record<string, unknown>;
  priority?: NotificationPriority;
  preferredChannel?: NotificationChannel;
}

interface ChannelProvider {
  send(userId: string, template: string, data: Record<string, unknown>): Promise<boolean>;
}

class RateLimiter {
  private counters = new Map<string, { count: number; resetAt: number }>();
  private limits: Record<string, { maxPerDay: number }> = {
    whatsapp: { maxPerDay: 5 },
    sms: { maxPerDay: 3 },
    push: { maxPerDay: 10 },
  };

  async check(channel: string, userId: string): Promise<boolean> {
    const key = `${channel}:${userId}`;
    const limit = this.limits[channel];
    if (!limit) return true;
    const now = Date.now();
    let c = this.counters.get(key);
    if (!c || now > c.resetAt) { c = { count: 0, resetAt: now + 86400000 }; }
    if (c.count >= limit.maxPerDay) return false;
    c.count++;
    this.counters.set(key, c);
    return true;
  }
}

export class NotificationOrchestrator {
  private providers = new Map<NotificationChannel, ChannelProvider>();
  private rateLimiter = new RateLimiter();
  private channelPriorities: Record<NotificationPriority, NotificationChannel[]> = {
    critical: ['whatsapp', 'sms', 'push'],
    high: ['whatsapp', 'push'],
    normal: ['whatsapp'],
    low: ['email'],
  };

  registerProvider(channel: NotificationChannel, provider: ChannelProvider): void {
    this.providers.set(channel, provider);
  }

  async send(event: NotificationEvent): Promise<void> {
    const priority = event.priority || 'normal';
    const channels = event.preferredChannel ? [event.preferredChannel] : this.channelPriorities[priority];

    for (const channel of channels) {
      if (!this.rateLimiter.check(channel, event.userId)) continue;
      const provider = this.providers.get(channel);
      if (!provider) continue;

      try {
        const sent = await provider.send(event.userId, event.template, event.data);
        if (sent) break;
      } catch (error) {
        console.error(`[Notification] ${channel} failed for ${event.userId}:`, error);
      }
    }
  }
}

// WhatsApp provider (Meta Cloud API)
class WhatsAppProvider implements ChannelProvider {
  private baseUrl = 'https://graph.facebook.com/v21.0';

  async send(userId: string, template: string, data: Record<string, unknown>): Promise<boolean> {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) return false;

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const phone = userDoc.data()?.phone;
      if (!phone) return false;

      const res = await fetch(`${this.baseUrl}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: { name: template, language: { code: 'en' }, components: [{ type: 'body', parameters: Object.values(data).map((v) => ({ type: 'text', text: String(v) })) }] },
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

// Push notification provider (Web Push via VAPID)
class PushProvider implements ChannelProvider {
  async send(userId: string, template: string, data: Record<string, unknown>): Promise<boolean> {
    // In production: look up user's push subscription from DB, send via web-push library
    console.log(`[Push] Would send ${template} to ${userId}`, data);
    return false;
  }
}

// Twilio SMS provider
class SMSProvider implements ChannelProvider {
  async send(userId: string, template: string, data: Record<string, unknown>): Promise<boolean> {
    const templates: Record<string, string> = {
      payment_due: `Radbit: Payment of ${data.amount} due. Pay: ${process.env.FRONTEND_URL}/settings`,
      tender_deadline: `Radbit: Tender "${data.title}" closes soon. Apply: ${process.env.FRONTEND_URL}/tenders`,
      otp: `Your Radbit code: ${data.code}`,
    };
    const message = templates[template];
    if (!message) return false;

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const phone = userDoc.data()?.phone;
      if (!phone) return false;

      // In production: call Twilio API
      console.log(`[SMS] To ${phone}: ${message}`);
      return true;
    } catch {
      return false;
    }
  }
}

// Factory
export function createNotificationOrchestrator(): NotificationOrchestrator {
  const orchestrator = new NotificationOrchestrator();
  orchestrator.registerProvider('whatsapp', new WhatsAppProvider());
  orchestrator.registerProvider('push', new PushProvider());
  orchestrator.registerProvider('sms', new SMSProvider());
  return orchestrator;
}
