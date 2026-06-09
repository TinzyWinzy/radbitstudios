import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { validateBody, CreateLeadSchema } from '@/lib/api-validation';
import { createProject } from '@/services/project-service';
import { generateOnboardingChecklist } from '@/services/onboarding-engine';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, limit as fbLimit } from 'firebase/firestore';

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

async function getFirebaseUserByEmail(email: string): Promise<string | null> {
  try {
    const q = query(
      collection(db, 'users'),
      where('email', '==', email),
      fbLimit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].id;
  } catch {
    return null;
  }
}

function detectProjectType(serviceInterest?: string, need?: string): string {
  const map: Record<string, string> = {
    software: 'web',
    cybersecurity: 'consulting',
    strategy: 'consulting',
    brand: 'consulting',
    erp: 'erp',
    ai: 'ai-platform',
    website: 'web',
    'online-store': 'web',
    'business-software': 'erp',
    consulting: 'consulting',
    'ai-tools': 'ai-platform',
  };
  return map[serviceInterest || need || ''] || 'custom';
}

function parseBudget(budgetRange?: string, budget?: string): { value: number; currency: 'USD' | 'ZiG' } {
  const range = budget || budgetRange || 'not-sure';
  const map: Record<string, number> = {
    'under-500': 250,
    '100-500': 300,
    '500-2000': 1250,
    '2000-5000': 3500,
    '5000-10000': 7500,
    'over-10000': 15000,
    '10000+': 15000,
  };
  return { value: map[range] || 0, currency: 'USD' };
}

export const POST = withIpRateLimit(
  { windowMs: 60 * 60 * 1000, maxRequests: 10, keyPrefix: 'leads' },
  async (request: NextRequest): Promise<NextResponse> => {
    try {
      const validation = await validateBody(request, CreateLeadSchema);
      if (!validation.success) return validation.response;

      const { fullName, workEmail, companyName, industry, serviceInterest, budgetRange, message, referralSource, audience, need, budget } = validation.data;

      const pool = getPool();
      const client = await pool.connect();

      let postgresId: string | null = null;

      try {
        const result = await client.query(
          `INSERT INTO leads (full_name, work_email, company_name, industry, service_interest, budget_range, message, referral_source)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [fullName, workEmail, companyName || null, industry || null, serviceInterest || null, budgetRange || null, message || null, referralSource || null]
        );
        postgresId = result.rows[0]?.id || null;
      } catch (pgError) {
        console.warn('[Leads API] PostgreSQL insert failed (non-blocking):', pgError);
      } finally {
        client.release();
      }

      try {
        const firebaseUid = await getFirebaseUserByEmail(workEmail);

        const projectType = detectProjectType(serviceInterest, need);
        const parsedBudget = parseBudget(budgetRange, budget);

        const projectId = await createProject({
          clientId: firebaseUid || `pending:${workEmail}`,
          type: projectType as any,
          status: 'lead',
          packageName: `${fullName} - ${projectType} inquiry`,
          budget: parsedBudget.value,
          currency: parsedBudget.currency,
          persona: audience === 'myself' ? 'individual' : audience === 'my-business' ? 'sme' : 'sme',
          startedAt: null,
          deadline: null,
          completedAt: null,
          assignedTo: null,
          notes: message || '',
        });

        if (audience && need && firebaseUid) {
          await generateOnboardingChecklist(firebaseUid, {
            audience,
            need,
            budget: budget || 'not-sure',
            name: fullName,
            email: workEmail,
            company: companyName,
            industry,
            message,
          }).catch((err) => console.warn('[Leads API] Checklist generation failed:', err));
        }

        return NextResponse.json({
          success: true,
          message: 'Thank you! We have received your inquiry and will be in touch shortly.',
          projectId,
          postgresId,
        });
      } catch (firestoreError) {
        console.warn('[Leads API] Firestore project creation failed (non-blocking):', firestoreError);
        return NextResponse.json({
          success: true,
          message: 'Thank you! We have received your inquiry and will be in touch shortly.',
        });
      }
    } catch (error: unknown) {
      console.error('[Leads API] Error:', error instanceof Error ? error.message : error);
      return NextResponse.json(
        { error: 'Failed to submit inquiry. Please try again later.' },
        { status: 500 }
      );
    }
  },
);
