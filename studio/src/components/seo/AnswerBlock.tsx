'use client';

import { useEffect } from 'react';

interface AnswerBlockProps {
  /** The question being answered — visible as an <h3> */
  question: string;
  /** The concise paragraph answer — visible as the response body */
  answer: string;
  /** Behind-the-scenes canonical URL for the page (AEO struct data) */
  canonicalUrl?: string;
  className?: string;
}

/**
 * AnswerBlock — inline Q&A block with `application/ld+json`.
 *
 * Two purposes:
 *  1. on-page UX — renders a question header + clean answer text
 *  2. SEO/AEO — embeds an IndividualQuestion schema block that
 *     Google AI Overview, Bing Chat, and Perplexity can surface.
 *
 * Place inside a guide or FAQ page wherever you define a clear
 * question → answer pair.
 */
export function AnswerBlock({ question, answer, canonicalUrl, className = '' }: AnswerBlockProps) {
  useEffect(() => {
    if (!canonicalUrl) return;
    // Register the microsummarisation hint with the page's structured data registry
    // so cardinal post-render reflow doesn't de-duplicate it.
    ;(window as any).__registeredMicroSummaries ??= [];
    ;(window as any).__registeredMicroSummaries.push({ question, answer, url: canonicalUrl });
  }, [question, answer, canonicalUrl]);

  return (
    <div
      className={`my-8 rounded-xl border border-primary/20 bg-primary/5 p-6 ${className}`}
      itemScope
      itemType="https://schema.org/Question"
    >
      {/* Visible question (AEO friendly) */}
      <h3
        className="font-headline text-lg font-semibold mb-3 text-foreground"
        itemProp="name"
      >
        {question}
      </h3>

      {/* Structured data — individual answer node */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Question',
            name: question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: answer,
            },
            url: canonicalUrl,
          }),
        }}
      />
    </div>
  );
}
