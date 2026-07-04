import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';

export const ThreatAssessmentInputSchema = z.object({
  triggerTitle: z.string().describe('Headline of the detected policy shift or compliance update'),
  triggerSummary: z.string().describe('Summary of what changed and when'),
  triggerSource: z.string().describe('Source name (PRAZ, SADC, Zimbabwe AI Strategy, etc.)'),
  triggerDate: z.string().describe('Date of the trigger event'),
  triggerCategory: z.enum(['praz', 'sadc', 'ai_strategy', 'afcfta', 'zimra', 'rbz', 'nssa', 'general', 'data_protection', 'energy_grid', 'mining', 'digital_regulation', 'afcfta_customs', 'sadc_industry', 'nds2', 'constitutional', 'zimra_fiscal', 'rbz_currency']),
  targetIndustry: z.string().optional().describe('Specific SADC industry affected, if any'),
});
export type ThreatAssessmentInput = z.infer<typeof ThreatAssessmentInputSchema>;

const ThreatAssessmentPageHolon = z.object({
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
});

export const InterceptPageHolon = z.object({
  holon_type: z.literal('intercept_page'),
  metadata: z.object({
    target_keyword: z.string(),
    search_intent: z.string(),
    pain_point: z.string(),
    target_audience: z.string(),
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
    diagnostic_route: z.string(),
    cta_text: z.string(),
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
});

export const ThreatAssessmentOutputSchema = z.object({
  holon: z.discriminatedUnion('holon_type', [
    ThreatAssessmentPageHolon,
    InterceptPageHolon,
  ]),
});
export type ThreatAssessmentOutput = z.infer<typeof ThreatAssessmentOutputSchema>;
export type HolonData = ThreatAssessmentOutput['holon'];

const CATEGORY_INSTRUCTIONS: Record<string, string> = {
  praz: `The user is monitoring the Procurement Regulatory Authority of Zimbabwe (PRAZ) and the eGP (electronic Government Procurement) system. New compliance standards, disqualification metrics, and threshold changes directly threaten SMEs who rely on manual ledgers. Your copy must convey that manual processes are becoming a disqualifying liability.`,
  sadc: `The user is tracking SADC digital transformation directives, the 46th SADC Summit outcomes, cross-border trade harmonization, and AfCFTA compliance updates. The pain point is cross-border friction — customs delays, missing documentation, unverifiable histories.`,
  ai_strategy: `The user is monitoring the Zimbabwe National AI Strategy (2026-2030), Project Pangolin, computational sovereignty mandates, and data localization laws. SMEs face uncertainty about compliance with new AI governance frameworks and data sovereignty requirements.`,
  afcfta: `The user is tracking AfCFTA implementation progress, tariff eliminations, rules of origin changes, and continental trade protocols. SMEs risk being locked out of preferential trade if they lack institutional-grade records.`,
  zimra: `The user is monitoring ZIMRA tax policy changes, digital tax compliance mandates, and VAT/PAYE filing requirement updates. The pain point is audit risk and compliance complexity for growing enterprises.`,
  rbz: `The user is tracking Reserve Bank of Zimbabwe monetary policy shifts, forex repatriation rules, and digital currency initiatives. SMEs face liquidity risk and cross-border payment friction.`,
  nssa: `The user is monitoring NSSA contribution changes, new compliance requirements, and penalties. SMEs risk penalties and procurement disqualification for non-compliance.`,
  general: `The user is tracking general regional policy shifts that affect SADC SME operations. Frame as an operational threat that Radbit is uniquely positioned to neutralize.`,
  data_protection: `The user is tracking POTRAZ enforcement of the Cyber and Data Protection Act. Mandatory data controller licensing, DPO appointments, and 24-hour breach notification requirements create direct criminal liability for SME founders. Your copy must frame non-compliance as a personal legal risk, not a bureaucratic inconvenience.`,
  energy_grid: `The user is monitoring ZESA grid stability and energy regulation. Load shedding directly threatens cloud-dependent business operations. The pain point is that off-the-shelf SaaS dies when the power goes out. Your copy must frame offline-first architecture as the only viable path for Zimbabwean enterprises.`,
  mining: `The user is tracking the Zimbabwe mining sector, lithium value capture strategy, and Mines and Minerals Act reform. New royalty reporting requirements and ESG traceability mandates threaten SMEs without institutional-grade record-keeping. Your copy must frame digital traceability as an export market access requirement.`,
  digital_regulation: `The user is monitoring Zimbabwe's digital regulation landscape, including the new 15% digital services tax, e-commerce regulations, and platform compliance requirements. The pain point is that digital taxation creates accounting complexity that manual systems cannot handle.`,
  afcfta_customs: `The user is tracking the AfCFTA digital customs platform rollout, rules of origin implementation, and cross-border trade digitization. SMEs without digitized documentation workflows face exclusion from the 6-hour clearance times that digitized competitors will enjoy.`,
  sadc_industry: `The user is monitoring SADC's industrialization strategy and regional value chain development. The pain point is that Zimbabwean SMEs risk being relegated to raw material suppliers unless they integrate into regional digital supply chains.`,
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
  data_protection: { primary: 'executive_multiplier', secondary: 'global_passport', armor: 'Compliance Shield + Regulatory Command Centre' },
  energy_grid: { primary: 'executive_multiplier', secondary: 'simbare_engine', armor: 'Edge-Computing Infrastructure + Offline-First Architecture' },
  mining: { primary: 'simbare_engine', secondary: 'global_passport', armor: 'Mine-to-Market Traceability + Royalty Intelligence Suite' },
  digital_regulation: { primary: 'executive_multiplier', secondary: 'simbare_engine', armor: 'Operational Multipliers + Tax Compliance Shield' },
  afcfta_customs: { primary: 'global_passport', secondary: 'simbare_engine', armor: 'Global Partner Passport + Digital Customs SDK' },
  sadc_industry: { primary: 'global_passport', secondary: 'executive_multiplier', armor: 'Regional Value Chain Integrator + Trade Intelligence Suite' },
};

const INTERCEPT_CATEGORIES = new Set(['afcfta_customs', 'sadc_industry', 'digital_regulation', 'energy_grid']);

function holonTypeForCategory(category: string): 'intercept_page' | 'threat_assessment_page' {
  return INTERCEPT_CATEGORIES.has(category) ? 'intercept_page' : 'threat_assessment_page';
}

function buildHolonPrompt(input: ThreatAssessmentInput, pillar: { primary: string; secondary: string; armor: string }): string {
  const holonType = holonTypeForCategory(input.triggerCategory);

  if (holonType === 'intercept_page') {
    return `{
  "holon": {
    "holon_type": "intercept_page",
    "metadata": {
      "target_keyword": "The long-tail keyword a panicked SME owner types into Google",
      "search_intent": "The exact question they are asking",
      "pain_point": "The specific operational anxiety driving the search",
      "target_audience": "Who this applies to",
      "generated_at": "${new Date().toISOString()}",
      "risk_level": "critical|high|medium|low"
    },
    "hero_section": {
      "h1_headline": "Question-based headline that matches the search intent",
      "sub_headline": "Statement of Radbit's leverage for this specific pain point"
    },
    "diagnostic_widget": {
      "widget_title": "Name of the diagnostic tool that addresses this pain point",
      "prompt_text": "Instructions for the user to input their situation",
      "diagnostic_route": "The Radbit tool URL this leads to",
      "cta_text": "Action button text",
      "underlying_radbit_solution": "${pillar.armor}"
    },
    "market_reality_copy": {
      "paragraph_1": "The brutal reality of the pain point — why manual approaches are failing",
      "paragraph_2": "How Radbit's architecture solves this specific problem"
    },
    "pillar_mapping": {
      "primary_pillar": "${pillar.primary}",
      ${pillar.secondary ? `"secondary_pillar": "${pillar.secondary}",` : ''}
      "armor_layer": "${pillar.armor}"
    }
  }
}`;
  }

  return `{
  "holon": {
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
      "underlying_radbit_solution": "${pillar.armor}"
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
  }
}`;
}

function buildFallbackHolon(input: ThreatAssessmentInput, pillar: { primary: string; secondary: string; armor: string }): ThreatAssessmentOutput['holon'] {
  const holonType = holonTypeForCategory(input.triggerCategory);

  if (holonType === 'intercept_page') {
    return {
      holon_type: 'intercept_page',
      metadata: {
        target_keyword: `${input.triggerSource} ${input.triggerTitle}`,
        search_intent: `How to comply with ${input.triggerTitle}`,
        pain_point: `Compliance anxiety around ${input.triggerTitle}`,
        target_audience: `SMEs affected by ${input.triggerSource}`,
        generated_at: new Date().toISOString(),
        risk_level: 'high',
      },
      hero_section: {
        h1_headline: `Is Your Business Ready for ${input.triggerTitle}?`,
        sub_headline: 'Radbit automatically bulletproofs your operations so you never fall behind on a new requirement again.',
      },
      diagnostic_widget: {
        widget_title: 'The Readiness Stress-Tester',
        prompt_text: 'Describe your current workflow. We will simulate how it survives this new requirement.',
        diagnostic_route: '/assessment',
        cta_text: 'Test Your Readiness',
        underlying_radbit_solution: pillar.armor,
      },
      market_reality_copy: {
        paragraph_1: `${input.triggerSource} has introduced ${input.triggerTitle}. For enterprises still operating on manual systems, this creates direct operational risk. Every submission, every compliance filing now carries a higher probability of rejection.`,
        paragraph_2: `Radbit absorbs this complexity. Our platform continuously monitors your operational surface area and pre-flags every gap against active requirements. Your team operates within a system that enforces institutional standards automatically.`,
      },
      pillar_mapping: {
        primary_pillar: pillar.primary as 'simbare_engine' | 'executive_multiplier' | 'global_passport',
        secondary_pillar: pillar.secondary as 'simbare_engine' | 'executive_multiplier' | 'global_passport' | undefined,
        armor_layer: pillar.armor,
      },
    };
  }

  return {
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
  };
}

export async function generateThreatAssessment(input: ThreatAssessmentInput): Promise<ThreatAssessmentOutput> {
  const categoryInstruction = CATEGORY_INSTRUCTIONS[input.triggerCategory] || CATEGORY_INSTRUCTIONS.general;
  const pillar = PILLAR_MAPPING[input.triggerCategory] || PILLAR_MAPPING.general;
  const holonType = holonTypeForCategory(input.triggerCategory);

  const systemPrompt = `You are the Radbit Epistemic Trend Interceptor (RETI). You are an autonomous intelligence agent acting as the programmatic SEO engine for Radbit Inc., an elite enterprise technology firm operating in the SADC region.

${categoryInstruction}

## HOLON TYPE
You must generate a "${holonType}" holon. ${
    holonType === 'intercept_page'
      ? 'This is an intercept page designed to capture search traffic from SME owners seeking solutions to a specific operational pain point. The page frames the pain point as solvable through Radbit architecture.'
      : 'This is a threat assessment page designed to capture search traffic from SME owners who fear a new regulatory requirement. The page frames the regulation as a structural threat that Radbit neutralizes.'
  }

## STRICT CONSTRAINTS
- Never use any variant of: synergy, bespoke, innovative, digital transformation, seamless, next-generation, world-class, custom-built
- Use instead: armor, leverage, precision, certainty, mechanism, protocol, architecture, shield, multiplier
- Tone: authoritative, urgent, deeply empathetic to the founder's risk-aversion
- The founder's core anxiety: losing control, losing tenders on technicalities, being invisible to capital
- You must output strictly valid JSON matching the schema. No markdown, no explanation.

## THREAT-TO-PILLAR MAPPING
The pillar mapping for this category is:
- Primary pillar: ${pillar.primary}
- Secondary pillar: ${pillar.secondary}
- Armor layer: ${pillar.armor}

Map the pain point to these Radbit pillars naturally in your copy.`;

  const prompt = `Generate a landing page JSON holon based on the following trigger event.

Trigger Title: ${input.triggerTitle}
Trigger Summary: ${input.triggerSummary}
Trigger Source: ${input.triggerSource}
Trigger Date: ${input.triggerDate}
Trigger Category: ${input.triggerCategory}
${input.targetIndustry ? `Target Industry: ${input.targetIndustry}` : ''}

The JSON must follow this exact structure:
${buildHolonPrompt(input, pillar)}`;

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
    parsed = { holon: buildFallbackHolon(input, pillar) };
  }

  return parsed;
}
