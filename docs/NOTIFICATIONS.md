# WhatsApp & Notification System — Radbit SME Hub

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Notification Orchestrator                        │
│                                                                      │
│  Event Sources:                                                      │
│   - TenderMatcher (new matching tenders)                             │
│   - AssessmentTimer (user inactive)                                  │
│   - PaymentHandler (invoice, receipt)                                │
│   - Community (reply notification)                                   │
│   - ComplianceCalendar (tax due date)                                │
│   - AICredits (low balance, result ready)                            │
│                                                                      │
│  Router: Priority → Channel                                          │
│   - Critical: WhatsApp + SMS + Push                                  │
│   - High: WhatsApp + Push                                            │
│   - Normal: WhatsApp only                                            │
│   - Low: Email digest                                                 │
└──────────────────────────────────────────────────────────────────────┘
    │                        │                      │
    ▼                        ▼                      ▼
┌────────────┐        ┌────────────┐        ┌──────────────┐
│  WhatsApp  │        │    SMS     │        │  Web Push    │
│  Provider  │        │  Provider  │        │  (FCM/PWA)   │
│  (Meta API)│        │ (Twilio /  │        │              │
│            │        │  Africa's  │        │              │
│            │        │  Talking)  │        │              │
└────────────┘        └────────────┘        └──────────────┘
```

## WhatsApp Message Templates

```json
{
  "templates": [
    {
      "name": "tender_daily_digest",
      "language": "en",
      "category": "MARKETING",
      "components": [
        {
          "type": "HEADER",
          "format": "TEXT",
          "text": "Today's Tender Matches"
        },
        {
          "type": "BODY",
          "text": "Good morning {{1}}!\n\nHere are today's top tender matches for {{2}}:\n\n{{3}}\n\nTap \"View on Radbit\" to see details and apply.\n\n— Radbit SME Hub Team"
        },
        {
          "type": "BUTTON",
          "buttons": [{ "type": "URL", "text": "View on Radbit", "url": "https://app.radbitsmehub.co.zw/tenders?utm_source=whatsapp&utm_medium=digest" }]
        }
      ]
    },
    {
      "name": "assessment_reminder",
      "language": "en",
      "category": "MARKETING",
      "components": [
        {
          "type": "HEADER",
          "format": "TEXT",
          "text": "Complete Your Assessment"
        },
        {
          "type": "BODY",
          "text": "Hi {{1}}!\n\nYou're {{2}}% done with your Digital Readiness Assessment. It only takes 5 more minutes to unlock your personalized business insights.\n\nTap below to continue where you left off."
        },
        {
          "type": "BUTTON",
          "buttons": [{ "type": "URL", "text": "Continue Assessment", "url": "https://app.radbitsmehub.co.zw/assessment?resume=true" }]
        }
      ]
    },
    {
      "name": "payment_invoice",
      "language": "en",
      "category": "TRANSACTIONAL",
      "components": [
        {
          "type": "HEADER",
          "format": "DOCUMENT"
        },
        {
          "type": "BODY",
          "text": "Hi {{1}},\n\nYour invoice for {{2}} ({{3}}) is attached.\n\nAmount: {{4}} {{5}}\nDue: {{6}}\n\nThank you for using Radbit SME Hub."
        }
      ]
    }
  ]
}
```

## Notification Service

```typescript
// src/services/notifications/notification.service.ts

export type NotificationChannel = 'whatsapp' | 'sms' | 'push' | 'email';
export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';

interface NotificationEvent {
  userId: string;
  template: string;
  data: Record<string, unknown>;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
}

interface NotificationChannelProvider {
  send(userId: string, template: string, data: Record<string, unknown>): Promise<boolean>;
}

export class NotificationOrchestrator {
  private channels: Map<NotificationChannel, NotificationChannelProvider> = new Map();
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter({
      whatsapp: { maxPerDay: 5, maxPerHour: 2 },
      sms: { maxPerDay: 3, maxPerHour: 1 },
      push: { maxPerDay: 10, maxPerHour: 5 },
    });
  }

  registerChannel(name: NotificationChannel, provider: NotificationChannelProvider): void {
    this.channels.set(name, provider);
  }

  async send(event: NotificationEvent): Promise<void> {
    const priority = event.priority || 'normal';
    const channels = this.getChannelsForPriority(priority, event.channels);
    const userPrefs = await this.getUserPreferences(event.userId);

    for (const channel of channels) {
      if (!this.shouldSend(channel, userPrefs)) continue;
      if (!await this.rateLimiter.check(channel, event.userId)) continue;

      try {
        const provider = this.channels.get(channel);
        if (!provider) continue;

        const sent = await provider.send(event.userId, event.template, event.data);
        if (sent) {
          await this.logDelivery(event.userId, channel, event.template, 'sent');
          break;  // Stop after first successful channel
        }
      } catch (error) {
        console.error(`Failed to send via ${channel}:`, error);
        await this.logDelivery(event.userId, channel, event.template, 'failed');
        // Continue to next channel
      }
    }
  }

  private getChannelsForPriority(priority: NotificationPriority, preferred?: NotificationChannel[]): NotificationChannel[] {
    if (preferred?.length) return preferred;

    switch (priority) {
      case 'critical': return ['whatsapp', 'sms', 'push'];
      case 'high':     return ['whatsapp', 'push'];
      case 'normal':   return ['whatsapp'];
      case 'low':      return ['email'];
    }
  }

  private shouldSend(channel: NotificationChannel, prefs: UserPreferences): boolean {
    if (channel === 'whatsapp' && !prefs.whatsappOptIn) return false;
    if (channel === 'sms' && !prefs.smsOptIn) return false;
    if (channel === 'push' && !prefs.pushEnabled) return false;
    return true;
  }
}
```

## WhatsApp Menu State Machine

```typescript
// src/services/notifications/whatsapp/state-machine.ts

// User: "Menu"
// Bot: "1. Tenders 2. Assessment 3. AI Tools 4. My Account 0. Main Menu"

interface ConversationState {
  userId: string;
  currentMenu: string;
  context: Record<string, unknown>;
  lastInteraction: Date;
  failedAttempts: number;
}

type MenuAction = (input: string, state: ConversationState) => Promise<MenuResponse>;

interface MenuResponse {
  text: string;
  media?: { type: 'image' | 'document'; url: string };
  actions?: { type: 'button' | 'list'; items: { id: string; title: string }[] };
  newMenu?: string;
  escalate?: boolean;
}

class WhatsAppMenuSystem {
  private menus = new Map<string, MenuAction>();
  private states = new Map<string, ConversationState>();
  private readonly MAX_FAILED_ATTEMPTS = 2;

  constructor() {
    this.registerMenu('main', this.handleMainMenu);
    this.registerMenu('tenders', this.handleTendersMenu);
    this.registerMenu('assessment', this.handleAssessmentMenu);
    this.registerMenu('ai_tools', this.handleAiToolsMenu);
    this.registerMenu('account', this.handleAccountMenu);
  }

  registerMenu(name: string, handler: MenuAction): void {
    this.menus.set(name, handler);
  }

  async processMessage(userId: string, text: string): Promise<MenuResponse> {
    let state = this.states.get(userId) || {
      userId, currentMenu: 'main',
      context: {}, lastInteraction: new Date(), failedAttempts: 0,
    };

    // Handle "Menu" or "0" → reset to main
    if (text.toLowerCase() === 'menu' || text === '0') {
      state.currentMenu = 'main';
      state.failedAttempts = 0;
    }

    const handler = this.menus.get(state.currentMenu);
    if (!handler) {
      state.currentMenu = 'main';
      return this.getMainMenuResponse();
    }

    try {
      const response = await handler(text, state);
      if (response.newMenu) state.currentMenu = response.newMenu;
      state.lastInteraction = new Date();
      state.failedAttempts = 0;
      this.states.set(userId, state);
      return response;
    } catch (error) {
      state.failedAttempts++;
      this.states.set(userId, state);

      if (state.failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
        return {
          text: "I'm having trouble understanding. Let me connect you with our support team.",
          escalate: true,
        };
      }
      return {
        text: "Sorry, I didn't understand that. Reply with the number of your choice, or type 'Menu' to start over.",
        actions: { type: 'list', items: [{ id: '0', title: 'Main Menu' }] },
      };
    }
  }

  private getMainMenuResponse(): MenuResponse {
    return {
      text: `🤖 *Radbit SME Hub - Main Menu*\n\nReply with a number:\n\n1️⃣ *Tenders* - Latest matching tenders\n2️⃣ *Assessment* - Check your score or continue\n3️⃣ *AI Tools* - Generate business content\n4️⃣ *My Account* - Credits, plan, settings\n\nOr type your question directly!`,
      actions: {
        type: 'button',
        items: [
          { id: '1', title: 'Tenders' },
          { id: '2', title: 'Assessment' },
          { id: '3', title: 'AI Tools' },
          { id: '4', title: 'My Account' },
        ],
      },
    };
  }

  private async handleMainMenu(input: string, state: ConversationState): Promise<MenuResponse> {
    const routes: Record<string, string> = {
      '1': 'tenders', '2': 'assessment', '3': 'ai_tools', '4': 'account',
    };
    const menu = routes[input.trim()];
    if (menu) return { text: '', newMenu: menu };
    // Otherwise treat as free-form query → route to AI Mentor
    return this.handleFreeFormQuery(input, state);
  }

  private async handleTendersMenu(input: string, state: ConversationState): Promise<MenuResponse> {
    if (input === '1' || input.toLowerCase() === 'today') {
      // Fetch today's tenders via API
      const tenders = await this.fetchMatchingTenders(state.userId);
      return {
        text: `📋 *Today's Matching Tenders*\n\n${tenders.slice(0, 3).map((t, i) =>
          `${i + 1}. *${t.title}*\n   Deadline: ${t.deadline}\n   Budget: ${t.budgetRange}\n   View: app.radbitsmehub.co.zw/tenders/${t.id}`
        ).join('\n\n')}\n\nReply with a number for details, or 0 for Main Menu.`,
      };
    }
    return { text: '', newMenu: 'main' };
  }

  private async handleFreeFormQuery(query: string, state: ConversationState): Promise<MenuResponse> {
    // Route to AI Mentor with context
    // If AI fails twice, escalate to human support
    const response = await this.aiMentor.answer(state.userId, query);
    return { text: response.text };
  }

  private async fetchMatchingTenders(userId: string): Promise<TenderSummary[]> {
    // Fetch from Meilisearch or PostgreSQL
    return [];
  }
}
```

## WhatsApp Webhook Handler

```typescript
// src/services/notifications/whatsapp/webhook.ts

import crypto from 'crypto';

export class WhatsAppWebhookHandler {
  private readonly verifyToken = process.env.WHATSAPP_VERIFY_TOKEN!;
  private readonly appSecret = process.env.WHATSAPP_APP_SECRET!;
  private menuSystem: WhatsAppMenuSystem;

  constructor() {
    this.menuSystem = new WhatsAppMenuSystem();
  }

  // Meta Cloud API webhook verification
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      return challenge;
    }
    return null;
  }

  // Process incoming webhook payload
  async processWebhook(payload: WhatsAppWebhookPayload): Promise<void> {
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages') continue;

        for (const message of change.value.messages || []) {
          await this.handleMessage(message, change.value.metadata);
        }

        for (const status of change.value.statuses || []) {
          await this.handleStatusUpdate(status);
        }
      }
    }
  }

  private async handleMessage(message: WhatsAppMessage, metadata: WhatsAppMetadata): Promise<void> {
    const userId = message.from;

    switch (message.type) {
      case 'text':
        await this.menuSystem.processMessage(userId, message.text.body);
        break;
      case 'interactive':
        const reply = message.interactive.button_reply || message.interactive.list_reply;
        await this.menuSystem.processMessage(userId, reply.id);
        break;
      case 'document':
      case 'image':
        // Forward attachments (receipts, invoices) to Document Parser
        await this.handleAttachment(userId, message);
        break;
    }
  }

  private async handleStatusUpdate(status: WhatsAppStatus): Promise<void> {
    // Track delivery: sent, delivered, read, failed
    await this.logDeliveryStatus(status);
  }
}
```

## Rate Limiting

```typescript
// src/services/notifications/rate-limiter.ts

export class RateLimiter {
  private limits: Record<string, { maxPerDay: number; maxPerHour: number }>;
  private counters: Map<string, { daily: number; hourly: number; resetAt: number }>;

  constructor(limits: Record<string, { maxPerDay: number; maxPerHour: number }>) {
    this.limits = limits;
    this.counters = new Map();
  }

  async check(channel: string, userId: string): Promise<boolean> {
    const key = `${channel}:${userId}`;
    const limit = this.limits[channel];
    if (!limit) return true;

    const now = Date.now();
    let counter = this.counters.get(key);

    if (!counter || now > counter.resetAt) {
      counter = { daily: 0, hourly: 0, resetAt: now + 3600000 };
    }

    if (counter.daily >= limit.maxPerDay) return false;
    if (counter.hourly >= limit.maxPerHour) return false;

    counter.daily++;
    counter.hourly++;
    this.counters.set(key, counter);
    return true;
  }
}
```

## SMS Fallback (Twilio / Africa's Talking)

```typescript
// src/services/notifications/providers/sms.provider.ts

import twilio from 'twilio';

export class SMSProvider implements NotificationChannelProvider {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!);
  }

  async send(userId: string, template: string, data: Record<string, unknown>): Promise<boolean> {
    const user = await this.getUserPhone(userId);
    if (!user?.phone) return false;

    const message = this.compileTemplate(template, data);
    if (message.length > 160) {
      // Truncate or split into multiple messages
    }

    try {
      await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE!,
        to: user.phone,
      });
      return true;
    } catch (error) {
      console.error('SMS send failed:', error);
      return false;
    }
  }

  private compileTemplate(template: string, data: Record<string, unknown>): string {
    const templates: Record<string, string> = {
      payment_due: `Radbit: Payment of ${data.amount} ${data.currency} due. Pay now: ${data.link}`,
      tender_deadline: `Radbit: "${data.title}" closes ${data.deadline}. Apply: ${data.link}`,
      otp: `Your Radbit verification code is: ${data.code}`,
    };
    return templates[template] || 'Message from Radbit SME Hub. Reply HELP for help.';
  }
}
```

## Delivery Analytics

```typescript
// src/services/notifications/analytics.ts

export class NotificationAnalytics {
  async getStats(userId?: string, dateFrom?: Date, dateTo?: Date): Promise<DeliveryReport> {
    // Query from notification_logs table
    const result = await db.query(`
      SELECT
        channel,
        status,
        COUNT(*) as count,
        AVG(EXTRACT(EPOCH FROM (delivered_at - sent_at))) as avg_delivery_time_seconds
      FROM notification_logs
      WHERE created_at BETWEEN $1 AND $2
        ${userId ? 'AND user_id = $3' : ''}
      GROUP BY channel, status
    `, [dateFrom, dateTo, userId]);

    return this.aggregateReport(result.rows);
  }
}

interface DeliveryReport {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  byChannel: {
    whatsapp: ChannelStats;
    sms: ChannelStats;
    push: ChannelStats;
    email: ChannelStats;
  };
}

interface ChannelStats {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  avgDeliveryTimeMs: number;
}
```

## Push Notification (PWA via FCM)

```typescript
// src/services/notifications/providers/push.provider.ts

import webpush from 'web-push';

export class PushProvider implements NotificationChannelProvider {
  constructor() {
    webpush.setVapidDetails(
      'mailto:support@radbitsmehub.co.zw',
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
  }

  async send(userId: string, template: string, data: Record<string, unknown>): Promise<boolean> {
    const subscriptions = await this.getUserPushSubscriptions(userId);
    if (!subscriptions.length) return false;

    const payload = JSON.stringify({
      title: this.getTitle(template),
      body: this.getBody(template, data),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { url: data.link as string || '/' },
    });

    let sent = false;
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
        sent = true;
      } catch (error: any) {
        if (error.statusCode === 410) {
          // Subscription expired, remove from DB
          await this.removePushSubscription(sub.endpoint);
        }
      }
    }
    return sent;
  }
}
```
