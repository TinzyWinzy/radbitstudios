import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockVerifyIdToken = vi.fn();
const mockProcessOutboundQueue = vi.fn();

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

vi.mock('@/services/api-rate-limit', () => ({
  withIpRateLimit: (_config: unknown, handler: (req: NextRequest) => Promise<Response>) => handler,
}));

vi.mock('@/services/notifications/outbound-dispatcher', () => ({
  processOutboundQueue: mockProcessOutboundQueue,
}));

describe('runtime endpoint regressions', () => {
  it('clears the session cookie when refresh-session receives an empty token', async () => {
    const { POST } = await import('@/app/api/auth/refresh-session/route');
    const req = new NextRequest('http://localhost/api/auth/refresh-session', {
      method: 'POST',
      body: JSON.stringify({ idToken: '', expiresIn: 0 }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, cleared: true });
    expect(res.headers.get('set-cookie')).toContain('__session=');
    expect(res.headers.get('set-cookie')).toContain('Max-Age=0');
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('accepts POST requests for the WhatsApp queue cron endpoint', async () => {
    mockProcessOutboundQueue.mockResolvedValueOnce(2);
    const previousSecret = process.env.CRON_SECRET;
    process.env.CRON_SECRET = 'test-cron-secret';

    try {
      const { POST } = await import('@/app/api/cron/process-whatsapp-queue/route');
      const req = new Request('http://localhost/api/cron/process-whatsapp-queue', {
        method: 'POST',
        headers: { authorization: 'Bearer test-cron-secret' },
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.processed).toBe(2);
      expect(body.timestamp).toEqual(expect.any(String));
      expect(mockProcessOutboundQueue).toHaveBeenCalledOnce();
    } finally {
      process.env.CRON_SECRET = previousSecret;
    }
  });
});
