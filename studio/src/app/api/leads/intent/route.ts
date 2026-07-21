import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { aiGateway } from '@/services/ai/ai-gateway';

const SYSTEM_PROMPT = `You are Sekuru Tafadzwa, a warm and experienced business advisor helping Zimbabwean entrepreneurs.

Your job is to understand what someone needs by reading their description and responding with structured data.

Read the user's description carefully. Then respond with valid JSON only — no extra text, no markdown, no code fences.

Extract these fields from the description:
- intent: one of "hire" (they want custom software built), "pilot" (they run a Zim SME and want to try Radbit Ops), "consulting" (they need strategy or advice), "other" (does not fit above)
- need: one of "website", "online-store", "business-software", "consulting", "ai-tools", "not-sure"
- audience: one of "myself", "my-business", "not-sure"
- budget: one of "under-500", "500-2000", "2000-10000", "over-10000", "not-sure" — infer from context if possible, otherwise "not-sure"
- industry: the industry they operate in, or null if unclear
- serviceInterest: a short phrase describing what service they need, or null
- summary: a one-sentence summary of what they need, written in first person from their perspective
- question: one short follow-up question you would ask to clarify something important (budget, timeline, audience). Be conversational, not robotic. Ask only what is genuinely unclear.

Rules:
- If the intent is clearly "pilot" (SME looking for existing tools, not custom build), set need to "not-sure"
- If they mention specific software features, custom development, or building something, lean toward "hire"
- If they are unsure, lean toward "pilot" — Radbit Ops is designed for SMEs who are still figuring things out
- Keep question short — one sentence, natural tone, like Sekuru would say it

Example output:
{"intent":"hire","need":"business-software","audience":"my-business","budget":"500-2000","industry":"construction","serviceInterest":"tender management software","summary":"I need a system to track and manage tender submissions for my construction company.","question":"What budget range are you working with for this system?"}`;

const CLASSIFY_PROMPT = `Read this description and classify it:

DESCRIPTION:
`;

export const POST = withIpRateLimit(
  { windowMs: 60 * 60 * 1000, maxRequests: 20, keyPrefix: 'leads-intent' },
  async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const description = (body.description || '').trim();
      if (!description || description.length < 3) {
        return NextResponse.json({ error: 'Please describe what you need.' }, { status: 400 });
      }
      if (description.length > 3000) {
        return NextResponse.json({ error: 'Description too long. Please keep it under 3000 characters.' }, { status: 400 });
      }

      const result = await aiGateway.generate({
        systemPrompt: SYSTEM_PROMPT,
        prompt: `${CLASSIFY_PROMPT}${description}`,
        difficulty: 'simple',
        jsonMode: true,
        maxTokens: 512,
        temperature: 0.4,
      });

      if (result.error || !result.content) {
        return NextResponse.json(
          { error: 'Could not process your request. Please fill in the form directly.' },
          { status: 422 },
        );
      }

      let parsed;
      try {
        parsed = JSON.parse(result.content);
      } catch {
        return NextResponse.json(
          { error: 'Could not process your request. Please fill in the form directly.' },
          { status: 422 },
        );
      }

      return NextResponse.json({
        intent: parsed.intent || 'other',
        need: parsed.need || 'not-sure',
        audience: parsed.audience || 'not-sure',
        budget: parsed.budget || 'not-sure',
        industry: parsed.industry || null,
        serviceInterest: parsed.serviceInterest || null,
        summary: parsed.summary || '',
        question: parsed.question || 'Tell me more about what you are looking for.',
      });
    } catch (error) {
      console.error('[Leads Intent API] Error:', error instanceof Error ? error.message : error);
      return NextResponse.json(
        { error: 'Something went wrong. Please fill in the form directly.' },
        { status: 500 },
      );
    }
  },
);
