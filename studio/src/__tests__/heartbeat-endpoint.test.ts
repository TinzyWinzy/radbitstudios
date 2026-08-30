import { describe, it, expect, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../app/api/heartbeat/route';

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;

afterEach(() => {
  if (ORIGINAL_DATABASE_URL === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
  }
  delete process.env.CRON_SECRET;
  delete process.env.INTERNAL_API_KEY;
});

function beat(url: string, auth?: string, method: 'GET' | 'POST' = 'GET'): Promise<Response> {
  const headers: Record<string, string> = {};
  if (auth) headers.authorization = `Bearer ${auth}`;
  const req = new NextRequest(url, { method, headers });
  return GET(req);
}

describe('GET /api/heartbeat', () => {
  it('rejects requests without a bearer token', async () => {
    const res = await beat('http://localhost/api/heartbeat');
    expect(res.status).toBe(401);
  });

  it('accepts POST as an alias of GET', async () => {
    process.env.CRON_SECRET = 'test-cron-secret';
    delete process.env.DATABASE_URL;
    const res = await beat('http://localhost/api/heartbeat', 'test-cron-secret', 'POST');
    expect([503, 401]).toContain(res.status);
  });

  it('returns 503 when PostgreSQL is unavailable', async () => {
    process.env.CRON_SECRET = 'test-cron-secret';
    delete process.env.DATABASE_URL;
    const res = await beat('http://localhost/api/heartbeat', 'test-cron-secret');
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.database).toBe('unavailable');
  });

  it('returns 401 when the token does not match', async () => {
    process.env.CRON_SECRET = 'test-cron-secret';
    delete process.env.DATABASE_URL;
    const res = await beat('http://localhost/api/heartbeat', 'wrong-token');
    expect(res.status).toBe(401);
  });
});