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
import { isPgAvailable, getPool } from '../../sqlite';
import { initAehmlPg } from './schema';
import { buildAehmlSeed } from './seed-data';

// -----------------------------------------------------------------------------
// In-Memory Repository state for fast, isolated tests and offline operation
// -----------------------------------------------------------------------------
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

let isMemorySeeded = false;

export function seedAehmlDefaults() {
  if (isMemorySeeded) return;
  isMemorySeeded = true;

  const seed = buildAehmlSeed();
  for (const h of seed.holons) globalAehmlState.holons.set(h.id, h);
  for (const r of seed.vincentRules) globalAehmlState.vincentRules.set(r.id, r);
  for (const o of seed.opportunities) globalAehmlState.opportunities.set(o.id, o);
  for (const e of seed.evidenceItems) globalAehmlState.evidenceItems.set(e.id, e);
  for (const h of seed.hypotheses) globalAehmlState.hypotheses.set(h.id, h);
}

// -----------------------------------------------------------------------------
// Row mapping helpers (PostgreSQL returns NUMERIC as string, TIMESTAMPTZ as Date)
// -----------------------------------------------------------------------------
type Row = Record<string, any>;

function toIso(v: any): string {
  if (v == null) return new Date(0).toISOString();
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function toIsoNullable(v: any): string | null {
  if (v == null) return null;
  return toIso(v);
}

function toNum(v: any): number {
  return v == null ? 0 : Number(v);
}

function toNumNullable(v: any): number | null {
  return v == null ? null : Number(v);
}

function holonFromRow(r: Row): Holon {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    type: r.type,
    parent_holon_id: r.parent_holon_id ?? null,
    objective: r.objective,
    authority_scope: r.authority_scope,
    capabilities: r.capabilities,
    status: r.status,
    policy_version: r.policy_version,
    harness_version: r.harness_version,
    created_at: toIso(r.created_at),
    updated_at: toIso(r.updated_at),
  };
}

function opportunityFromRow(r: Row): Opportunity {
  return {
    id: r.id,
    organization_name: r.organization_name,
    website: r.website ?? null,
    sector: r.sector,
    country: r.country,
    source: r.source ?? null,
    owner_user_id: r.owner_user_id ?? null,
    stage: r.stage,
    status: r.status,
    estimated_contract_value: toNum(r.estimated_contract_value),
    estimated_gross_margin: toNum(r.estimated_gross_margin),
    estimated_delivery_cost: toNum(r.estimated_delivery_cost),
    probability_win: toNum(r.probability_win),
    expected_value: toNum(r.expected_value),
    opportunity_score: toNum(r.opportunity_score),
    confidence: r.confidence,
    economic_buyer: r.economic_buyer ?? null,
    champion: r.champion ?? null,
    problem_owner: r.problem_owner ?? null,
    technical_buyer: r.technical_buyer ?? null,
    buyer_state: r.buyer_state,
    decision_window: r.decision_window ?? null,
    next_action: r.next_action ?? null,
    next_action_owner: r.next_action_owner ?? null,
    primary_risk: r.primary_risk ?? null,
    loss_condition: r.loss_condition ?? null,
    created_at: toIso(r.created_at),
    updated_at: toIso(r.updated_at),
    closed_at: toIsoNullable(r.closed_at),
  };
}

function evidenceFromRow(r: Row): EvidenceItem {
  return {
    id: r.id,
    opportunity_id: r.opportunity_id,
    episode_id: r.episode_id ?? null,
    claim: r.claim,
    evidence_type: r.evidence_type,
    source: r.source,
    source_reference: r.source_reference ?? null,
    confidence: r.confidence,
    confidence_score: toNumNullable(r.confidence_score),
    validation_status: r.validation_status,
    supporting_or_contradicting: r.supporting_or_contradicting,
    originating_holon_id: r.originating_holon_id ?? null,
    created_by_user_id: r.created_by_user_id ?? null,
    is_untrusted_external: r.is_untrusted_external,
    created_at: toIso(r.created_at),
  };
}

function hypothesisFromRow(r: Row): Hypothesis {
  return {
    id: r.id,
    opportunity_id: r.opportunity_id,
    statement: r.statement,
    status: r.status,
    supporting_evidence_ids: r.supporting_evidence_ids,
    contradicting_evidence_ids: r.contradicting_evidence_ids,
    missing_evidence: r.missing_evidence ?? null,
    verification_action: r.verification_action ?? null,
    commercial_consequence: r.commercial_consequence ?? null,
    confidence: r.confidence,
    created_by_holon_id: r.created_by_holon_id ?? null,
    created_at: toIso(r.created_at),
    updated_at: toIso(r.updated_at),
  };
}

function decisionFromRow(r: Row): Decision {
  return {
    id: r.id,
    episode_id: r.episode_id ?? null,
    opportunity_id: r.opportunity_id,
    holon_id: r.holon_id ?? null,
    decision_type: r.decision_type,
    recommended_action: r.recommended_action,
    alternatives_considered: r.alternatives_considered,
    rationale: r.rationale,
    evidence_ids: r.evidence_ids,
    confidence: toNum(r.confidence),
    estimated_value: toNum(r.estimated_value),
    estimated_cost: toNum(r.estimated_cost),
    estimated_risk: toNum(r.estimated_risk),
    authority_required: r.authority_required,
    human_approval_required: r.human_approval_required,
    status: r.status,
    created_at: toIso(r.created_at),
  };
}

function overrideFromRow(r: Row): DecisionOverride {
  return {
    id: r.id,
    decision_id: r.decision_id,
    original_action: r.original_action,
    human_action: r.human_action,
    reason: r.reason,
    operator_id: r.operator_id,
    created_at: toIso(r.created_at),
  };
}

function episodeFromRow(r: Row): Episode {
  return {
    id: r.id,
    opportunity_id: r.opportunity_id,
    started_at: toIso(r.started_at),
    ended_at: toIsoNullable(r.ended_at),
    starting_stage: r.starting_stage,
    ending_stage: r.ending_stage ?? null,
    objective: r.objective,
    structure_version: r.structure_version,
    vincent_version: r.vincent_version,
    outcome_type: r.outcome_type ?? null,
    outcome_value: toNumNullable(r.outcome_value),
    system_reward: toNumNullable(r.system_reward),
    status: r.status,
  };
}

function trajectoryEventFromRow(r: Row): TrajectoryEvent {
  return {
    id: r.id,
    episode_id: r.episode_id,
    opportunity_id: r.opportunity_id,
    event_type: r.event_type,
    holon_id: r.holon_id ?? null,
    parent_holon_id: r.parent_holon_id ?? null,
    timestamp: toIso(r.timestamp),
    objective: r.objective ?? null,
    state_before: r.state_before,
    state_after: r.state_after,
    evidence_ids: r.evidence_ids,
    decision_id: r.decision_id ?? null,
    action: r.action ?? null,
    tool_name: r.tool_name ?? null,
    tool_input_summary: r.tool_input_summary ?? null,
    tool_output_summary: r.tool_output_summary ?? null,
    delegated_to_holon_id: r.delegated_to_holon_id ?? null,
    confidence: toNumNullable(r.confidence),
    monitor_intervention_id: r.monitor_intervention_id ?? null,
    evaluation_id: r.evaluation_id ?? null,
    immediate_outcome: r.immediate_outcome ?? null,
    delayed_outcome: r.delayed_outcome ?? null,
    local_reward: toNumNullable(r.local_reward),
    system_reward: toNumNullable(r.system_reward),
    token_cost: toNum(r.token_cost),
    financial_cost: toNum(r.financial_cost),
    latency_ms: toNum(r.latency_ms),
    human_minutes: toNum(r.human_minutes),
    model_version: r.model_version,
    prompt_version: r.prompt_version,
    policy_version: r.policy_version,
    harness_version: r.harness_version,
    structure_version: r.structure_version,
    vincent_version: r.vincent_version,
    evaluator_version: r.evaluator_version,
    metadata: r.metadata,
  };
}

function vincentRuleFromRow(r: Row): VincentRule {
  return {
    id: r.id,
    category: r.category,
    name: r.name,
    description: r.description,
    rule_type: r.rule_type,
    severity: r.severity,
    active: r.active,
    rule_expression: r.rule_expression,
    version: r.version,
    created_at: toIso(r.created_at),
  };
}

function interventionFromRow(r: Row): MonitorIntervention {
  return {
    id: r.id,
    opportunity_id: r.opportunity_id,
    episode_id: r.episode_id ?? null,
    monitor_holon_id: r.monitor_holon_id ?? null,
    risk_type: r.risk_type,
    severity: r.severity,
    evidence: r.evidence,
    recommended_action: r.recommended_action,
    interrupted_execution: r.interrupted_execution,
    resolved_at: toIsoNullable(r.resolved_at),
    created_at: toIso(r.created_at),
  };
}

function evaluationFromRow(r: Row): Evaluation {
  return {
    id: r.id,
    episode_id: r.episode_id,
    decision_id: r.decision_id ?? null,
    evaluator_holon_id: r.evaluator_holon_id ?? null,
    decision_quality_score: toNum(r.decision_quality_score),
    evidence_quality_score: toNum(r.evidence_quality_score),
    process_quality_score: toNum(r.process_quality_score),
    outcome_quality_score: toNum(r.outcome_quality_score),
    commercial_fitness_score: toNum(r.commercial_fitness_score),
    constraint_compliant: r.constraint_compliant,
    primary_failure_category: r.primary_failure_category ?? null,
    secondary_failure_category: r.secondary_failure_category ?? null,
    lesson: r.lesson,
    confidence: toNum(r.confidence),
    observed_regret: toNumNullable(r.observed_regret),
    estimated_regret: toNumNullable(r.estimated_regret),
    regret_label: r.regret_label,
    human_reviewed: r.human_reviewed,
    human_agreement: r.human_agreement ?? null,
    created_at: toIso(r.created_at),
  };
}

function policyFromRow(r: Row): Policy {
  return {
    id: r.id,
    holon_id: r.holon_id ?? null,
    name: r.name,
    version: r.version,
    policy_type: r.policy_type,
    configuration: r.configuration,
    training_data_window: r.training_data_window,
    evaluation_metrics: r.evaluation_metrics,
    status: r.status,
    created_at: toIso(r.created_at),
    activated_at: toIsoNullable(r.activated_at),
    retired_at: toIsoNullable(r.retired_at),
  };
}

function evolutionProposalFromRow(r: Row): EvolutionProposal {
  return {
    id: r.id,
    current_structure_id: r.current_structure_id ?? null,
    candidate_structure: r.candidate_structure,
    operator_type: r.operator_type,
    hypothesis: r.hypothesis,
    supporting_trajectory_ids: r.supporting_trajectory_ids,
    supporting_metrics: r.supporting_metrics,
    expected_gain: toNum(r.expected_gain),
    expected_complexity_cost: toNum(r.expected_complexity_cost),
    risk: r.risk,
    confidence: toNum(r.confidence),
    status: r.status,
    human_decision: r.human_decision ?? null,
    created_at: toIso(r.created_at),
    resolved_at: toIsoNullable(r.resolved_at),
  };
}

// -----------------------------------------------------------------------------
// PostgreSQL persistence (Supabase) with in-memory fallback
// -----------------------------------------------------------------------------
export const aehmlDb = {
  // Holons
  getHolons: async (): Promise<Holon[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query('SELECT * FROM aehml_holons ORDER BY name ASC');
      return rows.map(holonFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.holons.values());
  },
  getHolonById: async (id: string): Promise<Holon | null> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query('SELECT * FROM aehml_holons WHERE id = $1', [id]);
      return rows.length > 0 ? holonFromRow(rows[0]) : null;
    }
    seedAehmlDefaults();
    return globalAehmlState.holons.get(id) || null;
  },

  // Opportunities
  getOpportunities: async (): Promise<Opportunity[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_opportunities ORDER BY updated_at DESC'
      );
      return rows.map(opportunityFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.opportunities.values()).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  },
  getOpportunityById: async (id: string): Promise<Opportunity | null> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_opportunities WHERE id = $1',
        [id]
      );
      return rows.length > 0 ? opportunityFromRow(rows[0]) : null;
    }
    seedAehmlDefaults();
    return globalAehmlState.opportunities.get(id) || null;
  },
  saveOpportunity: async (opp: Opportunity): Promise<Opportunity> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      await getPool().query(
        `INSERT INTO aehml_opportunities (id, organization_name, website, sector, country, source, owner_user_id, stage, status, estimated_contract_value, estimated_gross_margin, estimated_delivery_cost, probability_win, expected_value, opportunity_score, confidence, economic_buyer, champion, problem_owner, technical_buyer, buyer_state, decision_window, next_action, next_action_owner, primary_risk, loss_condition, created_at, updated_at, closed_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
         ON CONFLICT (id) DO UPDATE SET
           organization_name = EXCLUDED.organization_name,
           website = EXCLUDED.website,
           sector = EXCLUDED.sector,
           country = EXCLUDED.country,
           source = EXCLUDED.source,
           owner_user_id = EXCLUDED.owner_user_id,
           stage = EXCLUDED.stage,
           status = EXCLUDED.status,
           estimated_contract_value = EXCLUDED.estimated_contract_value,
           estimated_gross_margin = EXCLUDED.estimated_gross_margin,
           estimated_delivery_cost = EXCLUDED.estimated_delivery_cost,
           probability_win = EXCLUDED.probability_win,
           expected_value = EXCLUDED.expected_value,
           opportunity_score = EXCLUDED.opportunity_score,
           confidence = EXCLUDED.confidence,
           economic_buyer = EXCLUDED.economic_buyer,
           champion = EXCLUDED.champion,
           problem_owner = EXCLUDED.problem_owner,
           technical_buyer = EXCLUDED.technical_buyer,
           buyer_state = EXCLUDED.buyer_state,
           decision_window = EXCLUDED.decision_window,
           next_action = EXCLUDED.next_action,
           next_action_owner = EXCLUDED.next_action_owner,
           primary_risk = EXCLUDED.primary_risk,
           loss_condition = EXCLUDED.loss_condition,
           updated_at = NOW(),
           closed_at = EXCLUDED.closed_at`,
        [
          opp.id,
          opp.organization_name,
          opp.website ?? null,
          opp.sector,
          opp.country,
          opp.source ?? null,
          opp.owner_user_id ?? null,
          opp.stage,
          opp.status,
          opp.estimated_contract_value,
          opp.estimated_gross_margin,
          opp.estimated_delivery_cost,
          opp.probability_win,
          opp.expected_value,
          opp.opportunity_score,
          opp.confidence,
          opp.economic_buyer ?? null,
          opp.champion ?? null,
          opp.problem_owner ?? null,
          opp.technical_buyer ?? null,
          opp.buyer_state,
          opp.decision_window ?? null,
          opp.next_action ?? null,
          opp.next_action_owner ?? null,
          opp.primary_risk ?? null,
          opp.loss_condition ?? null,
          toIso(opp.created_at),
          toIso(opp.updated_at),
          opp.closed_at ? toIso(opp.closed_at) : null,
        ]
      );
      return { ...opp, updated_at: new Date().toISOString() };
    }
    seedAehmlDefaults();
    opp.updated_at = new Date().toISOString();
    globalAehmlState.opportunities.set(opp.id, opp);
    return opp;
  },

  // Evidence
  getEvidenceByOpportunity: async (opportunityId: string): Promise<EvidenceItem[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_evidence_items WHERE opportunity_id = $1 ORDER BY created_at DESC',
        [opportunityId]
      );
      return rows.map(evidenceFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.evidenceItems.values())
      .filter((e) => e.opportunity_id === opportunityId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  getAllEvidence: async (): Promise<EvidenceItem[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_evidence_items ORDER BY created_at DESC'
      );
      return rows.map(evidenceFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.evidenceItems.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  saveEvidence: async (item: EvidenceItem): Promise<EvidenceItem> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      await getPool().query(
        `INSERT INTO aehml_evidence_items (id, opportunity_id, episode_id, claim, evidence_type, source, source_reference, confidence, confidence_score, validation_status, supporting_or_contradicting, originating_holon_id, created_by_user_id, is_untrusted_external, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (id) DO UPDATE SET
           episode_id = EXCLUDED.episode_id,
           claim = EXCLUDED.claim,
           evidence_type = EXCLUDED.evidence_type,
           source = EXCLUDED.source,
           source_reference = EXCLUDED.source_reference,
           confidence = EXCLUDED.confidence,
           confidence_score = EXCLUDED.confidence_score,
           validation_status = EXCLUDED.validation_status,
           supporting_or_contradicting = EXCLUDED.supporting_or_contradicting,
           originating_holon_id = EXCLUDED.originating_holon_id,
           created_by_user_id = EXCLUDED.created_by_user_id,
           is_untrusted_external = EXCLUDED.is_untrusted_external`,
        [
          item.id,
          item.opportunity_id,
          item.episode_id ?? null,
          item.claim,
          item.evidence_type,
          item.source,
          item.source_reference ?? null,
          item.confidence,
          item.confidence_score ?? null,
          item.validation_status,
          item.supporting_or_contradicting,
          item.originating_holon_id ?? null,
          item.created_by_user_id ?? null,
          item.is_untrusted_external,
          toIso(item.created_at),
        ]
      );
      return item;
    }
    seedAehmlDefaults();
    globalAehmlState.evidenceItems.set(item.id, item);
    return item;
  },

  // Hypotheses
  getHypothesesByOpportunity: async (opportunityId: string): Promise<Hypothesis[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      if (opportunityId === 'all') {
        const { rows } = await getPool().query(
          'SELECT * FROM aehml_hypotheses ORDER BY created_at DESC'
        );
        return rows.map(hypothesisFromRow);
      }
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_hypotheses WHERE opportunity_id = $1 ORDER BY created_at DESC',
        [opportunityId]
      );
      return rows.map(hypothesisFromRow);
    }
    seedAehmlDefaults();
    const all = Array.from(globalAehmlState.hypotheses.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    if (opportunityId === 'all') return all;
    return all.filter((h) => h.opportunity_id === opportunityId);
  },
  saveHypothesis: async (hyp: Hypothesis): Promise<Hypothesis> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      await getPool().query(
        `INSERT INTO aehml_hypotheses (id, opportunity_id, statement, status, supporting_evidence_ids, contradicting_evidence_ids, missing_evidence, verification_action, commercial_consequence, confidence, created_by_holon_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET
           statement = EXCLUDED.statement,
           status = EXCLUDED.status,
           supporting_evidence_ids = EXCLUDED.supporting_evidence_ids,
           contradicting_evidence_ids = EXCLUDED.contradicting_evidence_ids,
           missing_evidence = EXCLUDED.missing_evidence,
           verification_action = EXCLUDED.verification_action,
           commercial_consequence = EXCLUDED.commercial_consequence,
           confidence = EXCLUDED.confidence,
           created_by_holon_id = EXCLUDED.created_by_holon_id,
           updated_at = NOW()`,
        [
          hyp.id,
          hyp.opportunity_id,
          hyp.statement,
          hyp.status,
          hyp.supporting_evidence_ids,
          hyp.contradicting_evidence_ids,
          hyp.missing_evidence ?? null,
          hyp.verification_action ?? null,
          hyp.commercial_consequence ?? null,
          hyp.confidence,
          hyp.created_by_holon_id ?? null,
          toIso(hyp.created_at),
          toIso(hyp.updated_at),
        ]
      );
      return { ...hyp, updated_at: new Date().toISOString() };
    }
    seedAehmlDefaults();
    hyp.updated_at = new Date().toISOString();
    globalAehmlState.hypotheses.set(hyp.id, hyp);
    return hyp;
  },

  // Decisions
  getDecisions: async (): Promise<Decision[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_decisions ORDER BY created_at DESC'
      );
      return rows.map(decisionFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.decisions.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  getDecisionsByOpportunity: async (opportunityId: string): Promise<Decision[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_decisions WHERE opportunity_id = $1 ORDER BY created_at DESC',
        [opportunityId]
      );
      return rows.map(decisionFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.decisions.values())
      .filter((d) => d.opportunity_id === opportunityId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  saveDecision: async (decision: Decision): Promise<Decision> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      await getPool().query(
        `INSERT INTO aehml_decisions (id, episode_id, opportunity_id, holon_id, decision_type, recommended_action, alternatives_considered, rationale, evidence_ids, confidence, estimated_value, estimated_cost, estimated_risk, authority_required, human_approval_required, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         ON CONFLICT (id) DO UPDATE SET
           episode_id = EXCLUDED.episode_id,
           decision_type = EXCLUDED.decision_type,
           recommended_action = EXCLUDED.recommended_action,
           alternatives_considered = EXCLUDED.alternatives_considered,
           rationale = EXCLUDED.rationale,
           evidence_ids = EXCLUDED.evidence_ids,
           confidence = EXCLUDED.confidence,
           estimated_value = EXCLUDED.estimated_value,
           estimated_cost = EXCLUDED.estimated_cost,
           estimated_risk = EXCLUDED.estimated_risk,
           authority_required = EXCLUDED.authority_required,
           human_approval_required = EXCLUDED.human_approval_required,
           status = EXCLUDED.status`,
        [
          decision.id,
          decision.episode_id ?? null,
          decision.opportunity_id,
          decision.holon_id ?? null,
          decision.decision_type,
          decision.recommended_action,
          JSON.stringify(decision.alternatives_considered),
          decision.rationale,
          decision.evidence_ids,
          decision.confidence,
          decision.estimated_value,
          decision.estimated_cost,
          decision.estimated_risk,
          JSON.stringify(decision.authority_required),
          decision.human_approval_required,
          decision.status,
          toIso(decision.created_at),
        ]
      );
      return decision;
    }
    seedAehmlDefaults();
    globalAehmlState.decisions.set(decision.id, decision);
    return decision;
  },

  // Overrides
  saveOverride: async (override: DecisionOverride): Promise<DecisionOverride> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const pool = getPool();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `INSERT INTO aehml_decision_overrides (id, decision_id, original_action, human_action, reason, operator_id, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (id) DO UPDATE SET
             original_action = EXCLUDED.original_action,
             human_action = EXCLUDED.human_action,
             reason = EXCLUDED.reason,
             operator_id = EXCLUDED.operator_id`,
          [
            override.id,
            override.decision_id,
            override.original_action,
            override.human_action,
            override.reason,
            override.operator_id,
            toIso(override.created_at),
          ]
        );
        await client.query("UPDATE aehml_decisions SET status = 'overridden' WHERE id = $1", [
          override.decision_id,
        ]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw err;
      } finally {
        client.release();
      }
      return override;
    }
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
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_decision_overrides ORDER BY created_at DESC'
      );
      return rows.map(overrideFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.overrides.values());
  },

  // Episodes & Trajectory Events
  getEpisodeById: async (id: string): Promise<Episode | null> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query('SELECT * FROM aehml_episodes WHERE id = $1', [
        id,
      ]);
      return rows.length > 0 ? episodeFromRow(rows[0]) : null;
    }
    seedAehmlDefaults();
    return globalAehmlState.episodes.get(id) || null;
  },
  getEpisodesByOpportunity: async (opportunityId: string): Promise<Episode[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_episodes WHERE opportunity_id = $1 ORDER BY started_at DESC',
        [opportunityId]
      );
      return rows.map(episodeFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.episodes.values())
      .filter((ep) => ep.opportunity_id === opportunityId)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  },
  saveEpisode: async (ep: Episode): Promise<Episode> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      await getPool().query(
        `INSERT INTO aehml_episodes (id, opportunity_id, started_at, ended_at, starting_stage, ending_stage, objective, structure_version, vincent_version, outcome_type, outcome_value, system_reward, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET
           ended_at = EXCLUDED.ended_at,
           ending_stage = EXCLUDED.ending_stage,
           objective = EXCLUDED.objective,
           outcome_type = EXCLUDED.outcome_type,
           outcome_value = EXCLUDED.outcome_value,
           system_reward = EXCLUDED.system_reward,
           status = EXCLUDED.status`,
        [
          ep.id,
          ep.opportunity_id,
          toIso(ep.started_at),
          ep.ended_at ? toIso(ep.ended_at) : null,
          ep.starting_stage,
          ep.ending_stage ?? null,
          ep.objective,
          ep.structure_version || 'v0.1.0',
          ep.vincent_version || 'v0.1.0',
          ep.outcome_type ?? null,
          ep.outcome_value ?? null,
          ep.system_reward ?? null,
          ep.status,
        ]
      );
      return ep;
    }
    seedAehmlDefaults();
    globalAehmlState.episodes.set(ep.id, ep);
    return ep;
  },
  recordTrajectoryEvent: async (
    event: Partial<TrajectoryEvent> & {
      id: string;
      episode_id: string;
      opportunity_id: string;
      event_type: any;
    }
  ): Promise<TrajectoryEvent> => {
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

    if (await isPgAvailable()) {
      await initAehmlPg();
      await getPool().query(
        `INSERT INTO aehml_trajectory_events (id, episode_id, opportunity_id, event_type, holon_id, parent_holon_id, timestamp, objective, state_before, state_after, evidence_ids, decision_id, action, tool_name, tool_input_summary, tool_output_summary, delegated_to_holon_id, confidence, monitor_intervention_id, evaluation_id, immediate_outcome, delayed_outcome, local_reward, system_reward, token_cost, financial_cost, latency_ms, human_minutes, model_version, prompt_version, policy_version, harness_version, structure_version, vincent_version, evaluator_version, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36)`,
        [
          fullEvent.id,
          fullEvent.episode_id,
          fullEvent.opportunity_id,
          fullEvent.event_type,
          fullEvent.holon_id,
          fullEvent.parent_holon_id,
          toIso(fullEvent.timestamp),
          fullEvent.objective,
          JSON.stringify(fullEvent.state_before),
          JSON.stringify(fullEvent.state_after),
          fullEvent.evidence_ids,
          fullEvent.decision_id,
          fullEvent.action,
          fullEvent.tool_name,
          fullEvent.tool_input_summary,
          fullEvent.tool_output_summary,
          fullEvent.delegated_to_holon_id,
          fullEvent.confidence,
          fullEvent.monitor_intervention_id,
          fullEvent.evaluation_id,
          fullEvent.immediate_outcome,
          fullEvent.delayed_outcome,
          fullEvent.local_reward,
          fullEvent.system_reward,
          fullEvent.token_cost,
          fullEvent.financial_cost,
          fullEvent.latency_ms,
          fullEvent.human_minutes,
          fullEvent.model_version,
          fullEvent.prompt_version,
          fullEvent.policy_version,
          fullEvent.harness_version,
          fullEvent.structure_version,
          fullEvent.vincent_version,
          fullEvent.evaluator_version,
          JSON.stringify(fullEvent.metadata),
        ]
      );
      return fullEvent;
    }

    seedAehmlDefaults();
    globalAehmlState.trajectoryEvents.push(fullEvent);
    return fullEvent;
  },
  getTrajectoryEventsByEpisode: async (episodeId: string): Promise<TrajectoryEvent[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_trajectory_events WHERE episode_id = $1 ORDER BY timestamp ASC',
        [episodeId]
      );
      return rows.map(trajectoryEventFromRow);
    }
    seedAehmlDefaults();
    return globalAehmlState.trajectoryEvents
      .filter((e) => e.episode_id === episodeId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  getTrajectoryEventsByOpportunity: async (opportunityId: string): Promise<TrajectoryEvent[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_trajectory_events WHERE opportunity_id = $1 ORDER BY timestamp ASC',
        [opportunityId]
      );
      return rows.map(trajectoryEventFromRow);
    }
    seedAehmlDefaults();
    return globalAehmlState.trajectoryEvents
      .filter((e) => e.opportunity_id === opportunityId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  getAllTrajectoryEvents: async (): Promise<TrajectoryEvent[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_trajectory_events ORDER BY timestamp DESC'
      );
      return rows.map(trajectoryEventFromRow);
    }
    seedAehmlDefaults();
    return [...globalAehmlState.trajectoryEvents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  // Vincent Rules
  getVincentRules: async (): Promise<VincentRule[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_vincent_rules ORDER BY created_at ASC'
      );
      return rows.map(vincentRuleFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.vincentRules.values());
  },
  saveVincentRule: async (rule: VincentRule): Promise<VincentRule> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      await getPool().query(
        `INSERT INTO aehml_vincent_rules (id, category, name, description, rule_type, severity, active, rule_expression, version, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO UPDATE SET
           category = EXCLUDED.category,
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           rule_type = EXCLUDED.rule_type,
           severity = EXCLUDED.severity,
           active = EXCLUDED.active,
           rule_expression = EXCLUDED.rule_expression,
           version = EXCLUDED.version`,
        [
          rule.id,
          rule.category,
          rule.name,
          rule.description,
          rule.rule_type,
          rule.severity,
          rule.active,
          JSON.stringify(rule.rule_expression),
          rule.version,
          toIso(rule.created_at),
        ]
      );
      return rule;
    }
    seedAehmlDefaults();
    globalAehmlState.vincentRules.set(rule.id, rule);
    return rule;
  },

  // Monitor Interventions
  getMonitorInterventions: async (): Promise<MonitorIntervention[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_monitor_interventions ORDER BY created_at DESC'
      );
      return rows.map(interventionFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.monitorInterventions.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  saveMonitorIntervention: async (item: MonitorIntervention): Promise<MonitorIntervention> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      await getPool().query(
        `INSERT INTO aehml_monitor_interventions (id, opportunity_id, episode_id, monitor_holon_id, risk_type, severity, evidence, recommended_action, interrupted_execution, resolved_at, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET
           opportunity_id = EXCLUDED.opportunity_id,
           episode_id = EXCLUDED.episode_id,
           monitor_holon_id = EXCLUDED.monitor_holon_id,
           risk_type = EXCLUDED.risk_type,
           severity = EXCLUDED.severity,
           evidence = EXCLUDED.evidence,
           recommended_action = EXCLUDED.recommended_action,
           interrupted_execution = EXCLUDED.interrupted_execution,
           resolved_at = EXCLUDED.resolved_at`,
        [
          item.id,
          item.opportunity_id,
          item.episode_id ?? null,
          item.monitor_holon_id ?? null,
          item.risk_type,
          item.severity,
          JSON.stringify(item.evidence),
          item.recommended_action,
          item.interrupted_execution,
          item.resolved_at ? toIso(item.resolved_at) : null,
          toIso(item.created_at),
        ]
      );
      return item;
    }
    seedAehmlDefaults();
    globalAehmlState.monitorInterventions.set(item.id, item);
    return item;
  },

  // Evaluations
  getEvaluations: async (): Promise<Evaluation[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_evaluations ORDER BY created_at DESC'
      );
      return rows.map(evaluationFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.evaluations.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  saveEvaluation: async (item: Evaluation): Promise<Evaluation> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      await getPool().query(
        `INSERT INTO aehml_evaluations (id, episode_id, decision_id, evaluator_holon_id, decision_quality_score, evidence_quality_score, process_quality_score, outcome_quality_score, commercial_fitness_score, constraint_compliant, primary_failure_category, secondary_failure_category, lesson, confidence, observed_regret, estimated_regret, regret_label, human_reviewed, human_agreement, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         ON CONFLICT (id) DO UPDATE SET
           episode_id = EXCLUDED.episode_id,
           decision_id = EXCLUDED.decision_id,
           evaluator_holon_id = EXCLUDED.evaluator_holon_id,
           decision_quality_score = EXCLUDED.decision_quality_score,
           evidence_quality_score = EXCLUDED.evidence_quality_score,
           process_quality_score = EXCLUDED.process_quality_score,
           outcome_quality_score = EXCLUDED.outcome_quality_score,
           commercial_fitness_score = EXCLUDED.commercial_fitness_score,
           constraint_compliant = EXCLUDED.constraint_compliant,
           primary_failure_category = EXCLUDED.primary_failure_category,
           secondary_failure_category = EXCLUDED.secondary_failure_category,
           lesson = EXCLUDED.lesson,
           confidence = EXCLUDED.confidence,
           observed_regret = EXCLUDED.observed_regret,
           estimated_regret = EXCLUDED.estimated_regret,
           regret_label = EXCLUDED.regret_label,
           human_reviewed = EXCLUDED.human_reviewed,
           human_agreement = EXCLUDED.human_agreement`,
        [
          item.id,
          item.episode_id,
          item.decision_id ?? null,
          item.evaluator_holon_id ?? null,
          item.decision_quality_score,
          item.evidence_quality_score,
          item.process_quality_score,
          item.outcome_quality_score,
          item.commercial_fitness_score,
          item.constraint_compliant,
          item.primary_failure_category ?? null,
          item.secondary_failure_category ?? null,
          item.lesson,
          item.confidence,
          item.observed_regret ?? null,
          item.estimated_regret ?? null,
          item.regret_label,
          item.human_reviewed,
          item.human_agreement ?? null,
          toIso(item.created_at),
        ]
      );
      return item;
    }
    seedAehmlDefaults();
    globalAehmlState.evaluations.set(item.id, item);
    return item;
  },

  // Policies
  getPolicies: async (): Promise<Policy[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query('SELECT * FROM aehml_policies');
      return rows.map(policyFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.policies.values());
  },
  savePolicy: async (policy: Policy): Promise<Policy> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      await getPool().query(
        `INSERT INTO aehml_policies (id, holon_id, name, version, policy_type, configuration, training_data_window, evaluation_metrics, status, created_at, activated_at, retired_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id) DO UPDATE SET
           holon_id = EXCLUDED.holon_id,
           name = EXCLUDED.name,
           version = EXCLUDED.version,
           policy_type = EXCLUDED.policy_type,
           configuration = EXCLUDED.configuration,
           training_data_window = EXCLUDED.training_data_window,
           evaluation_metrics = EXCLUDED.evaluation_metrics,
           status = EXCLUDED.status,
           activated_at = EXCLUDED.activated_at,
           retired_at = EXCLUDED.retired_at`,
        [
          policy.id,
          policy.holon_id,
          policy.name,
          policy.version,
          policy.policy_type,
          JSON.stringify(policy.configuration),
          JSON.stringify(policy.training_data_window),
          JSON.stringify(policy.evaluation_metrics),
          policy.status,
          toIso(policy.created_at),
          policy.activated_at ? toIso(policy.activated_at) : null,
          policy.retired_at ? toIso(policy.retired_at) : null,
        ]
      );
      return policy;
    }
    seedAehmlDefaults();
    globalAehmlState.policies.set(policy.id, policy);
    return policy;
  },

  // Evolution Proposals
  getEvolutionProposals: async (): Promise<EvolutionProposal[]> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      const { rows } = await getPool().query(
        'SELECT * FROM aehml_evolution_proposals ORDER BY created_at DESC'
      );
      return rows.map(evolutionProposalFromRow);
    }
    seedAehmlDefaults();
    return Array.from(globalAehmlState.evolutionProposals.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  saveEvolutionProposal: async (proposal: EvolutionProposal): Promise<EvolutionProposal> => {
    if (await isPgAvailable()) {
      await initAehmlPg();
      await getPool().query(
        `INSERT INTO aehml_evolution_proposals (id, current_structure_id, candidate_structure, operator_type, hypothesis, supporting_trajectory_ids, supporting_metrics, expected_gain, expected_complexity_cost, risk, confidence, status, human_decision, created_at, resolved_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (id) DO UPDATE SET
           current_structure_id = EXCLUDED.current_structure_id,
           candidate_structure = EXCLUDED.candidate_structure,
           operator_type = EXCLUDED.operator_type,
           hypothesis = EXCLUDED.hypothesis,
           supporting_trajectory_ids = EXCLUDED.supporting_trajectory_ids,
           supporting_metrics = EXCLUDED.supporting_metrics,
           expected_gain = EXCLUDED.expected_gain,
           expected_complexity_cost = EXCLUDED.expected_complexity_cost,
           risk = EXCLUDED.risk,
           confidence = EXCLUDED.confidence,
           status = EXCLUDED.status,
           human_decision = EXCLUDED.human_decision,
           resolved_at = EXCLUDED.resolved_at`,
        [
          proposal.id,
          proposal.current_structure_id ?? null,
          JSON.stringify(proposal.candidate_structure),
          proposal.operator_type,
          proposal.hypothesis,
          proposal.supporting_trajectory_ids,
          JSON.stringify(proposal.supporting_metrics),
          proposal.expected_gain,
          proposal.expected_complexity_cost,
          proposal.risk,
          proposal.confidence,
          proposal.status,
          proposal.human_decision ?? null,
          toIso(proposal.created_at),
          proposal.resolved_at ? toIso(proposal.resolved_at) : null,
        ]
      );
      return proposal;
    }
    seedAehmlDefaults();
    globalAehmlState.evolutionProposals.set(proposal.id, proposal);
    return proposal;
  },
};