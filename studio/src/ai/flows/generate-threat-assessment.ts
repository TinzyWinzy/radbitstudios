import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';

export const ThreatAssessmentInputSchema = z.object({
  triggerTitle: z.string().describe('Headline of the detected policy shift or compliance update'),
  triggerSummary: z.string().describe('Summary of what changed and when'),
  triggerSource: z.string().describe('Source name (PRAZ, SADC, Zimbabwe AI Strategy, etc.)'),
  triggerDate: z.string().describe('Date of the trigger event'),
  triggerCategory: z.enum(['praz', 'sadc', 'ai_strategy', 'afcfta', 'zimra', 'rbz', 'nssa', 'general']),
  targetIndustry: z.string().optional().describe('Specific SADC industry affected, if any'),
});
export type ThreatAssessmentInput = z.infer<typeof ThreatAssessmentInputSchema>;

export const ThreatAssessmentOutputSchema = z.object({
  holon: z.object({
    holon_type: z.literal('threat_assessment_page'),
    metadata: z.object({
      target_keyword: z.string(),
      trigger_event: z.string(),
      trigger_source: z.string(),
      generated_at: z.string(),
      risk_level: z.enum(['critical', 'high', 'medium', 'low']),
    }),
    hero_section: z.object({
      h1_headline: z.string(),
      sub_headline: z.string(),
    }),
    diagnostic_widget: z.object({
      widget_title: z.string(),
      prompt_text: z.string(),
      underlying_radbit_solution: z.string(),
    }),
    market_reality_copy: z.object({
      paragraph_1: z.string(),
      paragraph_2: z.string(),
    }),
    pillar_mapping: z.object({
      primary_pillar: z.enum(['simbare_engine', 'executive_multiplier', 'global_passport']),
      secondary_pillar: z.enum(['simbare_engine', 'executive_multiplier', 'global_passport']).optional(),
      armor_layer: z.string(),
    }),
  }),
});
export type ThreatAssessmentOutput = z.infer<typeof ThreatAssessmentOutputSchema>;

const CATEGORY_INSTRUCTIONS: Record<string, string> = {
  praz: `The user is monitoring the Procurement Regulatory Authority of Zimbabwe (PRAZ) and the eGP (electronic Government Procurement) system. New compliance standards, disqualification metrics, and threshold changes directly threaten SMEs who rely on manual ledgers. Your copy must convey that manual processes are becoming a disqualifying liability.`,
  sadc: `The user is tracking SADC digital transformation directives, the 46th SADC Summit outcomes, cross-border trade harmonization, and AfCFTA compliance updates. The pain point is cross-border friction — customs delays, missing documentation, unverifiable histories.`,
  ai_strategy: `The user is monitoring the Zimbabwe National AI Strategy (2026-2030), Project Pangolin, computational sovereignty mandates, and data localization laws. SMEs face uncertainty about compliance with new AI governance frameworks and data sovereignty requirements.`,
  afcfta: `The user is tracking AfCFTA implementation progress, tariff eliminations, rules of origin changes, and continental trade protocols. SMEs risk being locked out of preferential trade if they lack institutional-grade records.`,
  zimra: `The user is monitoring ZIMRA tax policy changes, digital tax compliance mandates, and VAT/PAYE filing requirement updates. The pain point is audit risk and compliance complexity for growing enterprises.`,
  rbz: `The user is tracking Reserve Bank of Zimbabwe monetary policy shifts, forex repatriation rules, and digital currency initiatives. SMEs face liquidity risk and cross-border payment friction.`,
  nssa: `The user is monitoring NSSA contribution changes, new compliance requirements, and penalties. SMEs risk penalties and procurement disqualification for non-compliance.`,
  general: `The user is tracking general regional policy shifts that affect SADC SME operations. Frame as an operational threat that Radbit is uniquely positioned to neutralize.`,
};

const PILLAR_MAPPING: Record<string, { primary: string; secondary: string; armor: string }> = {
  praz: { primary: 'simbare_engine', secondary: 'executive_multiplier', armor: 'Tender Intelligence Suite + Regulatory Command Centre' },
  sadc: { primary: 'global_passport', secondary: 'simbare_engine', armor: 'Global Partner Passport + Tender Intelligence Suite' },
  ai_strategy: { primary: 'executive_multiplier', secondary: 'global_passport', armor: 'Agentic System Automation + Custom Enterprise Architectures' },
  afcfta: { primary: 'global_passport', secondary: 'simbare_engine', armor: 'Global Partner Passport + Tender Intelligence Suite' },
  zimra: { primary: 'executive_multiplier', secondary: 'simbare_engine', armor: 'Operational Multipliers + Asset & Margin Protection' },
  rbz: { primary: 'global_passport', secondary: 'executive_multiplier', armor: 'Global Partner Passport + Operational Multipliers' },
  nssa: { primary: 'simbare_engine', secondary: 'executive_multiplier', armor: 'Tender Intelligence Suite + Regulatory Command Centre' },
  general: { primary: 'simbare_engine', secondary: 'executive_multiplier', armor: 'Custom Enterprise Architectures + Operational Multipliers' },
};

export async function generateThreatAssessment(input: ThreatAssessmentInput): Promise<ThreatAssessmentOutput> {
  const categoryInstruction = CATEGORY_INSTRUCTIONS[input.triggerCategory] || CATEGORY_INSTRUCTIONS.general;
  const pillar = PILLAR_MAPPING[input.triggerCategory] || PILLAR_MAPPING.general;

  const systemPrompt = `You are the Radbit Epistemic Trend Interceptor (RETI). You are an autonomous intelligence agent acting as the programmatic SEO engine for Radbit Inc., an elite enterprise technology firm operating in the SADC region.

${categoryInstruction}

## STRICT CONSTRAINTS
- Never use any variant of: synergy, bespoke, innovative, digital transformation, seamless, next-generation, world-class, custom-built
- Use instead: armor, leverage, precision, certainty, mechanism, protocol, architecture, shield, multiplier
- Every output must frame the regulatory update as a structural threat to the SME, not as news
- Tone: authoritative, urgent, deeply empathetic to the founder's risk-aversion
- The founder's core anxiety: losing control, losing tenders on technicalities, being invisible to capital
- You must output strictly valid JSON matching the schema. No markdown, no explanation.

## THREAT-TO-PILLAR MAPPING
The pillar mapping for this category is:
- Primary pillar: ${pillar.primary}
- Secondary pillar: ${pillar.secondary}
- Armor layer: ${pillar.armor}

Map the pain point to these Radbit pillars naturally in your copy.`;

  const prompt = `Generate a threat assessment landing page JSON holon based on the following trigger event.

Trigger Title: ${input.triggerTitle}
Trigger Summary: ${input.triggerSummary}
Trigger Source: ${input.triggerSource}
Trigger Date: ${input.triggerDate}
Trigger Category: ${input.triggerCategory}
${input.targetIndustry ? `Target Industry: ${input.targetIndustry}` : ''}

The JSON must follow this exact structure:
{
  "holon_type": "threat_assessment_page",
  "metadata": {
    "target_keyword": "The specific long-tail search query a panicked founder types",
    "trigger_event": "Brief description of the trigger event",
    "trigger_source": "${input.triggerSource}",
    "generated_at": "${new Date().toISOString()}",
    "risk_level": "critical|high|medium|low"
  },
  "hero_section": {
    "h1_headline": "High-stakes headline asking if they are prepared for the specific threat",
    "sub_headline": "Statement of Radbit's leverage — protection and certainty"
  },
  "diagnostic_widget": {
    "widget_title": "Name of the stress-test simulator specific to this regulation",
    "prompt_text": "Instructions for the user to input their current workflow",
    "underlying_radbit_solution": "Which Radbit service this leads to"
  },
  "market_reality_copy": {
    "paragraph_1": "The brutal reality of the new regulation — manual processes = lost revenue",
    "paragraph_2": "How Radbit's architecture absorbs this complexity"
  },
  "pillar_mapping": {
    "primary_pillar": "${pillar.primary}",
    ${pillar.secondary ? `"secondary_pillar": "${pillar.secondary}",` : ''}
    "armor_layer": "${pillar.armor}"
  }
}`;

  const result = await aiGateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'complex',
    maxTokens: 2048,
    temperature: 0.4,
    jsonMode: true,
  });

  let parsed: ThreatAssessmentOutput;
  try {
    parsed = JSON.parse(result.content);
  } catch {
    parsed = {
      holon: {
        holon_type: 'threat_assessment_page',
        metadata: {
          target_keyword: `${input.triggerSource} ${input.triggerTitle} compliance requirements`,
          trigger_event: input.triggerTitle,
          trigger_source: input.triggerSource,
          generated_at: new Date().toISOString(),
          risk_level: 'high',
        },
        hero_section: {
          h1_headline: `Is Your Enterprise Ready for ${input.triggerTitle}?`,
          sub_headline: 'Radbit automatically bulletproofs your compliance surface so you never lose a tender on a technicality again.',
        },
        diagnostic_widget: {
          widget_title: 'The Compliance Stress-Tester',
          prompt_text: 'Describe your current document management and compliance workflow. We will simulate how it survives the new regulation.',
          underlying_radbit_solution: pillar.armor,
        },
        market_reality_copy: {
          paragraph_1: `The ${input.triggerSource} has introduced ${input.triggerTitle}. For enterprises still operating on manual ledgers and disconnected spreadsheets, this creates a direct disqualification risk. Every tender, every submission, every compliance filing now carries a higher probability of rejection on technical grounds.`,
          paragraph_2: `Radbit absorbs this complexity. Our Compliance Shield continuously monitors your regulatory surface area and pre-flags every gap against active requirements. Your team operates within a system that enforces institutional standards automatically — so the founder does not need to personally verify every filing.`,
        },
        pillar_mapping: {
          primary_pillar: pillar.primary as 'simbare_engine' | 'executive_multiplier' | 'global_passport',
          secondary_pillar: pillar.secondary as 'simbare_engine' | 'executive_multiplier' | 'global_passport' | undefined,
          armor_layer: pillar.armor,
        },
      },
    };
  }

  return parsed;
}
