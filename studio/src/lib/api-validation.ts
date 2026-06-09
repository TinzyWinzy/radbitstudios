/* ── API Request Validation Schemas ──────────────────────────────────────
   Central Zod schemas for all API route request bodies.
   ─────────────────────────────────────────────────────────────────── */

import { z } from 'zod';

// ── Auth ─────────────────────────────────────────────────────────────────

export const RefreshSessionSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
  expiresIn: z.number().int().positive().optional().default(3600),
});

export const DeleteAccountSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
  exportOnly: z.boolean().optional(),
});

// ── Leads ────────────────────────────────────────────────────────────────

export const CreateLeadSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  workEmail: z.string().email('Valid email required').max(300),
  companyName: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  serviceInterest: z.string().max(200).optional(),
  budgetRange: z.string().max(100).optional(),
  message: z.string().max(5000).optional(),
  referralSource: z.string().max(200).optional(),
  audience: z.enum(['myself', 'my-business', 'not-sure']).optional(),
  need: z.enum(['website', 'online-store', 'business-software', 'consulting', 'ai-tools', 'not-sure']).optional(),
  budget: z.enum(['under-500', '500-2000', '2000-10000', 'over-10000', 'not-sure']).optional(),
});

// ── PRAZ ─────────────────────────────────────────────────────────────────

export const PrazDocumentSchema = z.object({
  docType: z.string().min(1, 'docType is required'),
  fileName: z.string().min(1, 'fileName is required').max(500),
  fileUrl: z.string().url('Valid URL required').max(2000),
  expiresAt: z.string().datetime().optional(),
});

export const PrazDeleteSchema = z.object({
  docType: z.string().min(1, 'docType is required'),
});

// ── AI ───────────────────────────────────────────────────────────────────

export const AiStreamSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(32000),
  systemPrompt: z.string().max(16000).optional(),
  maxTokens: z.number().int().min(1).max(8192).optional(),
  temperature: z.number().min(0).max(2).optional(),
  model: z.string().max(100).optional().default('gemini-2.5-flash'),
  threadId: z.string().max(200).optional(),
  userId: z.string().max(200).optional(),
});

// ── Analytics ────────────────────────────────────────────────────────────

export const AnalyticsTrackSchema = z.object({
  event: z.string().min(1).max(200),
  path: z.string().min(1).max(2000),
  userId: z.string().max(200).optional(),
  timestamp: z.string().datetime().optional(),
  properties: z.record(z.unknown()).optional(),
});

// ── Payments ─────────────────────────────────────────────────────────────

export const CreateSubscriptionSchema = z.object({
  action: z.literal('create-subscription'),
  plan: z.enum(['free', 'growth', 'pro', 'enterprise']),
  billingPeriod: z.enum(['monthly', 'quarterly', 'annual']),
  country: z.string().min(2).max(3),
  currency: z.string().min(3).max(3),
});

export const CancelSubscriptionSchema = z.object({
  action: z.literal('cancel-subscription'),
  subscriptionId: z.string().min(1),
  immediately: z.boolean().optional(),
});

export const RetryPaymentSchema = z.object({
  action: z.literal('retry-payment'),
  subscriptionId: z.string().min(1),
});

export const InitiatePaymentSchema = z.object({
  action: z.literal('initiate-payment'),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3),
  description: z.string().max(500).optional(),
  reference: z.string().max(200).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const PaymentActionSchema = z.discriminatedUnion('action', [
  CreateSubscriptionSchema,
  CancelSubscriptionSchema,
  RetryPaymentSchema,
  InitiatePaymentSchema,
]);

// ── Admin ────────────────────────────────────────────────────────────────

export const SetRoleSchema = z.object({
  uid: z.string().min(1, 'uid is required'),
  role: z.enum(['sme_owner', 'sme_staff', 'admin', 'super_admin']),
});

// ── Partners ─────────────────────────────────────────────────────────────

export const PartnerValidatePostSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
  partnerCode: z.string().min(1, 'partnerCode is required').max(50),
});

export const PartnerValidateGetSchema = z.object({
  code: z.string().min(1, 'code is required').max(50),
});

// ── Diaspora ─────────────────────────────────────────────────────────────

export const DiasporaProfileSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
  countryOfResidence: z.string().min(1).max(100),
  maxTicketSize: z.string().min(1).max(100),
  targetSectors: z.array(z.string().max(100)).min(1).max(20),
});

// ── WhatsApp ─────────────────────────────────────────────────────────────

export const ScheduleDigestSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  idToken: z.string().min(1, 'idToken is required'),
});

// ── Referral ─────────────────────────────────────────────────────────────

export const ApplyReferralSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
  referralCode: z.string().min(1).max(50),
});

export const GenerateReferralSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
});

// ── Discovery ────────────────────────────────────────────────────────────

export const DiscoverySourcePatchSchema = z.object({
  sourceId: z.string().min(1, 'sourceId is required'),
  action: z.enum(['approve', 'reject']),
  feedUrl: z.string().url().optional(),
});

// ── Validation helper ────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';

/**
 * Validate request body against a Zod schema.
 * Returns the parsed data or a 400 response.
 */
export async function validateBody<T extends z.ZodType>(
  req: NextRequest,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: NextResponse }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      return {
        success: false,
        response: NextResponse.json({ error: `Validation failed: ${errors}` }, { status: 400 }),
      };
    }
    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }),
    };
  }
}

/**
 * Validate URL search params against a Zod schema.
 */
export function validateParams<T extends z.ZodType>(
  url: URL,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => { params[key] = value; });
  const result = schema.safeParse(params);
  if (!result.success) {
    const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    return {
      success: false,
      response: NextResponse.json({ error: `Validation failed: ${errors}` }, { status: 400 }),
    };
  }
  return { success: true, data: result.data };
}
