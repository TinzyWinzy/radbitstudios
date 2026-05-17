'use client';

import { useEffect, useRef } from 'react';

interface SchemaScriptProps {
  schemas: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
}

/**
 * SchemaScript — lazy injects one or many `application/ld+json` blocks
 * without cluttering component markup.
 *
 * Usage:
 *   <SchemaScript schemas={[websiteSchema(), faqPageSchema(FAQ_DATA)]} />
 */
export function SchemaScript({ schemas, id }: SchemaScriptProps) {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const normalized = Array.isArray(schemas) ? schemas : [schemas];
    const root = document.getElementById(id ?? 'schema-scripts');
    if (!root) return;

    normalized.forEach((schema) => {
      // Deduplicate by stringifying
      const json = JSON.stringify(schema);
      if (Array.from(root.querySelectorAll('script[type="application/ld+json"]'))
        .some(s => (s as HTMLScriptElement).textContent?.trim() === json)) {
        return;
      }
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = json;
      root.appendChild(script);
    });
  }, [schemas, id]);

  return null;
}
