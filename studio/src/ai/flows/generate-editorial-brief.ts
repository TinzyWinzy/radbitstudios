'use server';

import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';

const ConfidenceSchema = z.enum(['High', 'Moderate', 'Low', 'Unknown']);

export const EditorialBriefInputSchema = z.object({
  topic: z.string().min(10).max(500),
  audience: z.string().max(200).optional(),
  firsthandContext: z.string().max(3000).optional(),
  targetKeyword: z.string().max(120).optional(),
});

export const EditorialBriefOutputSchema = z.object({
  title: z.string(),
  slug: z.string(),
  metaDescription: z.string(),
  primaryKeyword: z.string(),
  secondaryKeywords: z.array(z.string()),
  searchIntent: z.string(),
  readerLevel: z.string(),
  excerpt: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    paragraphs: z.array(z.string()),
    confidence: ConfidenceSchema,
  })),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  schemaRecommendations: z.array(z.string()),
  internalLinks: z.array(z.object({ topic: z.string(), reason: z.string() })),
  authoritativeSources: z.array(z.object({ name: z.string(), url: z.string(), purpose: z.string() })),
  suggestedCta: z.string(),
  contentGraph: z.object({
    articlesThatShouldLinkHere: z.array(z.string()),
    articlesThisShouldLinkTo: z.array(z.string()),
    relatedIndustries: z.array(z.string()),
    relatedSolutions: z.array(z.string()),
    relatedAiTopics: z.array(z.string()),
    searchedQuestions: z.array(z.string()),
    missingContent: z.array(z.string()),
  }),
  reviewNotes: z.array(z.string()),
});

export type EditorialBriefInput = z.infer<typeof EditorialBriefInputSchema>;
export type EditorialBriefOutput = z.infer<typeof EditorialBriefOutputSchema>;

export const RADBIT_EDITORIAL_SYSTEM_PROMPT = `You are the Editorial Intelligence Engine for Radbit Studios, a software engineering, AI, business systems and digital transformation studio focused on African businesses.

You are a researcher, systems analyst and technical editor—not an autonomous publisher. Create a strong, review-ready first draft. Never claim firsthand Radbit experience unless it appears in FIRSTHAND CONTEXT. Mark strategic inference clearly and never invent statistics, sources, clients, results or URLs.

Begin with operational friction, not technology. Explain what is happening, why it happens, how we know, alternatives, and the intervention most likely to produce measurable improvement. Write calmly and precisely for intelligent, busy decision makers. Avoid hype, clickbait, fake urgency, emojis and generic AI phrasing.

Keep recommendations realistic for Zimbabwe and broader Africa: limited budgets, WhatsApp-first communication, intermittent connectivity, foreign-currency constraints and small teams. Technical examples are limited to React, Next.js, TypeScript, Node.js, Python, Firebase, Supabase, PostgreSQL, Firestore, Google Cloud, Vercel, PWAs, AI, RAG, automation, cybersecurity, blockchain and software architecture.

Use this evidence hierarchy: direct observation; technical documentation; peer-reviewed research; government publications; industry reports; verified statistics; operational experience; strategic inference; speculation. Assign High, Moderate, Low or Unknown confidence to every section.

Use these sections where relevant: Executive Summary, Problem, Observed Behaviour, Root Cause Analysis, Systems Perspective, Possible Solutions, Recommended Intervention, Implementation Considerations, Common Mistakes, Conclusion. Include an FAQ, SEO plan, source plan, internal links, review flags and a content graph. Output strict JSON only.`;

export async function generateEditorialBrief(rawInput: EditorialBriefInput): Promise<EditorialBriefOutput> {
  const input = EditorialBriefInputSchema.parse(rawInput);
  const result = await aiGateway.generate({
    systemPrompt: RADBIT_EDITORIAL_SYSTEM_PROMPT,
    prompt: `ARTICLE TOPIC\n${input.topic}\n\nAUDIENCE\n${input.audience || 'African business owners and operational decision makers'}\n\nTARGET KEYWORD\n${input.targetKeyword || 'Determine from search intent'}\n\nFIRSTHAND CONTEXT (the only Radbit experience you may present as observed)\n${input.firsthandContext || 'None supplied. Flag where the editor should add firsthand evidence.'}\n\nReturn every field required by the editorial brief schema. Source URLs must be real authoritative domains you are confident exist; otherwise omit the source and add a review note.`,
    difficulty: 'complex',
    maxTokens: 4096,
    temperature: 0.25,
    jsonMode: true,
  });

  const parsed = JSON.parse(result.content);
  return EditorialBriefOutputSchema.parse(parsed);
}
