'use client';

import { useState, useRef, useCallback } from 'react';

interface StreamingState {
  content: string;
  isStreaming: boolean;
  error: string | null;
}

export function useStreamingAI() {
  const [state, setState] = useState<StreamingState>({ content: '', isStreaming: false, error: null });
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(async (params: {
    prompt: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    model?: string;
    threadId?: string;
    userId?: string;
    onToken?: (token: string) => void;
  }) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ content: '', isStreaming: true, error: null });

    try {
      const res = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Stream request failed');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              setState({ content: data.fullContent || fullContent, isStreaming: false, error: data.error || null });
              break;
            }
            if (data.token) {
              fullContent += data.token;
              setState({ content: fullContent, isStreaming: true, error: null });
              params.onToken?.(data.token);
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      if (err?.name === 'AbortError') {
        setState(prev => ({ ...prev, isStreaming: false }));
      } else {
        const message = error instanceof Error ? error.message : String(error);
        setState({ content: '', isStreaming: false, error: message });
      }
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ content: '', isStreaming: false, error: null });
  }, []);

  return { ...state, stream, cancel, reset };
}
