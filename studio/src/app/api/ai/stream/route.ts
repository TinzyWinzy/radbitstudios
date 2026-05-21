import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  const body: any = {
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
    const body = await req.json();
    const {
      prompt,
      systemPrompt,
      maxTokens,
      temperature,
      model = 'gemini-2.5-flash',
      threadId,
      userId,
    } = body;

    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
        } catch (error: any) {
          const errEvent = JSON.stringify({ error: error.message, done: true });
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
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
