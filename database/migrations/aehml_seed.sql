-- ==============================================================================
-- RADBIT AEHML KERNEL v0.1 SEED DATA
-- ==============================================================================

-- 1. SEED 8 CORE HOLONS
INSERT INTO aehml_holons (id, name, slug, type, objective, authority_scope, capabilities, status, policy_version, harness_version)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Executive Holon', 'executive', 'executive', 
   'Synthesize multi-holon perspectives, coordinate handoffs, prepare decision packages for human operator approval.',
   '{"read": ["all"], "write": ["decisions", "handoffs", "episodes"], "execute": ["escalate_to_human"]}'::jsonb,
   '["synthesis", "priority_weighting", "decision_framing"]'::jsonb,
   'active', 'v0.1.0', 'v0.1.0'),

  ('11111111-1111-1111-1111-111111111102', 'Intelligence Holon', 'intelligence', 'operational', 
   'Observe external market signals, extract verified empirical claims, categorize evidence, generate competing hypotheses.',
   '{"read": ["public_data", "documents", "evidence"], "write": ["evidence_items", "hypotheses"]}'::jsonb,
   '["claim_extraction", "source_validation", "hypothesis_generation"]'::jsonb,
   'active', 'v0.1.0', 'v0.1.0'),

  ('11111111-1111-1111-1111-111111111103', 'Sales Holon', 'sales', 'operational', 
   'Diagnose buyer state, select optimal commercial behaviour mode, recommend lowest-cost next commercial action.',
   '{"read": ["opportunity", "evidence", "hypotheses"], "write": ["recommendations"]}'::jsonb,
   '["buyer_state_modeling", "next_action_selection", "commercial_framing"]'::jsonb,
   'active', 'v0.1.0', 'v0.1.0'),

  ('11111111-1111-1111-1111-111111111104', 'Delivery Holon', 'delivery', 'operational', 
   'Evaluate technical feasibility, calculate delivery hours & cost, protect delivery margins, gate irresponsible proposals.',
   '{"read": ["technical_requirements", "evidence", "capacity"], "write": ["feasibility_assessments", "scope_limits"]}'::jsonb,
   '["feasibility_analysis", "effort_estimation", "margin_protection", "scope_gating"]'::jsonb,
   'active', 'v0.1.0', 'v0.1.0'),

  ('11111111-1111-1111-1111-111111111105', 'Vincent H4 Governance', 'vincent_h4', 'governance', 
   'Enforce constitutional bounds, calculate 100-point opportunity scores, enforce commercial discipline, execute kill rules.',
   '{"read": ["all"], "write": ["governance_verdicts", "opportunity_scores", "kill_triggers"]}'::jsonb,
   '["constitutional_auditing", "score_calculation", "pricing_governance", "kill_gate"]'::jsonb,
   'active', 'v0.1.0', 'v0.1.0'),

  ('11111111-1111-1111-1111-111111111106', 'Red Team Holon', 'red_team', 'red_team', 
   'Stress-test commercial enthusiasm, uncover fatal assumptions, formulate CFO/technical challenges, design cheapest disconfirming tests.',
   '{"read": ["all"], "write": ["adversarial_challenges", "disconfirming_tests", "kill_recommendations"]}'::jsonb,
   '["adversarial_reasoning", "assumption_invalidation", "counterfactual_stress_test"]'::jsonb,
   'active', 'v0.1.0', 'v0.1.0'),

  ('11111111-1111-1111-1111-111111111107', 'Monitor Holon', 'monitor', 'monitor', 
   'Watch active deals for stage inflation, stalled momentum, evidence decay, low-value resource drain, trigger interrupts.',
   '{"read": ["all_traces", "active_deals"], "write": ["monitor_interventions", "interrupts"]}'::jsonb,
   '["drift_detection", "stall_monitoring", "stage_inflation_detection", "anomaly_interception"]'::jsonb,
   'active', 'v0.1.0', 'v0.1.0'),

  ('11111111-1111-1111-1111-111111111108', 'Evaluator Holon', 'evaluator', 'evaluator', 
   'Perform retrospective post-mortems on closed episodes, calculate decision regret, classify failure categories, record lessons.',
   '{"read": ["episodes", "decisions", "outcomes", "events"], "write": ["evaluations", "regret_metrics", "lessons"]}'::jsonb,
   '["post_mortem_analysis", "regret_quantification", "failure_taxonomy_classification", "epistemic_calibration"]'::jsonb,
   'active', 'v0.1.0', 'v0.1.0')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  objective = EXCLUDED.objective,
  authority_scope = EXCLUDED.authority_scope,
  capabilities = EXCLUDED.capabilities;

-- 2. SEED INITIAL ACTIVE STRUCTURE v0.1.0
INSERT INTO aehml_structures (id, version, description, holon_graph, communication_graph, authority_graph, status, activated_at)
VALUES
  ('22222222-2222-2222-2222-222222222201', 'v0.1.0', 'Initial baseline flat-holarchy with centralized Vincent H4 governance and Human-in-the-Loop decision gate.',
   '{"executive": ["intelligence", "sales", "delivery", "vincent_h4", "red_team", "monitor", "evaluator"]}'::jsonb,
   '{"intelligence": ["executive", "sales"], "sales": ["delivery", "vincent_h4", "red_team"], "vincent_h4": ["executive", "sales"], "delivery": ["executive", "sales"], "red_team": ["executive"]}'::jsonb,
   '{"human": ["final_external_action"], "vincent_h4": ["proposal_kill_gate", "scoring_gate"], "monitor": ["interrupt_workflow"]}'::jsonb,
   'active', NOW())
ON CONFLICT (version) DO NOTHING;

-- 3. SEED VINCENT H4 CONSTITUTIONAL & HEURISTIC RULES
INSERT INTO aehml_vincent_rules (id, category, name, description, rule_type, severity, active, rule_expression, version)
VALUES
  -- Constitutional Hard Rules
  ('33333333-3333-3333-3333-333333333301', 'Epistemic Integrity', 'No Fabricated Capability', 
   'System must not claim deployed capability unless evidence status = deployed or validated.', 
   'constitutional', 'hard', true, '{"condition": "claim.type == ''capability''", "require": "evidence.validation_status in [''verified'', ''deployed'']"}'::jsonb, 'v0.1.0'),

  ('33333333-3333-3333-3333-333333333302', 'Commercial Ethics', 'No Fabricated Testimonials', 
   'System must never produce or imply client endorsements without verified signed release.', 
   'constitutional', 'hard', true, '{"prohibit": "unverified_testimonials"}'::jsonb, 'v0.1.0'),

  ('33333333-3333-3333-3333-333333333303', 'Commercial Ethics', 'No False Scarcity', 
   'Never manufacture synthetic deadlines or artificial capacity limits.', 
   'constitutional', 'hard', true, '{"prohibit": "synthetic_scarcity"}'::jsonb, 'v0.1.0'),

  ('33333333-3333-3333-3333-333333333304', 'Safety & Governance', 'No Autonomous External Messages', 
   'All external communications require human operator review and explicit sign-off in V0.1.', 
   'constitutional', 'hard', true, '{"require": "human_approval_required == true"}'::jsonb, 'v0.1.0'),

  ('33333333-3333-3333-3333-333333333305', 'Delivery Governance', 'No Promises Beyond Delivery Capability', 
   'Proposals cannot be issued if Delivery Holon delivery_feasible == false or delivery_risk > 0.85.', 
   'proposal_gate', 'hard', true, '{"gate": "delivery_feasible == true and delivery_risk <= 0.85"}'::jsonb, 'v0.1.0'),

  ('33333333-3333-3333-3333-333333333306', 'Pricing Governance', 'No Hidden Pricing or Unfunded Scope', 
   'All proposals must explicitly itemize delivery cost, support expectations, and payment schedule.', 
   'pricing', 'hard', true, '{"require": ["delivery_cost", "payment_milestones", "scope_boundaries"]}'::jsonb, 'v0.1.0'),

  ('33333333-3333-3333-3333-333333333307', 'Commercial Discipline', 'Kill Rule: Low Score Deprioritization', 
   'Opportunities scoring below 50 must be deprioritized or killed unless fresh evidence verifies economic significance.', 
   'kill_rule', 'advisory', true, '{"trigger": "opportunity_score < 50", "recommended_action": "DISQUALIFY"}'::jsonb, 'v0.1.0')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED BASELINE ACTION POLICY
INSERT INTO aehml_policies (id, holon_id, name, version, policy_type, configuration, status)
VALUES
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111103', 'Baseline Sales Action Policy', 'v0.1.0',
   'rule_based', 
   '{"matrix": [
      {"buyer_state": "problem_unaware", "min_score": 0, "action": "RESEARCH"},
      {"buyer_state": "problem_aware", "min_score": 50, "action": "QUESTION"},
      {"buyer_state": "solution_aware", "min_score": 65, "action": "QUANTIFY"},
      {"buyer_state": "vendor_comparing", "min_score": 75, "action": "DEMONSTRATE"},
      {"buyer_state": "commercially_ready", "min_score": 80, "action": "PROPOSE"},
      {"buyer_state": "politically_blocked", "min_score": 0, "action": "ESCALATE"},
      {"buyer_state": "interested_unfunded", "min_score": 0, "action": "WAIT"}
    ]}'::jsonb,
   'active')
ON CONFLICT (id) DO NOTHING;
