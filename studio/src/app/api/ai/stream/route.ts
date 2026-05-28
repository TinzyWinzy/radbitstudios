import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { verifySession } from '@/lib/api-auth';
import { validateBody, AiStreamSchema } from '@/lib/api-validation';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GeminiBody {
  contents: { parts: { text: string }[] }[];
  generationConfig: { maxOutputTokens: number; temperature: number };
  systemInstruction?: { parts: { text: string }[] };
}

async function* streamGemini(
  model: string,
  prompt: string,
  systemPrompt?: string,
  maxTokens?: number,
  temperature?: number,
): AsyncGenerator<string> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No Gemini API key configured');

  const modelName = model.includes('/') ? model : `models/${model}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const body: GeminiBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: maxTokens || 2048,
      temperature: temperature ?? 0.7,
    },
  };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;

      try {
        const data = JSON.parse(jsonStr);
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {
        // skip malformed chunks
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifySession(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validation = await validateBody(req, AiStreamSchema);
    if (!validation.success) {
      return validation.response;
    }

    const {
      prompt,
      systemPrompt,
      maxTokens,
      temperature,
      model,
      threadId,
      userId,
    } = validation.data;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          for await (const token of streamGemini(model, prompt, systemPrompt, maxTokens, temperature)) {
            fullContent += token;
            const event = JSON.stringify({ token, done: false });
            controller.enqueue(new TextEncoder().encode(`data: ${event}\n\n`));
          }

          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true, fullContent })}\n\n`));

          if (userId && threadId) {
            try {
              const msgCol = adminDb.collection('conversations').doc(userId)
                .collection('threads').doc(threadId)
                .collection('messages');
              await msgCol.add({
                role: 'assistant',
                content: fullContent,
                tokens: Math.ceil(fullContent.length / 4),
                createdAt: new Date(),
              });
              await adminDb.collection('conversations').doc(userId)
                .collection('threads').doc(threadId)
                .update({ updatedAt: new Date(), messageCount: FieldValue.increment(1) });
            } catch { /* non-critical */ }
          }
        } catch (error: unknown) {
          const errEvent = JSON.stringify({ error: error instanceof Error ? error.message : String(error), done: true });
          controller.enqueue(new TextEncoder().encode(`data: ${errEvent}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
