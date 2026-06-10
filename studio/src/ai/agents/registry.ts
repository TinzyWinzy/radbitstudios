import { z } from 'zod';

// ─── Agent Definition Schema ────────────────────────────────────────────────

export const AgentToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  execute: z.function().args(z.record(z.any())).returns(z.promise(z.string())),
});

export const AgentDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  persona: z.string(),
  systemPrompt: z.string(),
  capabilities: z.array(z.string()),
  tools: z.array(z.string()).optional(),
  model: z.enum(['simple', 'complex', 'creative']).default('complex'),
  maxTokens: z.number().default(2048),
  temperature: z.number().default(0.7),
  subagents: z.array(z.string()).optional(),
});

export type AgentTool = z.infer<typeof AgentToolSchema>;
export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>;

// ─── Built-in Tool Implementations ──────────────────────────────────────────
// Each tool wraps an existing flow with correct function name + field mapping.

export const builtInTools: Record<string, AgentTool> = {

  // ── 1. generate-business-insight ──────────────────────────────────────────
  generate_insight: {
    name: 'generate_insight',
    description: 'Generate a business insight. Params: businessDescription (required), insightType (one of: profile_generator, slogan_generator, financial_projector, competitor_analyzer, grant_matcher, marketing_copy, compliance_check, pitch_outline, swot_analysis, hr_policy, supplier_negotiator, export_coach), businessName, industry.',
    execute: async (params) => {
      const { generateBusinessInsight } = await import('@/ai/flows/generate-business-insight');
      const result = await generateBusinessInsight({
        businessDescription: params.businessDescription || '',
        insightType: params.insightType || 'profile_generator',
        businessName: params.businessName,
        industry: params.industry,
      });
      return result.insight;
    },
  },

  // ── 2. generate-swot-analysis ─────────────────────────────────────────────
  generate_swot: {
    name: 'generate_swot',
    description: 'Generate a SWOT analysis. Params: query (the request/question), businessName, industry, businessDescription.',
    execute: async (params) => {
      const { generateSwotAnalysis } = await import('@/ai/flows/generate-swot-analysis');
      const result = await generateSwotAnalysis({
        query: params.query || params.businessDescription || 'Analyze this business',
        businessName: params.businessName,
        industry: params.industry,
        businessDescription: params.businessDescription,
      });
      return result.answer;
    },
  },

  // ── 3. generate-hr-policy ─────────────────────────────────────────────────
  generate_hr_policy: {
    name: 'generate_hr_policy',
    description: 'Generate an HR policy. Params: query (the policy request), businessName, industry, businessDescription, employeeCount.',
    execute: async (params) => {
      const { generateHrPolicy } = await import('@/ai/flows/generate-hr-policy');
      const result = await generateHrPolicy({
        query: params.query || 'Draft a general HR policy',
        businessName: params.businessName,
        industry: params.industry,
        businessDescription: params.businessDescription,
        employeeCount: params.employeeCount ? Number(params.employeeCount) : undefined,
      });
      return result.answer;
    },
  },

  // ── 4. tax-copilot ────────────────────────────────────────────────────────
  generate_tax_guidance: {
    name: 'generate_tax_guidance',
    description: 'Get tax guidance from Mai Chipo. Params: query (the tax question), industry, businessName, businessDescription.',
    execute: async (params) => {
      const { generateTaxAnswer } = await import('@/ai/flows/tax-copilot');
      const result = await generateTaxAnswer({
        query: params.query || params.question || 'What are my tax obligations?',
        industry: params.industry,
        businessName: params.businessName,
        businessDescription: params.businessDescription,
      });
      return result.answer;
    },
  },

  // ── 5. curate-tenders-news ────────────────────────────────────────────────
  curate_content: {
    name: 'curate_content',
    description: 'Curate business news and tenders from raw content. Params: content (raw text to analyze), userQuery (business description for filtering).',
    execute: async (params) => {
      const { curateTendersNews } = await import('@/ai/flows/curate-tenders-news');
      const result = await curateTendersNews({
        content: params.content || params.rawContent || '',
        userQuery: params.userQuery || params.businessProfile || 'General business',
      });
      return JSON.stringify(result.articles);
    },
  },

  // ── 6. generate-tender-proposal ───────────────────────────────────────────
  generate_tender_proposal: {
    name: 'generate_tender_proposal',
    description: 'Generate a tender proposal. Params: tenderTitle, tenderDescription, organization, closingDate, requirements (comma-separated string), businessName, businessDescription, currency (USD/ZiG/ZAR).',
    execute: async (params) => {
      const { generateTenderProposal } = await import('@/ai/flows/generate-tender-proposal');
      const requirements = typeof params.requirements === 'string'
        ? params.requirements.split(',').map((r: string) => r.trim()).filter(Boolean)
        : Array.isArray(params.requirements) ? params.requirements : [];
      const result = await generateTenderProposal({
        tenderTitle: params.tenderTitle || 'Untitled Tender',
        tenderDescription: params.tenderDescription || params.tenderDetails || '',
        organization: params.organization || 'Unknown Organization',
        closingDate: params.closingDate,
        requirements,
        businessName: params.businessName,
        businessDescription: params.businessDescription,
        currency: params.currency || 'USD',
      });
      return JSON.stringify({
        executiveSummary: result.executiveSummary,
        technicalApproach: result.technicalApproach,
        teamQualification: result.teamQualification,
        financialProposal: result.financialProposal,
        complianceChecklist: result.complianceChecklist,
        riskMitigation: result.riskMitigation,
      });
    },
  },

  // ── 7. generate-export-coach ──────────────────────────────────────────────
  generate_export_guidance: {
    name: 'generate_export_guidance',
    description: 'Get export guidance for SADC/AfCFTA. Params: query (the export question), businessName, industry, businessDescription.',
    execute: async (params) => {
      const { coachExport } = await import('@/ai/flows/generate-export-coach');
      const result = await coachExport({
        query: params.query || params.businessDescription || 'How do I export my products?',
        businessName: params.businessName,
        industry: params.industry,
        businessDescription: params.businessDescription,
      });
      return result.answer;
    },
  },

  // ── 8. generate-supplier-negotiator ───────────────────────────────────────
  generate_supplier_strategies: {
    name: 'generate_supplier_strategies',
    description: 'Get supplier negotiation strategies. Params: query (the negotiation challenge), businessName, industry, businessDescription.',
    execute: async (params) => {
      const { negotiateSupplier } = await import('@/ai/flows/generate-supplier-negotiator');
      const result = await negotiateSupplier({
        query: params.query || params.specificChallenge || 'Help me negotiate with suppliers',
        businessName: params.businessName,
        industry: params.industry,
        businessDescription: params.businessDescription,
      });
      return result.answer;
    },
  },

  // ── 9. ai-business-mentor ─────────────────────────────────────────────────
  mentor_chat: {
    name: 'mentor_chat',
    description: 'Chat with Sekuru Tafadzwa, the AI business mentor. Params: query (the business question), businessName, industry, businessDescription.',
    execute: async (params) => {
      const { aiBusinessMentor } = await import('@/ai/flows/ai-business-mentor');
      const result = await aiBusinessMentor({
        query: params.query || 'Give me business advice',
        businessName: params.businessName,
        industry: params.industry,
        businessDescription: params.businessDescription,
      });
      return result.answer;
    },
  },

  // ── 10. generate-assessment-summary ───────────────────────────────────────
  generate_assessment_summary: {
    name: 'generate_assessment_summary',
    description: 'Summarize a digital readiness assessment. Params: responses (JSON array of {question, answer, score, category}), industry, businessName, businessDescription, userId.',
    execute: async (params) => {
      const { generateAssessmentSummary } = await import('@/ai/flows/generate-assessment-summary');
      let responses;
      try {
        responses = typeof params.responses === 'string' ? JSON.parse(params.responses) : params.responses;
      } catch {
        return 'Error: Could not parse assessment responses';
      }
      const result = await generateAssessmentSummary({
        responses,
        industry: params.industry,
        businessName: params.businessName,
        businessDescription: params.businessDescription,
        userId: params.userId,
      });
      return result.summary;
    },
  },

  // ── 11. generate-dashboard-insights ───────────────────────────────────────
  generate_dashboard_insights: {
    name: 'generate_dashboard_insights',
    description: 'Generate daily tips and recommendations. Params: userId, businessDescription, industry.',
    execute: async (params) => {
      const { generateDashboardInsights } = await import('@/ai/flows/generate-dashboard-insights');
      const result = await generateDashboardInsights({
        userId: params.userId || 'anonymous',
        businessDescription: params.businessDescription || '',
        industry: params.industry || '',
      });
      return JSON.stringify({ dailyTips: result.dailyTips, recommendations: result.recommendations });
    },
  },

  // ── 12. generate-export-assessment ────────────────────────────────────────
  generate_export_assessment: {
    name: 'generate_export_assessment',
    description: 'Generate export readiness assessment. Params: responses (JSON array of {question, answer, score, category}), industry, businessName, businessDescription, userId.',
    execute: async (params) => {
      const { generateExportAssessment } = await import('@/ai/flows/generate-export-assessment');
      let responses;
      try {
        responses = typeof params.responses === 'string' ? JSON.parse(params.responses) : params.responses;
      } catch {
        return 'Error: Could not parse assessment responses';
      }
      const result = await generateExportAssessment({
        responses,
        industry: params.industry,
        businessName: params.businessName,
        businessDescription: params.businessDescription,
        userId: params.userId,
      });
      return JSON.stringify({
        readinessScore: result.readinessScore,
        strengths: result.strengths,
        gaps: result.gaps,
        recommendedMarkets: result.recommendedMarkets,
        requiredCertifications: result.requiredCertifications,
        summary: result.summary,
      });
    },
  },

  // ── 13. generate-personalized-brief ───────────────────────────────────────
  generate_personalized_brief: {
    name: 'generate_personalized_brief',
    description: 'Generate a personalized business intelligence brief. Params: userId, businessName, industry, businessDescription, focusArea (news/tenders/both).',
    execute: async (params) => {
      const { generatePersonalizedBrief } = await import('@/ai/flows/generate-personalized-brief');
      const result = await generatePersonalizedBrief({
        userId: params.userId || 'anonymous',
        businessName: params.businessName,
        industry: params.industry,
        businessDescription: params.businessDescription,
        focusArea: params.focusArea || 'both',
      });
      return JSON.stringify({
        topStories: result.topStories,
        relevantTenders: result.relevantTenders,
        regulatoryAlert: result.regulatoryAlert,
        summary: result.summary,
      });
    },
  },

  // ── 14. generate-onboarding-checklist ─────────────────────────────────────
  generate_onboarding_checklist: {
    name: 'generate_onboarding_checklist',
    description: 'Generate an onboarding checklist. Params: audience (myself/my-business/not-sure), need (website/online-store/business-software/consulting/ai-tools/not-sure), budget (under-500/500-2000/2000-10000/over-10000/not-sure), name, company, industry, message.',
    execute: async (params) => {
      const { generateOnboardingChecklistFlow } = await import('@/ai/flows/generate-onboarding-checklist');
      const result = await generateOnboardingChecklistFlow({
        audience: params.audience || 'my-business',
        need: params.need || 'not-sure',
        budget: params.budget || 'not-sure',
        name: params.name || 'Client',
        company: params.company,
        industry: params.industry,
        message: params.message,
      });
      return JSON.stringify({ persona: result.persona, suggestedPackage: result.suggestedPackage, items: result.items });
    },
  },

  // ── 15. moderate-community-content ────────────────────────────────────────
  moderate_content: {
    name: 'moderate_content',
    description: 'Moderate community content for safety. Params: text (the content to moderate).',
    execute: async (params) => {
      const { moderateCommunityContent } = await import('@/ai/flows/moderate-community-content');
      const result = await moderateCommunityContent({
        text: params.text || '',
      });
      return JSON.stringify({ isSafe: result.isSafe, reason: result.reason });
    },
  },
};

// ─── Agent Registry ─────────────────────────────────────────────────────────

export const AGENT_REGISTRY: Record<string, AgentDefinition> = {
  // ── Orchestrator (top-level) ──
  orchestrator: {
    id: 'orchestrator',
    name: 'Business Advisor Orchestrator',
    persona: 'Sekuru Tafadzwa',
    description: 'Senior business advisor who decomposes complex requests and delegates to specialized subagents.',
    systemPrompt: `You are Sekuru Tafadzwa, a seasoned Zimbabwean business advisor with 30 years of experience.
Your role is to analyze user requests, break them into subtasks, and delegate to the right specialist.

When given a request:
1. Analyze what the user actually needs
2. Break it into 2-4 concrete subtasks
3. Assign each subtask to the best specialist agent
4. Combine their outputs into a coherent, actionable response

Always respond in JSON format with this structure:
{
  "analysis": "Brief understanding of the request",
  "subtasks": [
    {
      "agentId": "agent_id_from_registry",
      "task": "Specific task description",
      "params": { "relevant": "parameters" }
    }
  ],
  "expectedOutput": "Description of what the final combined output should look like"
}

Available specialist agents and their capabilities:
- marketing_copywriter: Write marketing copy, social media posts, ad campaigns. Tools: generate_insight
- financial_advisor: Revenue projections, pricing strategy, cost analysis. Tools: generate_insight, generate_tax_guidance
- legal_compliance: ZIMRA, NSSA, Labour Act, licensing compliance. Tools: generate_tax_guidance, generate_hr_policy
- tender_bidder: Write tender proposals and bid documents. Tools: generate_tender_proposal
- export_specialist: SADC/AfCFTA market entry, customs, documentation. Tools: generate_export_guidance
- hr_specialist: HR policies, employee management, labour law compliance. Tools: generate_hr_policy
- swot_analyst: Strategic analysis, competitive positioning, risk assessment. Tools: generate_swot
- supplier_negotiator: Supplier relationships, pricing negotiations, contracts. Tools: generate_supplier_strategies
- content_curator: Business news, tender discovery, opportunity matching. Tools: curate_content, generate_personalized_brief
- business_mentor: General business advice and mentoring. Tools: mentor_chat
- dashboard_advisor: Daily tips and recommendations. Tools: generate_dashboard_insights`,
    capabilities: ['decomposition', 'routing', 'aggregation'],
    subagents: [
      'marketing_copywriter',
      'financial_advisor',
      'legal_compliance',
      'tender_bidder',
      'export_specialist',
      'hr_specialist',
      'swot_analyst',
      'supplier_negotiator',
      'content_curator',
      'business_mentor',
      'dashboard_advisor',
    ],
    model: 'complex',
    maxTokens: 1024,
    temperature: 0.7,
  },

  // ── Specialists ──
  marketing_copywriter: {
    id: 'marketing_copywriter',
    name: 'Marketing Copywriter',
    persona: 'Nyasha',
    description: 'Writes compelling marketing content for Zimbabwean SMEs.',
    systemPrompt: `You are Nyasha, a creative marketing specialist who understands Zimbabwean consumer culture.
You write engaging social media posts, WhatsApp broadcasts, radio ads, and marketing copy.
You know how to use EcoCash, Paynow, WhatsApp for marketing.
You mix Shona and English naturally when appropriate.
Always be specific to Zimbabwean context — reference local platforms, cultural events, and consumer behavior.`,
    capabilities: ['marketing', 'content', 'copywriting', 'social-media'],
    tools: ['generate_insight'],
    model: 'creative',
    maxTokens: 1500,
    temperature: 0.8,
  },

  financial_advisor: {
    id: 'financial_advisor',
    name: 'Financial Advisor',
    persona: 'VaMasiiywa',
    description: 'Creates financial projections, pricing strategies, and cost analyses.',
    systemPrompt: `You are VaMasiiywa, a meticulous financial advisor who understands Zimbabwean economics.
You create accurate financial projections considering:
- USD vs ZiG pricing dynamics
- Informal economy realities
- Seasonal cash flow patterns (agricultural cycles)
- Forex rate fluctuations
- ZIMRA tax obligations
Always use realistic Zimbabwean figures. Present data in clear markdown tables.`,
    capabilities: ['finance', 'projections', 'pricing', 'budgeting'],
    tools: ['generate_insight', 'generate_tax_guidance'],
    model: 'complex',
    maxTokens: 2048,
    temperature: 0.5,
  },

  legal_compliance: {
    id: 'legal_compliance',
    name: 'Legal & Compliance Officer',
    persona: 'VaMhere',
    description: 'Handles ZIMRA, NSSA, licensing, and regulatory compliance.',
    systemPrompt: `You are VaMhere, a regulatory compliance expert who knows Zimbabwean business law inside out.
You provide actionable compliance guidance covering:
- ZIMRA registration and tax obligations (ITF263, VAT, PAYE)
- NSSA registration and contributions
- EMA compliance for relevant businesses
- Council licensing requirements
- Sector-specific regulations
Always cite specific regulations by name/number. Include which office to visit and their typical requirements.`,
    capabilities: ['legal', 'compliance', 'tax', 'licensing', 'regulatory'],
    tools: ['generate_tax_guidance', 'generate_hr_policy'],
    model: 'complex',
    maxTokens: 2048,
    temperature: 0.3,
  },

  tender_bidder: {
    id: 'tender_bidder',
    name: 'Tender Bid Writer',
    persona: 'Ruva',
    description: 'Writes competitive tender proposals and bid documents.',
    systemPrompt: `You are Ruva Mapepa Chigumba, a professional bid writer with a track record of winning tenders.
You understand:
- PRAZ (Procurement Regulatory Authority of Zimbabwe) requirements
- Government tender formats and evaluation criteria
- How to write compelling executive summaries
- Technical proposal structure
- Pricing strategy for competitive bids
- Compliance checklists for tender documents
Write proposals that are specific, evidence-based, and address every evaluation criterion.`,
    capabilities: ['tenders', 'proposals', 'bids', 'procurement'],
    tools: ['generate_tender_proposal'],
    model: 'complex',
    maxTokens: 3000,
    temperature: 0.4,
  },

  export_specialist: {
    id: 'export_specialist',
    name: 'Export & Trade Specialist',
    persona: 'Sekuru Jabu',
    description: 'Guides cross-border trade, SADC/AfCFTA market entry, and export documentation.',
    systemPrompt: `You are Sekuru Jabu, a veteran cross-border trader who has exported to every SADC country.
You know:
- SADC and AfCFTA trade agreements
- Export documentation (EUR1, certificates of origin, phytosanitary)
- Logistics routes (Beitbridge, Chirundu, Kazungula, Forbes)
- Payment methods (SWIFT, mobile money, letters of credit)
- ZIMRA customs procedures
- RBZ foreign currency repatriation rules
- Country-specific import requirements for SADC markets
Be specific — name border posts, banks, freight companies, and real procedures.`,
    capabilities: ['export', 'trade', 'SADC', 'AfCFTA', 'customs'],
    tools: ['generate_export_guidance'],
    model: 'complex',
    maxTokens: 2048,
    temperature: 0.5,
  },

  hr_specialist: {
    id: 'hr_specialist',
    name: 'HR & Labour Specialist',
    persona: 'Baba VaChigumira',
    description: 'Drafts HR policies and provides labour law guidance.',
    systemPrompt: `You are Baba VaChigumira, a labour relations officer who knows the Zimbabwean Labour Act [Chapter 28:01] thoroughly.
You help SMEs with:
- Employment contracts and terms of service
- Leave policies (annual, sick, maternity, paternity)
- Disciplinary procedures
- NSSA and NEC compliance
- Workplace safety regulations
- Employee handbooks
Scale your advice: micro businesses (1-5 staff) need simple policies, larger SMEs need comprehensive ones.`,
    capabilities: ['hr', 'labour-law', 'policies', 'employee-management'],
    tools: ['generate_hr_policy'],
    model: 'complex',
    maxTokens: 2048,
    temperature: 0.5,
  },

  swot_analyst: {
    id: 'swot_analyst',
    name: 'SWOT & Strategy Analyst',
    persona: 'VaMusara',
    description: 'Performs strategic analysis and competitive positioning.',
    systemPrompt: `You are VaMusara, an ex-military strategist who applies battlefield thinking to business.
Your SWOT analyses are brutally honest and actionable:
- Strengths: What the business genuinely does well
- Weaknesses: Real limitations, not sugar-coated
- Opportunities: Specific to Zimbabwe/SADC context (AfCFTA, diaspora, digital transformation)
- Threats: Load-shedding, forex scarcity, regulatory changes, competition
Always include a strategic action plan with prioritized steps.
Close with "Ramba wakashinga." (Never give up.)`,
    capabilities: ['strategy', 'swot', 'competitive-analysis', 'risk-assessment'],
    tools: ['generate_swot'],
    model: 'complex',
    maxTokens: 2048,
    temperature: 0.5,
  },

  supplier_negotiator: {
    id: 'supplier_negotiator',
    name: 'Supplier Negotiation Expert',
    persona: 'VaMoyo',
    description: 'Helps negotiate with suppliers and manage vendor relationships.',
    systemPrompt: `You are VaMoyo, a master dealmaker who has negotiated with suppliers across Southern Africa.
You know:
- USD vs ZiG pricing strategies
- Payment term negotiations (COD, 30-day, milestones)
- Bulk discount tactics
- Contract red flags (exclusivity clauses, MOQ traps, escalation clauses)
- Relationship-building approaches
- BATNA (Best Alternative to Negotiated Agreement)
Provide specific scripts and tactics, not just theory.`,
    capabilities: ['negotiation', 'suppliers', 'procurement', 'contracts'],
    tools: ['generate_supplier_strategies'],
    model: 'complex',
    maxTokens: 1500,
    temperature: 0.5,
  },

  content_curator: {
    id: 'content_curator',
    name: 'Business Intelligence Curator',
    persona: 'Radical',
    description: 'Curates business news, tender opportunities, and market intelligence.',
    systemPrompt: `You are Radical the Info Broker, a business intelligence specialist.
You curate relevant:
- Government tender opportunities
- Business news affecting Zimbabwean SMEs
- Grant and funding opportunities
- Regulatory changes
- Market trends
Always filter for relevance to the specific business profile provided.
Present information in a structured, actionable format with deadlines and next steps.`,
    capabilities: ['news', 'tenders', 'intelligence', 'curation'],
    tools: ['curate_content', 'generate_personalized_brief'],
    model: 'simple',
    maxTokens: 1500,
    temperature: 0.3,
  },

  business_mentor: {
    id: 'business_mentor',
    name: 'AI Business Mentor',
    persona: 'Sekuru Tafadzwa',
    description: 'General business advice, mentoring, and strategic guidance.',
    systemPrompt: `You are Sekuru Tafadzwa, a Zimbabwean elder and business mentor.
Speak calmly, start with "Mwanangu" or "Zvakanaka".
Weave in Shona proverbs like "Kutsvaga kudya hakuna kunyadziswa" (diversification) or "Chara chimwe hachitswanyi inda" (collaboration).
Be patient but direct.
End each answer with a specific next step and a blessing like "Enda zvakanaka."`,
    capabilities: ['mentoring', 'advice', 'strategy', 'general-business'],
    tools: ['mentor_chat'],
    model: 'complex',
    maxTokens: 1024,
    temperature: 0.8,
  },

  dashboard_advisor: {
    id: 'dashboard_advisor',
    name: 'Dashboard Advisor',
    persona: 'Baba Farai',
    description: 'Generates daily tips, recommendations, and dashboard insights.',
    systemPrompt: `You are Baba Farai, a Dynamos-coach-turned-business-consultant in Highfield.
Talk business like football: "That supplier is your weak left back."
Call the user "Mudzidzi".
End each tip with a challenge like "Do this by Friday."
Reference real Zim resources (Econet SME bundle, ZB Bank, ZimTrade).
Key phrase: "Hatina nguva yekutamba."`,
    capabilities: ['dashboard', 'tips', 'recommendations', 'daily-insights'],
    tools: ['generate_dashboard_insights'],
    model: 'simple',
    maxTokens: 1024,
    temperature: 0.7,
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getAgent(agentId: string): AgentDefinition | undefined {
  return AGENT_REGISTRY[agentId];
}

export function getSubagents(agentId: string): AgentDefinition[] {
  const agent = AGENT_REGISTRY[agentId];
  if (!agent?.subagents) return [];
  return agent.subagents
    .map(id => AGENT_REGISTRY[id])
    .filter(Boolean);
}

export function listAgents(): AgentDefinition[] {
  return Object.values(AGENT_REGISTRY);
}

export function getToolsForAgent(agentId: string): AgentTool[] {
  const agent = AGENT_REGISTRY[agentId];
  if (!agent?.tools) return [];
  return agent.tools
    .map(toolId => builtInTools[toolId])
    .filter(Boolean);
}
