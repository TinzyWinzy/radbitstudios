import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { aiGateway } from '@/services/ai/ai-gateway';

const SYSTEM_PROMPT = `You are Sekuru Tafadzwa, a warm and experienced business advisor helping Zimbabwean entrepreneurs.

You are having a short conversation with someone to understand their needs. You have already asked one question and they have answered. Now review the full context and decide if you have enough information or need one more clarification.

Respond with valid JSON only — no extra text, no markdown, no code fences.

Output format:
{
  "refinement": {
    "intent": "update the intent if the answer clarified it, otherwise keep it as is",
    "need": "update if clarified",
    "budget": "update if clarified",
    "audience": "update if clarified",
    "industry": "update if clarified",
    "serviceInterest": "update if clarified",
    "timeline": "extract if mentioned, otherwise null"
  },
  "nextQuestion": "if you still need one more piece of info, ask a short natural question here. Otherwise null.",
  "ready": true/false
}

Rules:
- Ask at most one more question. If you have enough context, set ready to true and nextQuestion to null.
- Do not ask more than two follow-up questions total.
- If the budget is still unclear, ask about budget range.
- If the timeline is unclear and matters, ask about timeline.
- If the audience (for themselves or their business) is unclear, clarify it.
- Be warm and brief. One sentence per question.`;
;

export const POST = withIpRateLimit(
  { windowMs: 60 * 60 * 1000, maxRequests: 20, keyPrefix: 'leads-intent-followup' },
  async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const description = (body.description || '').trim();
      const history: Array<{ question: string; answer: string }> = body.history || [];
      const answer = (body.answer || '').trim();

      if (!answer) {
        return NextResponse.json({ error: 'Please provide an answer.' }, { status: 400 });
      }

      const historyText = history
        .map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`)
        .join('\n\n');

      const prompt = `Original description: ${description}\n\nConversation so far:\n${historyText}\n\nLatest answer: ${answer}\n\nReview the full context. Update the classification fields based on everything you know. Decide if you need one more question.`;

      const result = await aiGateway.generate({
        systemPrompt: SYSTEM_PROMPT,
        prompt,
        difficulty: 'simple',
        jsonMode: true,
        maxTokens: 512,
        temperature: 0.4,
      });

      if (result.error || !result.content) {
        return NextResponse.json(
          { error: 'Could not process your response. Please continue to the form.' },
          { status: 422 },
        );
      }

      let parsed;
      try {
        parsed = JSON.parse(result.content);
      } catch {
        return NextResponse.json(
          { error: 'Could not process your response. Please continue to the form.' },
          { status: 422 },
        );
      }

      return NextResponse.json({
        refinement: parsed.refinement || {},
        nextQuestion: parsed.nextQuestion || null,
        ready: parsed.ready === true,
      });
    } catch (error) {
      console.error('[Leads Intent Followup API] Error:', error instanceof Error ? error.message : error);
      return NextResponse.json(
        { error: 'Something went wrong. Please continue to the form.' },
        { status: 500 },
      );
    }
  },
);
