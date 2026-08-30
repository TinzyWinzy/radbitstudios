import { Pool } from 'pg';
import { getPool } from '../../sqlite';
import { buildAehmlSeed } from './seed-data';

const AEHML_SCHEMA_SQL = `
-- RADBIT AEHML KERNEL v0.1 DATABASE SCHEMA (mirrors database/migrations/aehml_v0_1_init.sql)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS aehml_holons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('executive', 'operational', 'monitor', 'evaluator', 'governance', 'red_team')),
    parent_holon_id UUID REFERENCES aehml_holons(id) ON DELETE SET NULL,
    objective TEXT NOT NULL,
    authority_scope JSONB NOT NULL DEFAULT '{}'::jsonb,
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'active', 'constrained', 'suspended', 'retiring', 'retired')),
    policy_version VARCHAR(50) NOT NULL DEFAULT 'v0.1.0',
    harness_version VARCHAR(50) NOT NULL DEFAULT 'v0.1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aehml_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    holon_graph JSONB NOT NULL DEFAULT '{}'::jsonb,
    communication_graph JSONB NOT NULL DEFAULT '{}'::jsonb,
    authority_graph JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'shadow', 'active', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    retired_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS aehml_vincent_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('constitutional', 'governance', 'heuristic', 'scoring', 'evaluation', 'kill_rule', 'proposal_gate', 'pricing', 'buyer_state')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('hard', 'advisory', 'informational')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    rule_expression JSONB NOT NULL DEFAULT '{}'::jsonb,
    version VARCHAR(50) NOT NULL DEFAULT 'v0.1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aehml_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    sector VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Zimbabwe',
    source VARCHAR(100),
    owner_user_id VARCHAR(255),

    stage VARCHAR(50) NOT NULL DEFAULT 'target' CHECK (stage IN (
        'target', 'researched', 'contacted', 'engaged', 'discovery',
        'qualified', 'solution_validated', 'commercially_validated',
        'proposal', 'negotiation', 'contracting', 'won', 'lost', 'nurture'
    )),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'killed', 'closed')),

    estimated_contract_value NUMERIC(14, 2) DEFAULT 0,
    estimated_gross_margin NUMERIC(5, 4) DEFAULT 0,
    estimated_delivery_cost NUMERIC(14, 2) DEFAULT 0,

    probability_win NUMERIC(5, 4) DEFAULT 0.1,
    expected_value NUMERIC(14, 2) DEFAULT 0,

    opportunity_score NUMERIC(5, 2) DEFAULT 0,
    confidence VARCHAR(20) DEFAULT 'unknown' CHECK (confidence IN ('high', 'moderate', 'low', 'unknown')),

    economic_buyer VARCHAR(255),
    champion VARCHAR(255),
    problem_owner VARCHAR(255),
    technical_buyer VARCHAR(255),

    buyer_state VARCHAR(50) DEFAULT 'unknown' CHECK (buyer_state IN (
        'problem_unaware', 'problem_aware', 'solution_aware', 'vendor_comparing',
        'commercially_ready', 'interested_unfunded', 'politically_blocked', 'unknown'
    )),

    decision_window VARCHAR(100),
    next_action VARCHAR(100),
    next_action_owner VARCHAR(255),

    primary_risk TEXT,
    loss_condition TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS aehml_episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES aehml_opportunities(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    starting_stage VARCHAR(50) NOT NULL,
    ending_stage VARCHAR(50),
    objective TEXT NOT NULL,
    structure_version VARCHAR(50) NOT NULL DEFAULT 'v0.1.0',
    vincent_version VARCHAR(50) NOT NULL DEFAULT 'v0.1.0',
    outcome_type VARCHAR(100),
    outcome_value NUMERIC(14, 2),
    system_reward NUMERIC(14, 4),
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'aborted', 'interrupted'))
);

CREATE TABLE IF NOT EXISTS aehml_evidence_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES aehml_opportunities(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES aehml_episodes(id) ON DELETE SET NULL,
    claim TEXT NOT NULL,
    evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN (
        'direct_client_statement', 'verified_operational_data', 'observed_behavior',
        'client_document', 'existing_system', 'demonstration', 'verified_third_party',
        'industry_benchmark', 'strategic_inference', 'speculation'
    )),
    source VARCHAR(255) NOT NULL,
    source_reference TEXT,
    confidence VARCHAR(20) NOT NULL DEFAULT 'moderate' CHECK (confidence IN ('high', 'moderate', 'low', 'unknown')),
    confidence_score NUMERIC(5, 4),
    validation_status VARCHAR(50) NOT NULL DEFAULT 'unvalidated' CHECK (validation_status IN ('unvalidated', 'verified', 'disconfirmed', 'ambiguous')),
    supporting_or_contradicting VARCHAR(20) NOT NULL DEFAULT 'supporting' CHECK (supporting_or_contradicting IN ('supporting', 'contradicting', 'neutral')),
    originating_holon_id UUID REFERENCES aehml_holons(id) ON DELETE SET NULL,
    created_by_user_id VARCHAR(255),
    is_untrusted_external BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aehml_hypotheses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES aehml_opportunities(id) ON DELETE CASCADE,
    statement TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'supported', 'weakened', 'rejected', 'validated')),
    supporting_evidence_ids UUID[] DEFAULT ARRAY[]::UUID[],
    contradicting_evidence_ids UUID[] DEFAULT ARRAY[]::UUID[],
    missing_evidence TEXT,
    verification_action TEXT,
    commercial_consequence TEXT,
    confidence VARCHAR(20) NOT NULL DEFAULT 'moderate' CHECK (confidence IN ('high', 'moderate', 'low', 'unknown')),
    created_by_holon_id UUID REFERENCES aehml_holons(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aehml_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID REFERENCES aehml_episodes(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES aehml_opportunities(id) ON DELETE CASCADE,
    holon_id UUID REFERENCES aehml_holons(id) ON DELETE SET NULL,
    decision_type VARCHAR(100) NOT NULL,
    recommended_action VARCHAR(50) NOT NULL CHECK (recommended_action IN (
        'REJECT', 'RESEARCH', 'CONTACT', 'QUESTION', 'CALL', 'DEMONSTRATE',
        'QUANTIFY', 'DISCOVER', 'PROPOSE', 'FOLLOW_UP', 'WAIT', 'ESCALATE', 'DISQUALIFY'
    )),
    alternatives_considered JSONB NOT NULL DEFAULT '[]'::jsonb,
    rationale TEXT NOT NULL,
    evidence_ids UUID[] DEFAULT ARRAY[]::UUID[],
    confidence NUMERIC(5, 4) NOT NULL DEFAULT 0.5,
    estimated_value NUMERIC(14, 2) DEFAULT 0,
    estimated_cost NUMERIC(14, 2) DEFAULT 0,
    estimated_risk NUMERIC(5, 4) DEFAULT 0,
    authority_required JSONB NOT NULL DEFAULT '{}'::jsonb,
    human_approval_required BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(50) NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'overridden', 'rejected', 'executed', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aehml_decision_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID NOT NULL REFERENCES aehml_decisions(id) ON DELETE CASCADE,
    original_action VARCHAR(50) NOT NULL,
    human_action VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    operator_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aehml_monitor_interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES aehml_opportunities(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES aehml_episodes(id) ON DELETE SET NULL,
    monitor_holon_id UUID REFERENCES aehml_holons(id) ON DELETE SET NULL,
    risk_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommended_action TEXT NOT NULL,
    interrupted_execution BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aehml_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID REFERENCES aehml_episodes(id) ON DELETE CASCADE,
    decision_id UUID REFERENCES aehml_decisions(id) ON DELETE SET NULL,
    evaluator_holon_id UUID REFERENCES aehml_holons(id) ON DELETE SET NULL,
    decision_quality_score NUMERIC(5, 2) NOT NULL,
    evidence_quality_score NUMERIC(5, 2) NOT NULL,
    process_quality_score NUMERIC(5, 2) NOT NULL,
    outcome_quality_score NUMERIC(5, 2) NOT NULL,
    commercial_fitness_score NUMERIC(5, 2) NOT NULL,
    constraint_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    primary_failure_category VARCHAR(100) CHECK (primary_failure_category IS NULL OR primary_failure_category IN (
        'opportunity_selection', 'timing', 'buyer_access', 'qualification', 'trust', 'value',
        'price', 'cash', 'solution_fit', 'competition', 'proposal', 'negotiation',
        'procurement', 'delivery_credibility', 'internal_politics', 'external_shock',
        'evaluation_error', 'monitoring_failure', 'unknown'
    )),
    secondary_failure_category VARCHAR(100),
    lesson TEXT NOT NULL,
    confidence NUMERIC(5, 4) NOT NULL DEFAULT 0.8,
    observed_regret NUMERIC(14, 2),
    estimated_regret NUMERIC(14, 2),
    regret_label VARCHAR(30) DEFAULT 'unknown_regret' CHECK (regret_label IN ('observed_regret', 'estimated_regret', 'unknown_regret')),
    human_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
    human_agreement BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aehml_trajectory_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID NOT NULL REFERENCES aehml_episodes(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES aehml_opportunities(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN (
        'observation', 'evidence_added', 'hypothesis_created', 'hypothesis_updated',
        'holon_invoked', 'decision_proposed', 'decision_approved', 'decision_overridden',
        'decision_executed', 'delegation', 'tool_call', 'message_received', 'message_sent',
        'stage_changed', 'monitor_warning', 'monitor_interrupt', 'evaluation_created',
        'outcome_recorded', 'reward_assigned', 'policy_updated', 'structural_proposal_created'
    )),
    holon_id UUID REFERENCES aehml_holons(id) ON DELETE SET NULL,
    parent_holon_id UUID REFERENCES aehml_holons(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    objective TEXT,
    state_before JSONB NOT NULL DEFAULT '{}'::jsonb,
    state_after JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence_ids UUID[] DEFAULT ARRAY[]::UUID[],
    decision_id UUID REFERENCES aehml_decisions(id) ON DELETE SET NULL,
    action VARCHAR(100),
    tool_name VARCHAR(100),
    tool_input_summary TEXT,
    tool_output_summary TEXT,
    delegated_to_holon_id UUID REFERENCES aehml_holons(id) ON DELETE SET NULL,
    confidence NUMERIC(5, 4),
    monitor_intervention_id UUID REFERENCES aehml_monitor_interventions(id) ON DELETE SET NULL,
    evaluation_id UUID REFERENCES aehml_evaluations(id) ON DELETE SET NULL,
    immediate_outcome TEXT,
    delayed_outcome TEXT,
    local_reward NUMERIC(14, 4),
    system_reward NUMERIC(14, 4),
    token_cost INT DEFAULT 0,
    financial_cost NUMERIC(10, 6) DEFAULT 0,
    latency_ms INT DEFAULT 0,
    human_minutes INT DEFAULT 0,
    model_version VARCHAR(50) NOT NULL DEFAULT 'gpt-4o-2024-08-06',
    prompt_version VARCHAR(50) NOT NULL DEFAULT 'v0.1.0',
    policy_version VARCHAR(50) NOT NULL DEFAULT 'v0.1.0',
    harness_version VARCHAR(50) NOT NULL DEFAULT 'v0.1.0',
    structure_version VARCHAR(50) NOT NULL DEFAULT 'v0.1.0',
    vincent_version VARCHAR(50) NOT NULL DEFAULT 'v0.1.0',
    evaluator_version VARCHAR(50) NOT NULL DEFAULT 'v0.1.0',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS aehml_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holon_id UUID REFERENCES aehml_holons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    policy_type VARCHAR(50) NOT NULL CHECK (policy_type IN ('rule_based', 'prompt_policy', 'statistical', 'bandit', 'rl', 'hybrid')),
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    training_data_window JSONB NOT NULL DEFAULT '{}'::jsonb,
    evaluation_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'shadow', 'experiment', 'active', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    retired_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS aehml_holon_harnesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holon_id UUID NOT NULL REFERENCES aehml_holons(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    prompt_template TEXT NOT NULL,
    tool_config JSONB NOT NULL DEFAULT '[]'::jsonb,
    memory_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    handoff_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('candidate', 'active', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aehml_handoffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID NOT NULL REFERENCES aehml_episodes(id) ON DELETE CASCADE,
    from_holon_id UUID NOT NULL REFERENCES aehml_holons(id) ON DELETE CASCADE,
    to_holon_id UUID NOT NULL REFERENCES aehml_holons(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    context_mode VARCHAR(50) NOT NULL DEFAULT 'validated_evidence_only' CHECK (context_mode IN ('full_history', 'compressed_history', 'validated_evidence_only', 'current_state', 'custom')),
    selected_evidence_ids UUID[] DEFAULT ARRAY[]::UUID[],
    summary TEXT NOT NULL,
    constraints JSONB NOT NULL DEFAULT '[]'::jsonb,
    authority JSONB NOT NULL DEFAULT '{}'::jsonb,
    expected_output TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aehml_evolution_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    current_structure_id UUID REFERENCES aehml_structures(id) ON DELETE SET NULL,
    candidate_structure JSONB NOT NULL,
    operator_type VARCHAR(50) NOT NULL CHECK (operator_type IN ('adapt_policy', 'adapt_harness', 'adapt_topology', 'spawn', 'merge', 'retire')),
    hypothesis TEXT NOT NULL,
    supporting_trajectory_ids UUID[] DEFAULT ARRAY[]::UUID[],
    supporting_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    expected_gain NUMERIC(14, 2) NOT NULL DEFAULT 0,
    expected_complexity_cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
    risk VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (risk IN ('low', 'medium', 'high', 'critical')),
    confidence NUMERIC(5, 4) NOT NULL DEFAULT 0.5,
    status VARCHAR(50) NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'reviewing', 'approved', 'rejected', 'executed')),
    human_decision VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_aehml_opp_stage ON aehml_opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_aehml_opp_score ON aehml_opportunities(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_aehml_evidence_opp ON aehml_evidence_items(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_aehml_hypotheses_opp ON aehml_hypotheses(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_aehml_decisions_opp ON aehml_decisions(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_aehml_events_episode ON aehml_trajectory_events(episode_id, timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_aehml_events_opp ON aehml_trajectory_events(opportunity_id, timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_aehml_events_type ON aehml_trajectory_events(event_type);
`;

let schemaPromise: Promise<void> | null = null;

export async function ensureAehmlSchema(pool: Pool): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = pool.query(AEHML_SCHEMA_SQL).then(() => undefined);
  }
  return schemaPromise;
}

async function seedAehmlDatabase(pool: Pool): Promise<void> {
  const existing = await pool.query('SELECT 1 FROM aehml_holons LIMIT 1');
  if (existing.rows.length > 0) return;

  const seed = buildAehmlSeed();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const h of seed.holons) {
      await client.query(
        `INSERT INTO aehml_holons (id, name, slug, type, objective, authority_scope, capabilities, status, policy_version, harness_version, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          h.id,
          h.name,
          h.slug,
          h.type,
          h.objective,
          JSON.stringify(h.authority_scope),
          JSON.stringify(h.capabilities),
          h.status,
          h.policy_version,
          h.harness_version,
          toPgDate(h.created_at),
          toPgDate(h.updated_at),
        ]
      );
    }

    await client.query(
      `INSERT INTO aehml_structures (id, version, description, holon_graph, communication_graph, authority_graph, status, activated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        seed.structure.id,
        seed.structure.version,
        seed.structure.description,
        JSON.stringify(seed.structure.holon_graph),
        JSON.stringify(seed.structure.communication_graph),
        JSON.stringify(seed.structure.authority_graph),
        seed.structure.status,
        toPgDate(seed.structure.activated_at),
      ]
    );

    for (const r of seed.vincentRules) {
      await client.query(
        `INSERT INTO aehml_vincent_rules (id, category, name, description, rule_type, severity, active, rule_expression, version, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          r.id,
          r.category,
          r.name,
          r.description,
          r.rule_type,
          r.severity,
          r.active,
          JSON.stringify(r.rule_expression),
          r.version,
          toPgDate(r.created_at),
        ]
      );
    }

    await client.query(
      `INSERT INTO aehml_policies (id, holon_id, name, version, policy_type, configuration, training_data_window, evaluation_metrics, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        seed.policy.id,
        seed.policy.holon_id,
        seed.policy.name,
        seed.policy.version,
        seed.policy.policy_type,
        JSON.stringify(seed.policy.configuration),
        JSON.stringify(seed.policy.training_data_window),
        JSON.stringify(seed.policy.evaluation_metrics),
        seed.policy.status,
        toPgDate(seed.policy.created_at),
      ]
    );

    for (const o of seed.opportunities) {
      await client.query(
        `INSERT INTO aehml_opportunities (id, organization_name, website, sector, country, source, stage, status, estimated_contract_value, estimated_gross_margin, estimated_delivery_cost, probability_win, expected_value, opportunity_score, confidence, economic_buyer, champion, problem_owner, technical_buyer, buyer_state, decision_window, next_action, next_action_owner, primary_risk, loss_condition, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)`,
        [
          o.id,
          o.organization_name,
          o.website ?? null,
          o.sector,
          o.country,
          o.source ?? null,
          o.stage,
          o.status,
          o.estimated_contract_value,
          o.estimated_gross_margin,
          o.estimated_delivery_cost,
          o.probability_win,
          o.expected_value,
          o.opportunity_score,
          o.confidence,
          o.economic_buyer ?? null,
          o.champion ?? null,
          o.problem_owner ?? null,
          o.technical_buyer ?? null,
          o.buyer_state,
          o.decision_window ?? null,
          o.next_action ?? null,
          o.next_action_owner ?? null,
          o.primary_risk ?? null,
          o.loss_condition ?? null,
          toPgDate(o.created_at),
          toPgDate(o.updated_at),
        ]
      );
    }

    for (const e of seed.evidenceItems) {
      await client.query(
        `INSERT INTO aehml_evidence_items (id, opportunity_id, claim, evidence_type, source, confidence, confidence_score, validation_status, supporting_or_contradicting, originating_holon_id, is_untrusted_external, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          e.id,
          e.opportunity_id,
          e.claim,
          e.evidence_type,
          e.source,
          e.confidence,
          e.confidence_score ?? null,
          e.validation_status,
          e.supporting_or_contradicting,
          e.originating_holon_id ?? null,
          e.is_untrusted_external,
          toPgDate(e.created_at),
        ]
      );
    }

    for (const h of seed.hypotheses) {
      await client.query(
        `INSERT INTO aehml_hypotheses (id, opportunity_id, statement, status, supporting_evidence_ids, contradicting_evidence_ids, missing_evidence, verification_action, commercial_consequence, confidence, created_by_holon_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          h.id,
          h.opportunity_id,
          h.statement,
          h.status,
          h.supporting_evidence_ids,
          h.contradicting_evidence_ids,
          h.missing_evidence ?? null,
          h.verification_action ?? null,
          h.commercial_consequence ?? null,
          h.confidence,
          h.created_by_holon_id ?? null,
          toPgDate(h.created_at),
          toPgDate(h.updated_at),
        ]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

function toPgDate(value: string | Date): string {
  if (value instanceof Date) return value.toISOString();
  return value;
}

let initPromise: Promise<void> | null = null;

export function initAehmlPg(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const pool = getPool();
      await ensureAehmlSchema(pool);
      await seedAehmlDatabase(pool);
      const onAvailable = true;
      return void onAvailable;
    })().catch((err) => {
      initPromise = null;
      schemaPromise = null;
      throw err;
    });
  }
  return initPromise;
}