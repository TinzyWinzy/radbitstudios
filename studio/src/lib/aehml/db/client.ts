import {
  Holon,
  Opportunity,
  EvidenceItem,
  Hypothesis,
  Decision,
  DecisionOverride,
  Episode,
  TrajectoryEvent,
  VincentRule,
  MonitorIntervention,
  Evaluation,
  Policy,
  EvolutionProposal,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

// In-Memory Repository state for fast, isolated tests and offline operation
interface AehmlState {
  holons: Map<string, Holon>;
  opportunities: Map<string, Opportunity>;
  evidenceItems: Map<string, EvidenceItem>;
  hypotheses: Map<string, Hypothesis>;
  decisions: Map<string, Decision>;
  overrides: Map<string, DecisionOverride>;
  episodes: Map<string, Episode>;
  trajectoryEvents: TrajectoryEvent[];
  vincentRules: Map<string, VincentRule>;
  monitorInterventions: Map<string, MonitorIntervention>;
  evaluations: Map<string, Evaluation>;
  policies: Map<string, Policy>;
  evolutionProposals: Map<string, EvolutionProposal>;
}

const globalAehmlState: AehmlState = {
  holons: new Map(),
  opportunities: new Map(),
  evidenceItems: new Map(),
  hypotheses: new Map(),
  decisions: new Map(),
  overrides: new Map(),
  episodes: new Map(),
  trajectoryEvents: [],
  vincentRules: new Map(),
  monitorInterventions: new Map(),
  evaluations: new Map(),
  policies: new Map(),
  evolutionProposals: new Map(),
};

let isSeeded = false;

export function seedAehmlDefaults() {
  if (isSeeded) return;
  isSeeded = true;

  // 1. Core 8 Holons
  const holonData: Array<Omit<Holon, 'created_at' | 'updated_at'>> = [
    {
      id: '11111111-1111-1111-1111-111111111101',
      name: 'Executive Holon',
      slug: 'executive',
      type: 'executive',
      objective: 'Synthesize multi-holon perspectives and coordinate human handoff packages.',
      authority_scope: { read: ['all'], write: ['decisions', 'episodes'], execute: ['escalate_to_human'] },
      capabilities: ['synthesis', 'priority_weighting', 'decision_framing'],
      status: 'active',
      policy_version: 'v0.1.0',
      harness_version: 'v0.1.0',
    },
    {
      id: '11111111-1111-1111-1111-111111111102',
      name: 'Intelligence Holon',
      slug: 'intelligence',
      type: 'operational',
      objective: 'Observe market signals, extract verified claims, generate competing hypotheses.',
      authority_scope: { read: ['public_data', 'documents'], write: ['evidence_items', 'hypotheses'], execute: [] },
      capabilities: ['claim_extraction', 'source_validation', 'hypothesis_generation'],
      status: 'active',
      policy_version: 'v0.1.0',
      harness_version: 'v0.1.0',
    },
    {
      id: '11111111-1111-1111-1111-111111111103',
      name: 'Sales Holon',
      slug: 'sales',
      type: 'operational',
      objective: 'Diagnose buyer state and recommend lowest-cost next commercial action.',
      authority_scope: { read: ['opportunity', 'evidence'], write: ['recommendations'], execute: [] },
      capabilities: ['buyer_state_modeling', 'next_action_selection'],
      status: 'active',
      policy_version: 'v0.1.0',
      harness_version: 'v0.1.0',
    },
    {
      id: '11111111-1111-1111-1111-111111111104',
      name: 'Delivery Holon',
      slug: 'delivery',
      type: 'operational',
      objective: 'Assess technical feasibility, protect gross margin, gate reckless proposals.',
      authority_scope: { read: ['technical_requirements'], write: ['feasibility_assessments'], execute: [] },
      capabilities: ['feasibility_analysis', 'effort_estimation', 'scope_gating'],
      status: 'active',
      policy_version: 'v0.1.0',
      harness_version: 'v0.1.0',
    },
    {
      id: '11111111-1111-1111-1111-111111111105',
      name: 'Vincent H4 Governance',
      slug: 'vincent_h4',
      type: 'governance',
      objective: 'Enforce constitutional rules, compute 100-pt opportunity scores, execute kill rules.',
      authority_scope: { read: ['all'], write: ['governance_verdicts', 'scores'], execute: ['proposal_kill_gate'] },
      capabilities: ['constitutional_auditing', 'score_calculation', 'pricing_governance'],
      status: 'active',
      policy_version: 'v0.1.0',
      harness_version: 'v0.1.0',
    },
    {
      id: '11111111-1111-1111-1111-111111111106',
      name: 'Red Team Holon',
      slug: 'red_team',
      type: 'red_team',
      objective: 'Uncover fatal assumptions, formulate CFO/procurement challenges, design disconfirming tests.',
      authority_scope: { read: ['all'], write: ['adversarial_challenges'], execute: [] },
      capabilities: ['adversarial_reasoning', 'assumption_invalidation'],
      status: 'active',
      policy_version: 'v0.1.0',
      harness_version: 'v0.1.0',
    },
    {
      id: '11111111-1111-1111-1111-111111111107',
      name: 'Monitor Holon',
      slug: 'monitor',
      type: 'monitor',
      objective: 'Detect stage inflation, deal stalls, evidence decay, trigger workflow interrupts.',
      authority_scope: { read: ['all_traces'], write: ['monitor_interventions'], execute: ['interrupt_workflow'] },
      capabilities: ['drift_detection', 'stall_monitoring', 'anomaly_interception'],
      status: 'active',
      policy_version: 'v0.1.0',
      harness_version: 'v0.1.0',
    },
    {
      id: '11111111-1111-1111-1111-111111111108',
      name: 'Evaluator Holon',
      slug: 'evaluator',
      type: 'evaluator',
      objective: 'Perform retrospective post-mortems, calculate regret, classify failure categories.',
      authority_scope: { read: ['episodes', 'outcomes'], write: ['evaluations'], execute: [] },
      capabilities: ['post_mortem_analysis', 'regret_quantification', 'failure_taxonomy'],
      status: 'active',
      policy_version: 'v0.1.0',
      harness_version: 'v0.1.0',
    },
  ];

  for (const h of holonData) {
    globalAehmlState.holons.set(h.id, {
      ...h,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // 2. Vincent Rules
  const vincentRulesData: Array<Omit<VincentRule, 'created_at'>> = [
    {
      id: '33333333-3333-3333-3333-333333333301',
      category: 'Epistemic Integrity',
      name: 'No Fabricated Capability',
      description: 'System must not claim deployed capability unless evidence status = verified or deployed.',
      rule_type: 'constitutional',
      severity: 'hard',
      active: true,
      rule_expression: { require: "evidence.validation_status in ['verified', 'deployed']" },
      version: 'v0.1.0',
    },
    {
      id: '33333333-3333-3333-3333-333333333302',
      category: 'Commercial Ethics',
      name: 'No Fabricated Testimonials',
      description: 'System must never produce or imply endorsements without verified signed release.',
      rule_type: 'constitutional',
      severity: 'hard',
      active: true,
      rule_expression: { prohibit: 'unverified_testimonials' },
      version: 'v0.1.0',
    },
    {
      id: '33333333-3333-3333-3333-333333333303',
      category: 'Commercial Ethics',
      name: 'No False Scarcity',
      description: 'Never manufacture synthetic deadlines or artificial capacity limits.',
      rule_type: 'constitutional',
      severity: 'hard',
      active: true,
      rule_expression: { prohibit: 'synthetic_scarcity' },
      version: 'v0.1.0',
    },
    {
      id: '33333333-3333-3333-3333-333333333304',
      category: 'Safety & Governance',
      name: 'No Autonomous External Messages',
      description: 'All external communications require human operator review and explicit sign-off.',
      rule_type: 'constitutional',
      severity: 'hard',
      active: true,
      rule_expression: { require: 'human_approval_required == true' },
      version: 'v0.1.0',
    },
    {
      id: '33333333-3333-3333-3333-333333333305',
      category: 'Delivery Governance',
      name: 'Proposal Gate: Delivery Feasibility & Margin',
      description: 'Proposals cannot be issued if delivery is infeasible or delivery risk exceeds 0.85.',
      rule_type: 'proposal_gate',
      severity: 'hard',
      active: true,
      rule_expression: { gate: 'delivery_feasible == true && delivery_risk <= 0.85' },
      version: 'v0.1.0',
    },
    {
      id: '33333333-3333-3333-3333-333333333306',
      category: 'Commercial Discipline',
      name: 'Kill Rule: Score Threshold < 50',
      description: 'Opportunities scoring below 50 must be deprioritized unless fresh economic evidence exists.',
      rule_type: 'kill_rule',
      severity: 'advisory',
      active: true,
      rule_expression: { trigger: 'opportunity_score < 50', recommended_action: 'DISQUALIFY' },
      version: 'v0.1.0',
    },
  ];

  for (const r of vincentRulesData) {
    globalAehmlState.vincentRules.set(r.id, {
      ...r,
      created_at: new Date().toISOString(),
    });
  }

  // 3. Baseline Seed Opportunities across multiple sectors
  const opp1Id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const opp2Id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const opp3Id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  const initialOpps: Opportunity[] = [
    {
      id: opp1Id,
      organization_name: 'ZimGold Mining Logistics',
      website: 'https://zimgold-example.co.zw',
      sector: 'Mining',
      country: 'Zimbabwe',
      source: 'Direct Inbound',
      stage: 'discovery',
      status: 'active',
      estimated_contract_value: 45000,
      estimated_gross_margin: 0.65,
      estimated_delivery_cost: 15750,
      probability_win: 0.65,
      expected_value: 29250,
      opportunity_score: 82,
      confidence: 'high',
      economic_buyer: 'Tafadzwa Moyo (MD)',
      champion: 'Kudzai Chiwenga (Ops Dir)',
      problem_owner: 'Logistics Superintendent',
      technical_buyer: 'Lead Architect',
      buyer_state: 'solution_aware',
      decision_window: 'Q3 2026',
      next_action: 'QUANTIFY',
      next_action_owner: 'Tinotenda Duma',
      primary_risk: 'High legacy ERP integration latency',
      loss_condition: 'Client opts for internal in-house spreadsheet patch',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: opp2Id,
      organization_name: 'Harare Hospitality Group',
      website: 'https://hhg-example.co.zw',
      sector: 'Hospitality',
      country: 'Zimbabwe',
      source: 'Referral',
      stage: 'qualified',
      status: 'active',
      estimated_contract_value: 22000,
      estimated_gross_margin: 0.70,
      estimated_delivery_cost: 6600,
      probability_win: 0.45,
      expected_value: 9900,
      opportunity_score: 68,
      confidence: 'moderate',
      economic_buyer: 'Sarah Henderson (CFO)',
      champion: 'Tendai Mutasa (GM)',
      problem_owner: 'Front Office Head',
      technical_buyer: 'IT Contractor',
      buyer_state: 'vendor_comparing',
      decision_window: '30 Days',
      next_action: 'DEMONSTRATE',
      next_action_owner: 'Tinotenda Duma',
      primary_risk: 'Cashflow constraints on upfront setup deposit',
      loss_condition: 'Budget freeze until tourist high-season',
      created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: opp3Id,
      organization_name: 'AgriFresh Export Hub',
      website: 'https://agrifresh-example.co.zw',
      sector: 'Agriculture',
      country: 'Zimbabwe',
      source: 'ZIDA Quarterly Report',
      stage: 'target',
      status: 'active',
      estimated_contract_value: 14000,
      estimated_gross_margin: 0.60,
      estimated_delivery_cost: 5600,
      probability_win: 0.20,
      expected_value: 2800,
      opportunity_score: 48,
      confidence: 'low',
      economic_buyer: 'Unknown',
      champion: 'Export Coordinator',
      problem_owner: 'Packhouse Manager',
      technical_buyer: 'None',
      buyer_state: 'problem_unaware',
      decision_window: 'Unknown',
      next_action: 'RESEARCH',
      next_action_owner: 'Sales Holon',
      primary_risk: 'No direct authority access yet',
      loss_condition: 'Unreachable decision maker',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  for (const o of initialOpps) {
    globalAehmlState.opportunities.set(o.id, o);
  }

  // Seed Evidence for Opp 1
  const ev1Id = uuidv4();
  const ev2Id = uuidv4();
  const ev3Id = uuidv4();

  const evidenceSeed: EvidenceItem[] = [
    {
      id: ev1Id,
      opportunity_id: opp1Id,
      claim: 'Client loses $8,200/mo due to manual truck weighbridge reconciliation delays.',
      evidence_type: 'verified_operational_data',
      source: 'Operations Audit Log provided by Kudzai Chiwenga',
      confidence: 'high',
      confidence_score: 0.92,
      validation_status: 'verified',
      supporting_or_contradicting: 'supporting',
      originating_holon_id: '11111111-1111-1111-1111-111111111102',
      is_untrusted_external: false,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: ev2Id,
      opportunity_id: opp1Id,
      claim: 'Managing Director has pre-allocated $50k discretionary capital expenditure budget.',
      evidence_type: 'direct_client_statement',
      source: 'Discovery Call Transcript with Tafadzwa Moyo',
      confidence: 'high',
      confidence_score: 0.88,
      validation_status: 'verified',
      supporting_or_contradicting: 'supporting',
      originating_holon_id: '11111111-1111-1111-1111-111111111102',
      is_untrusted_external: false,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: ev3Id,
      opportunity_id: opp1Id,
      claim: 'Internal IT is advocating for building a custom in-house Python script rather than external vendor.',
      evidence_type: 'observed_behavior',
      source: 'Technical Buyer Email response',
      confidence: 'moderate',
      confidence_score: 0.65,
      validation_status: 'verified',
      supporting_or_contradicting: 'contradicting',
      originating_holon_id: '11111111-1111-1111-1111-111111111106',
      is_untrusted_external: false,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  for (const e of evidenceSeed) {
    globalAehmlState.evidenceItems.set(e.id, e);
  }

  // Seed Hypotheses for Opp 1
  const hyp1: Hypothesis = {
    id: uuidv4(),
    opportunity_id: opp1Id,
    statement: 'H1: Automated weighbridge synchronization will eliminate $8.2k/mo leakage and secure 6-month ROI.',
    status: 'supported',
    supporting_evidence_ids: [ev1Id, ev2Id],
    contradicting_evidence_ids: [],
    missing_evidence: 'Exact network latency at remote Beitbridge weighbridge site',
    verification_action: 'Run 1-day telemetry benchmark on gateway edge device',
    commercial_consequence: 'Enables premium pricing without competitive RFP pushback',
    confidence: 'high',
    created_by_holon_id: '11111111-1111-1111-1111-111111111102',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const hyp2: Hypothesis = {
    id: uuidv4(),
    opportunity_id: opp1Id,
    statement: 'H2: In-house IT will stall decision by 4+ months unless we position Radbit as an enabler for IT rather than a replacement.',
    status: 'supported',
    supporting_evidence_ids: [ev3Id],
    contradicting_evidence_ids: [],
    missing_evidence: 'IT Lead salary / KPI alignment details',
    verification_action: 'Host dedicated technical architecture session with IT Lead Architect',
    commercial_consequence: 'Prevents political veto from technical gatekeeper',
    confidence: 'moderate',
    created_by_holon_id: '11111111-1111-1111-1111-111111111106',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  };

  globalAehmlState.hypotheses.set(hyp1.id, hyp1);
  globalAehmlState.hypotheses.set(hyp2.id, hyp2);
}

export const aehmlDb = {
  // Holons
  getHolons: async (): Promise<Holon[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.holons.values());
  },
  getHolonById: async (id: string): Promise<Holon | null> => {
    seedAehmlDefaults();
    return globalAehmlState.holons.get(id) || null;
  },

  // Opportunities
  getOpportunities: async (): Promise<Opportunity[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.opportunities.values()).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  },
  getOpportunityById: async (id: string): Promise<Opportunity | null> => {
    seedAehmlDefaults();
    return globalAehmlState.opportunities.get(id) || null;
  },
  saveOpportunity: async (opp: Opportunity): Promise<Opportunity> => {
    seedAehmlDefaults();
    opp.updated_at = new Date().toISOString();
    globalAehmlState.opportunities.set(opp.id, opp);
    return opp;
  },

  // Evidence
  getEvidenceByOpportunity: async (opportunityId: string): Promise<EvidenceItem[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.evidenceItems.values())
      .filter((e) => e.opportunity_id === opportunityId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  getAllEvidence: async (): Promise<EvidenceItem[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.evidenceItems.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  saveEvidence: async (item: EvidenceItem): Promise<EvidenceItem> => {
    seedAehmlDefaults();
    globalAehmlState.evidenceItems.set(item.id, item);
    return item;
  },

  // Hypotheses
  getHypothesesByOpportunity: async (opportunityId: string): Promise<Hypothesis[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.hypotheses.values())
      .filter((h) => h.opportunity_id === opportunityId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  saveHypothesis: async (hyp: Hypothesis): Promise<Hypothesis> => {
    seedAehmlDefaults();
    hyp.updated_at = new Date().toISOString();
    globalAehmlState.hypotheses.set(hyp.id, hyp);
    return hyp;
  },

  // Decisions
  getDecisions: async (): Promise<Decision[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.decisions.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  getDecisionsByOpportunity: async (opportunityId: string): Promise<Decision[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.decisions.values())
      .filter((d) => d.opportunity_id === opportunityId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  saveDecision: async (decision: Decision): Promise<Decision> => {
    seedAehmlDefaults();
    globalAehmlState.decisions.set(decision.id, decision);
    return decision;
  },

  // Overrides
  saveOverride: async (override: DecisionOverride): Promise<DecisionOverride> => {
    seedAehmlDefaults();
    globalAehmlState.overrides.set(override.id, override);
    const dec = globalAehmlState.decisions.get(override.decision_id);
    if (dec) {
      dec.status = 'overridden';
      globalAehmlState.decisions.set(dec.id, dec);
    }
    return override;
  },
  getOverrides: async (): Promise<DecisionOverride[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.overrides.values());
  },

  // Episodes & Trajectory Events
  getEpisodeById: async (id: string): Promise<Episode | null> => {
    seedAehmlDefaults();
    return globalAehmlState.episodes.get(id) || null;
  },
  getEpisodesByOpportunity: async (opportunityId: string): Promise<Episode[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.episodes.values())
      .filter((ep) => ep.opportunity_id === opportunityId)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  },
  saveEpisode: async (ep: Episode): Promise<Episode> => {
    seedAehmlDefaults();
    globalAehmlState.episodes.set(ep.id, ep);
    return ep;
  },
  recordTrajectoryEvent: async (event: Partial<TrajectoryEvent> & {
    id: string;
    episode_id: string;
    opportunity_id: string;
    event_type: any;
  }): Promise<TrajectoryEvent> => {
    seedAehmlDefaults();
    const fullEvent: TrajectoryEvent = {
      id: event.id,
      episode_id: event.episode_id,
      opportunity_id: event.opportunity_id,
      event_type: event.event_type,
      holon_id: event.holon_id || null,
      parent_holon_id: event.parent_holon_id || null,
      timestamp: event.timestamp || new Date().toISOString(),
      objective: event.objective || null,
      state_before: event.state_before || {},
      state_after: event.state_after || {},
      evidence_ids: event.evidence_ids || [],
      decision_id: event.decision_id || null,
      action: event.action || null,
      tool_name: event.tool_name || null,
      tool_input_summary: event.tool_input_summary || null,
      tool_output_summary: event.tool_output_summary || null,
      delegated_to_holon_id: event.delegated_to_holon_id || null,
      confidence: event.confidence ?? null,
      monitor_intervention_id: event.monitor_intervention_id || null,
      evaluation_id: event.evaluation_id || null,
      immediate_outcome: event.immediate_outcome || null,
      delayed_outcome: event.delayed_outcome || null,
      local_reward: event.local_reward ?? null,
      system_reward: event.system_reward ?? null,
      token_cost: event.token_cost || 0,
      financial_cost: event.financial_cost || 0,
      latency_ms: event.latency_ms || 0,
      human_minutes: event.human_minutes || 0,
      model_version: event.model_version || 'gpt-4o-2024-08-06',
      prompt_version: event.prompt_version || 'v0.1.0',
      policy_version: event.policy_version || 'v0.1.0',
      harness_version: event.harness_version || 'v0.1.0',
      structure_version: event.structure_version || 'v0.1.0',
      vincent_version: event.vincent_version || 'v0.1.0',
      evaluator_version: event.evaluator_version || 'v0.1.0',
      metadata: event.metadata || {},
    };
    globalAehmlState.trajectoryEvents.push(fullEvent);
    return fullEvent;
  },
  getTrajectoryEventsByEpisode: async (episodeId: string): Promise<TrajectoryEvent[]> => {
    seedAehmlDefaults();
    return globalAehmlState.trajectoryEvents
      .filter((e) => e.episode_id === episodeId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  getTrajectoryEventsByOpportunity: async (opportunityId: string): Promise<TrajectoryEvent[]> => {
    seedAehmlDefaults();
    return globalAehmlState.trajectoryEvents
      .filter((e) => e.opportunity_id === opportunityId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  getAllTrajectoryEvents: async (): Promise<TrajectoryEvent[]> => {
    seedAehmlDefaults();
    return [...globalAehmlState.trajectoryEvents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  // Vincent Rules
  getVincentRules: async (): Promise<VincentRule[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.vincentRules.values());
  },
  saveVincentRule: async (rule: VincentRule): Promise<VincentRule> => {
    seedAehmlDefaults();
    globalAehmlState.vincentRules.set(rule.id, rule);
    return rule;
  },

  // Monitor Interventions
  getMonitorInterventions: async (): Promise<MonitorIntervention[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.monitorInterventions.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  saveMonitorIntervention: async (item: MonitorIntervention): Promise<MonitorIntervention> => {
    seedAehmlDefaults();
    globalAehmlState.monitorInterventions.set(item.id, item);
    return item;
  },

  // Evaluations
  getEvaluations: async (): Promise<Evaluation[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.evaluations.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  saveEvaluation: async (item: Evaluation): Promise<Evaluation> => {
    seedAehmlDefaults();
    globalAehmlState.evaluations.set(item.id, item);
    return item;
  },

  // Policies
  getPolicies: async (): Promise<Policy[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.policies.values());
  },
  savePolicy: async (policy: Policy): Promise<Policy> => {
    seedAehmlDefaults();
    globalAehmlState.policies.set(policy.id, policy);
    return policy;
  },

  // Evolution Proposals
  getEvolutionProposals: async (): Promise<EvolutionProposal[]> => {
    seedAehmlDefaults();
    return Array.from(globalAehmlState.evolutionProposals.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  saveEvolutionProposal: async (proposal: EvolutionProposal): Promise<EvolutionProposal> => {
    seedAehmlDefaults();
    globalAehmlState.evolutionProposals.set(proposal.id, proposal);
    return proposal;
  },
};
