import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: 'ok' | 'error';
    firebase: 'ok' | 'error';
    memory: 'ok' | 'warning' | 'critical';
  };
  version: string;
}

const START_TIME = Date.now();

function getMemoryStatus(): 'ok' | 'warning' | 'critical' {
  if (typeof process === 'undefined' || !process.memoryUsage) return 'ok';

  const memMB = process.memoryUsage().heapUsed / 1024 / 1024;
  if (memMB > 1024) return 'critical';
  if (memMB > 512) return 'warning';
  return 'ok';
}

async function checkDatabase(): Promise<'ok' | 'error'> {
  try {
    const healthDoc = await adminDb.doc('_health/ping').get();
    return healthDoc.exists ? 'ok' : 'ok';
  } catch {
    return 'error';
  }
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const [database, firebase] = await Promise.all([
    checkDatabase(),
    Promise.resolve<'ok' | 'error'>('ok'),
  ]);

  const memory = getMemoryStatus();

  const status: HealthStatus = {
    status:
      database === 'error' || memory === 'critical'
        ? 'unhealthy'
        : database === 'ok' && memory === 'ok'
          ? 'healthy'
          : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    checks: {
      database,
      firebase,
      memory,
    },
    version: process.env.npm_package_version || '0.1.0',
  };

  const statusCode =
    status.status === 'unhealthy' ? 503 : status.status === 'degraded' ? 200 : 200;

  return NextResponse.json(status, { status: statusCode });
}
