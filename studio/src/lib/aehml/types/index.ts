import { z } from 'zod';

// ==============================================================================
// 1. HOLONS
// ==============================================================================
export const HolonTypeSchema = z.enum([
  'executive',
  'operational',
  'monitor',
  'evaluator',
  'governance',
  'red_team',
]);
export type HolonType = z.infer<typeof HolonTypeSchema>;

export const HolonStatusSchema = z.enum([
  'candidate',
  'active',
  'constrained',
  'suspended',
  'retiring',
  'retired',
]);
export type HolonStatus = z.infer<typeof HolonStatusSchema>;

export const AuthorityScopeSchema = z.object({
  read: z.array(z.string()).default([]),
  write: z.array(z.string()).default([]),
  execute: z.array(z.string()).default([]),
});
export type AuthorityScope = z.infer<typeof AuthorityScopeSchema>;

export const HolonSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  type: HolonTypeSchema,
  parent_holon_id: z.string().uuid().nullable().optional(),
  objective: z.string(),
  authority_scope: AuthorityScopeSchema,
  capabilities: z.array(z.string()).default([]),
  status: HolonStatusSchema.default('active'),
  policy_version: z.string().default('v0.1.0'),
  harness_version: z.string().default('v0.1.0'),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
});
export type Holon = z.infer<typeof HolonSchema>;

// ==============================================================================
// 2. OPPORTUNITIES & STAGES
// ==============================================================================
export const OpportunityStageSchema = z.enum([
  'target',
  'researched',
  'contacted',
  'engaged',
  'discovery',
  'qualified',
  'solution_validated',
  'commercially_validated',
  'proposal',
  'negotiation',
  'contracting',
  'won',
  'lost',
  'nurture',
]);
export type OpportunityStage = z.infer<typeof OpportunityStageSchema>;

export const OpportunityStatusSchema = z.enum(['active', 'paused', 'killed', 'closed']);
export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>;

export const ConfidenceLevelSchema = z.enum(['high', 'moderate', 'low', 'unknown']);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const BuyerStateSchema = z.enum([
  'problem_unaware',
  'problem_aware',
  'solution_aware',
  'vendor_comparing',
  'commercially_ready',
  'interested_unfunded',
  'politically_blocked',
  'unknown',
]);
export type BuyerState = z.infer<typeof BuyerStateSchema>;

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  organization_name: z.string(),
  website: z.string().nullable().optional(),
  sector: z.string(),
  country: z.string().default('Zimbabwe'),
  source: z.string().nullable().optional(),
  owner_user_id: z.string().nullable().optional(),

  stage: OpportunityStageSchema.default('target'),
  status: OpportunityStatusSchema.default('active'),

  estimated_contract_value: z.number().default(0),
  estimated_gross_margin: z.number().default(0),
  estimated_delivery_cost: z.number().default(0),

  probability_win: z.number().min(0).max(1).default(0.1),
  expected_value: z.number().default(0),

  opportunity_score: z.number().min(0).max(100).default(0),
  confidence: ConfidenceLevelSchema.default('unknown'),

  economic_buyer: z.string().nullable().optional(),
  champion: z.string().nullable().optional(),
  problem_owner: z.string().nullable().optional(),
  technical_buyer: z.string().nullable().optional(),

  buyer_state: BuyerStateSchema.default('unknown'),

  decision_window: z.string().nullable().optional(),
  next_action: z.string().nullable().optional(),
  next_action_owner: z.string().nullable().optional(),

  primary_risk: z.string().nullable().optional(),
  loss_condition: z.string().nullable().optional(),

  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
  closed_at: z.string().or(z.date()).nullable().optional(),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

// ==============================================================================
// 3. EVIDENCE ITEMS
// ==============================================================================
export const EvidenceTypeSchema = z.enum([
  'direct_client_statement',
  'verified_operational_data',
  'observed_behavior',
  'client_document',
  'existing_system',
  'demonstration',
  'verified_third_party',
  'industry_benchmark',
  'strategic_inference',
  'speculation',
]);
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

export const ValidationStatusSchema = z.enum([
  'unvalidated',
  'verified',
  'disconfirmed',
  'ambiguous',
]);
export type ValidationStatus = z.infer<typeof ValidationStatusSchema>;

export const EvidencePolaritySchema = z.enum(['supporting', 'contradicting', 'neutral']);
export type EvidencePolarity = z.infer<typeof EvidencePolaritySchema>;

export const EvidenceItemSchema = z.object({
  id: z.string().uuid(),
  opportunity_id: z.string().uuid(),
  episode_id: z.string().uuid().nullable().optional(),
  claim: z.string(),
  evidence_type: EvidenceTypeSchema,
  source: z.string(),
  source_reference: z.string().nullable().optional(),
  confidence: ConfidenceLevelSchema.default('moderate'),
  confidence_score: z.number().min(0).max(1).nullable().optional(),
  validation_status: ValidationStatusSchema.default('unvalidated'),
  supporting_or_contradicting: EvidencePolaritySchema.default('supporting'),
  originating_holon_id: z.string().uuid().nullable().optional(),
  created_by_user_id: z.string().nullable().optional(),
  is_untrusted_external: z.boolean().default(false),
  created_at: z.string().or(z.date()),
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

// ==============================================================================
// 4. HYPOTHESES
// ==============================================================================
export const HypothesisStatusSchema = z.enum([
  'candidate',
  'supported',
  'weakened',
  'rejected',
  'validated',
]);
export type HypothesisStatus = z.infer<typeof HypothesisStatusSchema>;

export const HypothesisSchema = z.object({
  id: z.string().uuid(),
  opportunity_id: z.string().uuid(),
  statement: z.string(),
  status: HypothesisStatusSchema.default('candidate'),
  supporting_evidence_ids: z.array(z.string().uuid()).default([]),
  contradicting_evidence_ids: z.array(z.string().uuid()).default([]),
  missing_evidence: z.string().nullable().optional(),
  verification_action: z.string().nullable().optional(),
  commercial_consequence: z.string().nullable().optional(),
  confidence: ConfidenceLevelSchema.default('moderate'),
  created_by_holon_id: z.string().uuid().nullable().optional(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
});
export type Hypothesis = z.infer<typeof HypothesisSchema>;

// ==============================================================================
// 5. DECISION OBJECT & ACTIONS
// ==============================================================================
export const ActionSpaceSchema = z.enum([
  'REJECT',
  'RESEARCH',
  'CONTACT',
  'QUESTION',
  'CALL',
  'DEMONSTRATE',
  'QUANTIFY',
  'DISCOVER',
  'PROPOSE',
  'FOLLOW_UP',
  'WAIT',
  'ESCALATE',
  'DISQUALIFY',
]);
export type ActionSpace = z.infer<typeof ActionSpaceSchema>;

export const DecisionStatusSchema = z.enum([
  'proposed',
  'approved',
  'overridden',
  'rejected',
  'executed',
  'expired',
]);
export type DecisionStatus = z.infer<typeof DecisionStatusSchema>;

export const DecisionSchema = z.object({
  id: z.string().uuid(),
  episode_id: z.string().uuid().nullable().optional(),
  opportunity_id: z.string().uuid(),
  holon_id: z.string().uuid().nullable().optional(),
  decision_type: z.string(),
  recommended_action: ActionSpaceSchema,
  alternatives_considered: z.array(z.string()).default([]),
  rationale: z.string(),
  evidence_ids: z.array(z.string().uuid()).default([]),
  confidence: z.number().min(0).max(1).default(0.5),
  estimated_value: z.number().default(0),
  estimated_cost: z.number().default(0),
  estimated_risk: z.number().min(0).max(1).default(0),
  authority_required: z.record(z.any()).default({}),
  human_approval_required: z.boolean().default(true),
  status: DecisionStatusSchema.default('proposed'),
  created_at: z.string().or(z.date()),
});
export type Decision = z.infer<typeof DecisionSchema>;

export const DecisionOverrideSchema = z.object({
  id: z.string().uuid(),
  decision_id: z.string().uuid(),
  original_action: ActionSpaceSchema,
  human_action: ActionSpaceSchema,
  reason: z.string(),
  operator_id: z.string(),
  created_at: z.string().or(z.date()),
});
export type DecisionOverride = z.infer<typeof DecisionOverrideSchema>;

// ==============================================================================
// 6. EPISODES & TRAJECTORY EVENTS
// ==============================================================================
export const EpisodeStatusSchema = z.enum(['in_progress', 'completed', 'aborted', 'interrupted']);
export type EpisodeStatus = z.infer<typeof EpisodeStatusSchema>;

export const EpisodeSchema = z.object({
  id: z.string().uuid(),
  opportunity_id: z.string().uuid(),
  started_at: z.string().or(z.date()),
  ended_at: z.string().or(z.date()).nullable().optional(),
  starting_stage: OpportunityStageSchema,
  ending_stage: OpportunityStageSchema.nullable().optional(),
  objective: z.string(),
  structure_version: z.string().default('v0.1.0'),
  vincent_version: z.string().default('v0.1.0'),
  outcome_type: z.string().nullable().optional(),
  outcome_value: z.number().nullable().optional(),
  system_reward: z.number().nullable().optional(),
  status: EpisodeStatusSchema.default('in_progress'),
});
export type Episode = z.infer<typeof EpisodeSchema>;

export const EventTypeSchema = z.enum([
  'observation',
  'evidence_added',
  'hypothesis_created',
  'hypothesis_updated',
  'holon_invoked',
  'decision_proposed',
  'decision_approved',
  'decision_overridden',
  'decision_executed',
  'delegation',
  'tool_call',
  'message_received',
  'message_sent',
  'stage_changed',
  'monitor_warning',
  'monitor_interrupt',
  'evaluation_created',
  'outcome_recorded',
  'reward_assigned',
  'policy_updated',
  'structural_proposal_created',
]);
export type EventType = z.infer<typeof EventTypeSchema>;

export const TrajectoryEventSchema = z.object({
  id: z.string().uuid(),
  episode_id: z.string().uuid(),
  opportunity_id: z.string().uuid(),
  event_type: EventTypeSchema,
  holon_id: z.string().uuid().nullable().optional(),
  parent_holon_id: z.string().uuid().nullable().optional(),
  timestamp: z.string().or(z.date()),
  objective: z.string().nullable().optional(),
  state_before: z.record(z.any()).optional().default({}),
  state_after: z.record(z.any()).optional().default({}),
  evidence_ids: z.array(z.string().uuid()).optional().default([]),
  decision_id: z.string().uuid().nullable().optional(),
  action: z.string().nullable().optional(),
  tool_name: z.string().nullable().optional(),
  tool_input_summary: z.string().nullable().optional(),
  tool_output_summary: z.string().nullable().optional(),
  delegated_to_holon_id: z.string().uuid().nullable().optional(),
  confidence: z.number().nullable().optional(),
  monitor_intervention_id: z.string().uuid().nullable().optional(),
  evaluation_id: z.string().uuid().nullable().optional(),
  immediate_outcome: z.string().nullable().optional(),
  delayed_outcome: z.string().nullable().optional(),
  local_reward: z.number().nullable().optional(),
  system_reward: z.number().nullable().optional(),
  token_cost: z.number().optional().default(0),
  financial_cost: z.number().optional().default(0),
  latency_ms: z.number().optional().default(0),
  human_minutes: z.number().optional().default(0),

  // 7 MANDATORY VERSIONS
  model_version: z.string().default('gpt-4o-2024-08-06'),
  prompt_version: z.string().default('v0.1.0'),
  policy_version: z.string().default('v0.1.0'),
  harness_version: z.string().default('v0.1.0'),
  structure_version: z.string().default('v0.1.0'),
  vincent_version: z.string().default('v0.1.0'),
  evaluator_version: z.string().default('v0.1.0'),

  metadata: z.record(z.any()).optional().default({}),
});
export type TrajectoryEvent = z.infer<typeof TrajectoryEventSchema>;

// ==============================================================================
// 7. VINCENT H4 GOVERNANCE & SCORING
// ==============================================================================
export const RuleTypeSchema = z.enum([
  'constitutional',
  'governance',
  'heuristic',
  'scoring',
  'evaluation',
  'kill_rule',
  'proposal_gate',
  'pricing',
  'buyer_state',
]);
export type RuleType = z.infer<typeof RuleTypeSchema>;

export const RuleSeveritySchema = z.enum(['hard', 'advisory', 'informational']);
export type RuleSeverity = z.infer<typeof RuleSeveritySchema>;

export const VincentRuleSchema = z.object({
  id: z.string().uuid(),
  category: z.string(),
  name: z.string(),
  description: z.string(),
  rule_type: RuleTypeSchema,
  severity: RuleSeveritySchema,
  active: z.boolean().default(true),
  rule_expression: z.record(z.any()).default({}),
  version: z.string().default('v0.1.0'),
  created_at: z.string().or(z.date()),
});
export type VincentRule = z.infer<typeof VincentRuleSchema>;

export interface VincentScoreBreakdown {
  economicImpact: number; // Max 20
  problemSeverity: number; // Max 15
  urgency: number; // Max 15
  abilityToPay: number; // Max 10
  authorityAccess: number; // Max 10
  championStrength: number; // Max 10
  solutionFit: number; // Max 10
  timing: number; // Max 5
  expansionPotential: number; // Max 5
  totalScore: number; // Max 100
  scoreBand: 'priority_pursuit' | 'active_development' | 'investigate_nurture' | 'deprioritize';
  version: string;
}

// ==============================================================================
// 8. MONITOR, EVALUATOR & REGRET
// ==============================================================================
export const MonitorRiskSeveritySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);
export type MonitorRiskSeverity = z.infer<typeof MonitorRiskSeveritySchema>;

export const MonitorInterventionSchema = z.object({
  id: z.string().uuid(),
  opportunity_id: z.string().uuid(),
  episode_id: z.string().uuid().nullable().optional(),
  monitor_holon_id: z.string().uuid().nullable().optional(),
  risk_type: z.string(),
  severity: MonitorRiskSeveritySchema,
  evidence: z.record(z.any()).default({}),
  recommended_action: z.string(),
  interrupted_execution: z.boolean().default(false),
  resolved_at: z.string().or(z.date()).nullable().optional(),
  created_at: z.string().or(z.date()),
});
export type MonitorIntervention = z.infer<typeof MonitorInterventionSchema>;

export const FailureCategorySchema = z.enum([
  'opportunity_selection',
  'timing',
  'buyer_access',
  'qualification',
  'trust',
  'value',
  'price',
  'cash',
  'solution_fit',
  'competition',
  'proposal',
  'negotiation',
  'procurement',
  'delivery_credibility',
  'internal_politics',
  'external_shock',
  'evaluation_error',
  'monitoring_failure',
  'unknown',
]);
export type FailureCategory = z.infer<typeof FailureCategorySchema>;

export const RegretLabelSchema = z.enum(['observed_regret', 'estimated_regret', 'unknown_regret']);
export type RegretLabel = z.infer<typeof RegretLabelSchema>;

export const EvaluationSchema = z.object({
  id: z.string().uuid(),
  episode_id: z.string().uuid(),
  decision_id: z.string().uuid().nullable().optional(),
  evaluator_holon_id: z.string().uuid().nullable().optional(),
  decision_quality_score: z.number().min(0).max(100),
  evidence_quality_score: z.number().min(0).max(100),
  process_quality_score: z.number().min(0).max(100),
  outcome_quality_score: z.number().min(0).max(100),
  commercial_fitness_score: z.number().min(0).max(100),
  constraint_compliant: z.boolean().default(true),
  primary_failure_category: FailureCategorySchema.nullable().optional(),
  secondary_failure_category: z.string().nullable().optional(),
  lesson: z.string(),
  confidence: z.number().min(0).max(1).default(0.8),
  observed_regret: z.number().nullable().optional(),
  estimated_regret: z.number().nullable().optional(),
  regret_label: RegretLabelSchema.default('unknown_regret'),
  human_reviewed: z.boolean().default(false),
  human_agreement: z.boolean().nullable().optional(),
  created_at: z.string().or(z.date()),
});
export type Evaluation = z.infer<typeof EvaluationSchema>;

// ==============================================================================
// 9. POLICIES & EVOLUTION
// ==============================================================================
export const PolicyTypeSchema = z.enum([
  'rule_based',
  'prompt_policy',
  'statistical',
  'bandit',
  'rl',
  'hybrid',
]);
export type PolicyType = z.infer<typeof PolicyTypeSchema>;

export const PolicyStatusSchema = z.enum([
  'candidate',
  'shadow',
  'experiment',
  'active',
  'retired',
]);
export type PolicyStatus = z.infer<typeof PolicyStatusSchema>;

export const PolicySchema = z.object({
  id: z.string().uuid(),
  holon_id: z.string().uuid(),
  name: z.string(),
  version: z.string(),
  policy_type: PolicyTypeSchema,
  configuration: z.record(z.any()).default({}),
  training_data_window: z.record(z.any()).default({}),
  evaluation_metrics: z.record(z.any()).default({}),
  status: PolicyStatusSchema.default('candidate'),
  created_at: z.string().or(z.date()),
  activated_at: z.string().or(z.date()).nullable().optional(),
  retired_at: z.string().or(z.date()).nullable().optional(),
});
export type Policy = z.infer<typeof PolicySchema>;

export const OperatorTypeSchema = z.enum([
  'adapt_policy',
  'adapt_harness',
  'adapt_topology',
  'spawn',
  'merge',
  'retire',
]);
export type OperatorType = z.infer<typeof OperatorTypeSchema>;

export const EvolutionProposalSchema = z.object({
  id: z.string().uuid(),
  current_structure_id: z.string().uuid().nullable().optional(),
  candidate_structure: z.record(z.any()),
  operator_type: OperatorTypeSchema,
  hypothesis: z.string(),
  supporting_trajectory_ids: z.array(z.string().uuid()).default([]),
  supporting_metrics: z.record(z.any()).default({}),
  expected_gain: z.number().default(0),
  expected_complexity_cost: z.number().default(0),
  risk: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  confidence: z.number().min(0).max(1).default(0.5),
  status: z.enum(['proposed', 'reviewing', 'approved', 'rejected', 'executed']).default('proposed'),
  human_decision: z.string().nullable().optional(),
  created_at: z.string().or(z.date()),
  resolved_at: z.string().or(z.date()).nullable().optional(),
});
export type EvolutionProposal = z.infer<typeof EvolutionProposalSchema>;
