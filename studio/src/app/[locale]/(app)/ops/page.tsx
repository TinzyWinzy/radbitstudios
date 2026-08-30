'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Play,
  ArrowRight,
  Layers,
} from 'lucide-react';

export default function OpsDashboardPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale || 'en';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningCycle, setRunningCycle] = useState(false);
  const [selectedOppId, setSelectedOppId] = useState<string>('');
  const [fieldNote, setFieldNote] = useState('');
  const [cycleResult, setCycleResult] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/aehml/data');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        if (json.data.opportunities.length > 0) {
          setSelectedOppId(prev => prev || json.data.opportunities[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRunCycle = async () => {
    if (!selectedOppId) return;
    try {
      setRunningCycle(true);
      setCycleResult(null);
      const res = await fetch('/api/aehml/cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: selectedOppId,
          rawNotes: fieldNote,
          objective: 'Run standard commercial decision cycle and determine optimal next action',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCycleResult(json.data);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunningCycle(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing AEHML Holon Registry & Event Trajectories...</span>
        </div>
      </div>
    );
  }

  const { metrics, opportunities, decisions, holons } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>PIPELINE EXPECTED VALUE</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(metrics?.pipelineEV || 0).toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Total Value:</span>
            <span className="text-slate-300 font-mono font-medium">${(metrics?.totalContractValue || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>HUMAN AGREEMENT RATE</span>
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{(metrics?.approvalRate || 100).toFixed(1)}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across <span className="text-slate-200 font-mono font-medium">{metrics?.totalDecisions || 0}</span> holonic recommendations
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>AVG DECISION REGRET</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">${(metrics?.avgRegret || 0).toFixed(0)}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Target: <span className="text-emerald-400 font-mono">Reduce to $0</span> via shadow policy learning
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>ACTIVE MONITOR ALERTS</span>
            <AlertOctagon className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{metrics?.activeAlerts || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Watchdogs: stage inflation, stalls & drift
          </div>
        </div>
      </div>

      {/* Main Grid: Decision Cycle Runner & Active Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Multi-Holon Invocation Trigger */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 rounded-xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-200">Run Decision Cycle</h2>
            </div>
            <p className="text-xs text-slate-400">
              Executes the complete multi-holon pipeline (Intelligence → Vincent H4 → Delivery → Red Team → Executive) with immutable trajectory logging.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Select Target Opportunity</label>
                <select
                  value={selectedOppId}
                  onChange={(e) => setSelectedOppId(e.target.value)}
                  className="w-full text-xs rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {(opportunities || []).map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {o.organization_name} ({o.sector} • Score: {o.opportunity_score})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">New Market Observation / Field Note (Optional)</label>
                <textarea
                  value={fieldNote}
                  onChange={(e) => setFieldNote(e.target.value)}
                  placeholder="e.g. Managing Director verified $8k/mo weighbridge revenue leakage on discovery call..."
                  rows={3}
                  className="w-full text-xs rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleRunCycle}
                disabled={runningCycle}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 disabled:opacity-50"
              >
                {runningCycle ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Executing Multi-Holon Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Execute Decision Cycle</span>
                  </>
                )}
              </button>
            </div>

            {cycleResult && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>Cycle Completed</span>
                  <span className="font-mono">{cycleResult.decision.recommended_action}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{cycleResult.summary}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-emerald-900/50 font-mono">
                  <span>Score: {cycleResult.vincentScore}/100 ({cycleResult.scoreBand})</span>
                  <Link
                    href={`/${locale}/ops/decisions`}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Review in Approvals <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Core Holon Topology Status */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                Active Holon Topology
              </span>
              <span className="text-[10px] font-mono text-slate-400">8 First-Class Holons</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {(holons || []).map((h: any) => (
                <div key={h.id} className="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-300 text-[11px]">{h.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">{h.type}</div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Opportunities & Recent Decisions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Opportunities Pipeline */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">Active Commercial Pipeline</h2>
                <p className="text-xs text-slate-400">Ranked by Vincent H4 Opportunity Score</p>
              </div>
              <Link
                href={`/${locale}/ops/opportunities`}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60">
              {(opportunities || []).map((opp: any) => (
                <div key={opp.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${locale}/ops/opportunities/${opp.id}`}
                        className="text-xs font-semibold text-slate-100 hover:text-emerald-400 transition"
                      >
                        {opp.organization_name}
                      </Link>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {opp.sector}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                        Score: {opp.opportunity_score}/100
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Stage: <strong className="text-slate-300 uppercase">{opp.stage}</strong></span>
                      <span>Next: <strong className="text-cyan-400 font-mono">{opp.next_action || 'RESEARCH'}</strong></span>
                      <span>EV: <strong className="text-slate-300 font-mono">${(opp.expected_value || 0).toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <Link
                    href={`/${locale}/ops/opportunities/${opp.id}`}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                  >
                    Inspect Trace
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Decisions & Recommendations */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">Recent Holon Decisions</h2>
                <p className="text-xs text-slate-400">Synthesized proposals awaiting or logged with human approval</p>
              </div>
              <Link
                href={`/${locale}/ops/decisions`}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                Approvals Center <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {(decisions || []).slice(0, 3).map((dec: any) => (
                <div key={dec.id} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-semibold text-xs">
                        {dec.recommended_action}
                      </span>
                      <span className="text-xs text-slate-300 font-mono">
                        Confidence: {(dec.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                      dec.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      dec.status === 'overridden' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}>
                      {dec.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">{dec.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
