import { describe, it, beforeAll, expect } from 'vitest';
import { newDb, DataType } from 'pg-mem';
import { v4 as uuidv4 } from 'uuid';

import { aehmlDb, seedAehmlDefaults } from '../db/client';
import { initAehmlPg } from '../db/schema';
import { getPool } from '../../sqlite';
import { Opportunity, Episode, Decision, MonitorIntervention } from '../types';

interface PgPoolLike {
  query: import('pg').Pool['query'];
}

declare global {
  var __radbitPgPool: PgPoolLike | undefined;
}

describe('AEHML PostgreSQL path (pg-mem in-memory Postgres)', () => {
  beforeAll(async () => {
    const db = newDb();
    db.registerExtension('uuid-ossp', (schema) => {
      schema.registerFunction({
        name: 'uuid_generate_v4',
        returns: DataType.uuid,
        implementation: () => uuidv4(),
      });
    });
    const { Pool } = db.adapters.createPg();
    global.__radbitPgPool = new Pool() as unknown as PgPoolLike;
    process.env.DATABASE_URL = 'postgres://pg-mem/pg-mem';
    seedAehmlDefaults();
    await initAehmlPg();
  });

  it('is reachable (selection 1) and performs schema + seed', async () => {
    const { rows } = await getPool().query('SELECT 1 AS ok');
    expect(rows[0].ok).toBe(1);
  });

  it('seeded entities round-trip via SQL', async () => {
    const holons = await aehmlDb.getHolons();
    expect(holons).toHaveLength(8);
    expect(Number.isFinite(holons[0].authority_scope)).toBe(false);

    const rules = await aehmlDb.getVincentRules();
    expect(rules.length).toBeGreaterThanOrEqual(7);
    expect(rules.every((r) => Number.isFinite(r.rule_expression) === false)).toBe(true);

    const opps = await aehmlDb.getOpportunities();
    expect(opps.length).toBeGreaterThanOrEqual(3);
    expect(opps[0].id).toBeDefined();
    expect(typeof opps[0].estimated_contract_value).toBe('number');
    expect(typeof opps[0].opportunity_score).toBe('number');

    const policies = await aehmlDb.getPolicies();
    expect(policies.length).toBeGreaterThanOrEqual(1);
    expect(typeof policies[0].configuration).toBe('object');

    const hyps = await aehmlDb.getHypothesesByOpportunity('all');
    expect(hyps.length).toBeGreaterThanOrEqual(2);
    const hypsByOpp = await aehmlDb.getHypothesesByOpportunity(opps[0].id);
    expect(Array.isArray(hypsByOpp)).toBe(true);
  });

  it('persists a full lifecycle: opportunity -> episode -> trajectory -> decisions', async () => {
    const oppId = uuidv4();
    const opp: Opportunity = {
      id: oppId,
      organization_name: 'PG MP Smoke',
      website: null,
      sector: 'Construction',
      country: 'Zimbabwe',
      source: 'pg-mem',
      stage: 'target',
      status: 'active',
      estimated_contract_value: 100000,
      estimated_gross_margin: 0.55,
      estimated_delivery_cost: 45000,
      probability_win: 0.3,
      expected_value: 30000,
      opportunity_score: 61,
      confidence: 'moderate',
      economic_buyer: null,
      champion: null,
      problem_owner: null,
      technical_buyer: null,
      buyer_state: 'problem_unaware',
      decision_window: null,
      next_action: 'RESEARCH',
      next_action_owner: null,
      primary_risk: null,
      loss_condition: null,
      closed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await aehmlDb.saveOpportunity(opp);
    const read = await aehmlDb.getOpportunityById(oppId);
    expect(read?.organization_name).toBe('PG MP Smoke');
    expect(read?.opportunity_score).toBe(61);
    expect(read?.expected_value).toBe(30000);
    expect(read?.closed_at).toBeNull();

    const episodeId = uuidv4();
    const episode: Episode = {
      id: episodeId,
      opportunity_id: oppId,
      started_at: new Date().toISOString(),
      starting_stage: 'target',
      objective: 'pg-mem lifecycle',
      structure_version: 'v0.1.0',
      vincent_version: 'v0.1.0',
      status: 'in_progress',
    };
    await aehmlDb.saveEpisode(episode);
    const episodes = await aehmlDb.getEpisodesByOpportunity(oppId);
    expect(episodes.some((e) => e.id === episodeId)).toBe(true);

    const eventId = uuidv4();
    const event = await aehmlDb.recordTrajectoryEvent({
      id: eventId,
      episode_id: episodeId,
      opportunity_id: oppId,
      event_type: 'observation',
      state_before: { stage: 'target' },
      metadata: { smoke: true },
    });
    expect(event.vincent_version).toBe('v0.1.0');
    const events = await aehmlDb.getTrajectoryEventsByOpportunity(oppId);
    expect(events.some((e) => e.id === eventId)).toBe(true);

    const decisionId = uuidv4();
    const decision: Decision = {
      id: decisionId,
      episode_id: episodeId,
      opportunity_id: oppId,
      decision_type: 'next_commercial_action',
      recommended_action: 'RESEARCH',
      alternatives_considered: ['WAIT'],
      rationale: 'pg-mem',
      evidence_ids: [],
      confidence: 0.5,
      estimated_value: 1000,
      estimated_cost: 100,
      estimated_risk: 0.2,
      authority_required: {},
      human_approval_required: true,
      status: 'proposed',
      created_at: new Date().toISOString(),
    };
    await aehmlDb.saveDecision(decision);
    await aehmlDb.saveOverride({
      id: uuidv4(),
      decision_id: decisionId,
      original_action: 'RESEARCH',
      human_action: 'DEMONSTRATE',
      reason: 'pg-mem',
      operator_id: 'pg-mem-operator',
      created_at: new Date().toISOString(),
    });
    const decisions = await aehmlDb.getDecisions();
    const overridden = decisions.find((d) => d.id === decisionId);
    expect(overridden?.status).toBe('overridden');
    expect(Number.isFinite(overridden?.confidence)).toBe(true);

    const evals = await aehmlDb.getEvaluations();
    expect(Array.isArray(evals)).toBe(true);

    const interventionId = uuidv4();
    const intervention: MonitorIntervention = {
      id: interventionId,
      opportunity_id: oppId,
      episode_id: episodeId,
      monitor_holon_id: null,
      risk_type: 'qualification',
      severity: 'high',
      evidence: { reason: 'pg-mem' },
      recommended_action: 'PAUSE',
      interrupted_execution: false,
      created_at: new Date().toISOString(),
    };
    await aehmlDb.saveMonitorIntervention(intervention);
    const interventions = await aehmlDb.getMonitorInterventions();
    expect(interventions.some((i) => i.id === interventionId)).toBe(true);

    await getPool().query('DELETE FROM aehml_opportunities WHERE id = $1', [oppId]);
    expect(await aehmlDb.getOpportunityById(oppId)).toBeNull();
    expect((await aehmlDb.getTrajectoryEventsByOpportunity(oppId)).length).toBe(0);
  });

  it('read methods are consistent', async () => {
    const [holons, rules, opps, hyps, policies, interventions, allEvaluations] = await Promise.all([
      aehmlDb.getHolons(),
      aehmlDb.getVincentRules(),
      aehmlDb.getOpportunities(),
      aehmlDb.getHypothesesByOpportunity('all'),
      aehmlDb.getPolicies(),
      aehmlDb.getMonitorInterventions(),
      aehmlDb.getEvaluations(),
    ]);
    expect(holons.length).toBe(8);
    expect(rules.length).toBeGreaterThanOrEqual(7);
    expect(opps.length).toBeGreaterThanOrEqual(3);
    expect(hyps.length).toBeGreaterThanOrEqual(2);
    expect(policies.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(interventions)).toBe(true);
    expect(Array.isArray(allEvaluations)).toBe(true);
  });
});