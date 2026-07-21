import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { validateBody, CreateLeadSchema } from '@/lib/api-validation';
import { createProject } from '@/services/project-service-admin';
import { generateOnboardingChecklist } from '@/services/onboarding-engine';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, limit as fbLimit } from 'firebase/firestore';
import { sendEmail } from '@/services/email-service';
import { sendWhatsAppMessage } from '@/services/whatsapp/whatsapp-handler';

const ADMIN_EMAILS = ['brandontinoz@gmail.com', 'hanzohanic@gmail.com'];
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || '263781334474';

function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
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

async function tryInsertLead(data: {
  fullName: string;
  workEmail: string;
  companyName?: string | null;
  industry?: string | null;
  serviceInterest?: string | null;
  budgetRange?: string | null;
  message?: string | null;
  referralSource?: string | null;
}): Promise<string | null> {
  const pool = getPool();
  if (!pool) return null;

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO leads (full_name, work_email, company_name, industry, service_interest, budget_range, message, referral_source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [data.fullName, data.workEmail, data.companyName, data.industry, data.serviceInterest, data.budgetRange, data.message, data.referralSource]
      );
      return result.rows[0]?.id || null;
    } finally {
      client.release();
    }
  } catch (pgError) {
    console.warn('[Leads API] PostgreSQL insert failed (non-blocking):', pgError);
    return null;
  }
}

function leadEmailHtml(data: {
  fullName: string; workEmail: string; companyName?: string | null;
  industry?: string | null; serviceInterest?: string | null;
  budgetRange?: string | null; message?: string | null;
}): string {
  const items = [
    ['Name', data.fullName],
    ['Email', data.workEmail],
    ['Company', data.companyName],
    ['Industry', data.industry],
    ['Service Interest', data.serviceInterest],
    ['Budget Range', data.budgetRange],
    ['Message', data.message],
  ].filter(([, v]) => v);
  const rows = items.map(([k, v]) =>
    `<tr><td style="padding:6px 12px;border-bottom:1px solid #333;color:#999;font-size:13px">${k}</td><td style="padding:6px 12px;border-bottom:1px solid #333;color:#fff;font-size:13px">${v}</td></tr>`
  ).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,sans-serif;background:#0a0a0a;color:#e5e0d8;padding:40px 20px"><div style="max-width:480px;margin:0 auto;background:#111;border-radius:12px;padding:32px;border:1px solid #333"><h2 style="color:#fff;margin:0 0 16px">New Lead</h2><table style="width:100%;border-collapse:collapse">${rows}</table></div></body></html>`;
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

      const leadData = {
        fullName, workEmail,
        companyName: companyName || null,
        industry: industry || null,
        serviceInterest: serviceInterest || null,
        budgetRange: budgetRange || null,
        message: message || null,
        referralSource: referralSource || null,
      };

      // 1. Store in Firestore leads collection
      const leadRef = await adminDb.collection('leads').add({
        ...leadData,
        audience: audience || null,
        need: need || null,
        budget: budget || null,
        createdAt: new Date(),
        status: 'new',
      });

      // 2. Try PostgreSQL (non-blocking fallback)
      const postgresId = await tryInsertLead(leadData);

      // 3. Notify admins via email
      for (const email of ADMIN_EMAILS) {
        sendEmail(
          email,
          `New lead: ${fullName}`,
          leadEmailHtml({ ...leadData, fullName, workEmail }),
        ).catch((err) => console.error('[Leads API] Email notification failed:', err));
      }

      // 4. Notify admin via WhatsApp
      sendWhatsAppMessage(
        ADMIN_WHATSAPP,
        `New lead: ${fullName} (${workEmail})${companyName ? ` - ${companyName}` : ''}${serviceInterest ? `\nInterested in: ${serviceInterest}` : ''}`,
      ).catch(() => {});

      // 5. Create Firestore project + checklist
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
          leadId: leadRef.id,
        });
      } catch (firestoreError) {
        console.warn('[Leads API] Firestore project creation failed (non-blocking):', firestoreError);
        return NextResponse.json({
          success: true,
          message: 'Thank you! We have received your inquiry and will be in touch shortly.',
          leadId: leadRef.id,
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
