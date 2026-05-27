import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { withIpRateLimit } from '@/services/api-rate-limit';

function getPool(): Pool {
  const g = globalThis as unknown as { __radbitPgPool?: Pool };
  if (g.__radbitPgPool) return g.__radbitPgPool;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

  pool.on('error', (err) => {
    console.error('[PostgreSQL] Pool error:', err);
  });

  g.__radbitPgPool = pool;
  return pool;
}

export const POST = withIpRateLimit(
  { windowMs: 60 * 60 * 1000, maxRequests: 10, keyPrefix: 'leads' },
  async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();

      const {
        fullName,
        workEmail,
        companyName,
        industry,
        serviceInterest,
        budgetRange,
        message,
        referralSource,
      } = body;

      if (!fullName || !workEmail) {
        return NextResponse.json(
          { error: 'Full name and work email are required' },
          { status: 400 }
        );
      }

      const pool = getPool();
      const client = await pool.connect();

      try {
        await client.query(
          `INSERT INTO leads (full_name, work_email, company_name, industry, service_interest, budget_range, message, referral_source)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [fullName, workEmail, companyName || null, industry || null, serviceInterest || null, budgetRange || null, message || null, referralSource || null]
        );

        return NextResponse.json({
          success: true,
          message: 'Thank you! We have received your inquiry and will be in touch shortly.',
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('[Leads API] Error:', error);
      return NextResponse.json(
        { error: 'Failed to submit inquiry. Please try again later.' },
        { status: 500 }
      );
    }
  },
);
