'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
} from 'lucide-react';

export default function OpportunityDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const locale = params?.locale || 'en';
  const oppId = params?.id;

  const [opp, setOpp] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [hypotheses, setHypotheses] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'hypotheses' | 'decisions' | 'trace'>('overview');
  const [runningCycle, setRunningCycle] = useState(false);
  const [fieldNote, setFieldNote] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/aehml/data');
      const json = await res.json();
      if (json.success) {
        const found = json.data.opportunities.find((o: any) => o.id === oppId);
        setOpp(found || null);
        setEvidence(json.data.evidence.filter((e: any) => e.opportunity_id === oppId));
        setHypotheses(json.data.hypotheses.filter((h: any) => h.opportunity_id === oppId));
        setDecisions(json.data.decisions.filter((d: any) => d.opportunity_id === oppId));
        setEvents(json.data.events.filter((ev: any) => ev.opportunity_id === oppId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [oppId]);

  useEffect(() => {
    loadData();
  }, [loadData, oppId]);

  const handleRunCycle = async () => {
    try {
      setRunningCycle(true);
      const res = await fetch('/api/aehml/cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: oppId,
          rawNotes: fieldNote,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFieldNote('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunningCycle(false);
    }
  };

  if (loading || !opp) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Opportunity Epistemic Command Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <Link
            href={`/${locale}/ops/opportunities`}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Pipeline
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-100">{opp.organization_name}</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              Score: {opp.opportunity_score}/100
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase">
              {opp.stage}
            </span>
          </div>
        </div>

        <button
          onClick={handleRunCycle}
          disabled={runningCycle}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-emerald-950 disabled:opacity-50"
        >
          {runningCycle ? (
            <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current" />
          )}
          <span>Execute Multi-Holon Cycle</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-medium">
        {[
          { id: 'overview', label: 'Commercial Overview' },
          { id: 'evidence', label: `Evidence (${evidence.length})` },
          { id: 'hypotheses', label: `Hypotheses (${hypotheses.length})` },
          { id: 'decisions', label: `Decisions (${decisions.length})` },
          { id: 'trace', label: `Epistemic Trace (${events.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 border-b-2 transition ${
              activeTab === tab.id
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h2 className="text-sm font-semibold text-slate-200">Commercial Snapshot</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">CONTRACT VALUE</div>
                  <div className="text-slate-100 font-bold text-sm mt-0.5">${(opp.estimated_contract_value || 0).toLocaleString()}</div>
                </div>
                <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">GROSS MARGIN</div>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">{((opp.estimated_gross_margin || 0.65) * 100).toFixed(0)}%</div>
                </div>
                <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">P(WIN)</div>
                  <div className="text-cyan-400 font-bold text-sm mt-0.5">{((opp.probability_win || 0.1) * 100).toFixed(0)}%</div>
                </div>
                <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">EXPECTED VALUE</div>
                  <div className="text-amber-400 font-bold text-sm mt-0.5">${(opp.expected_value || 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Buyer State:</span>
                  <span className="text-slate-200 font-mono font-medium">{opp.buyer_state || 'unknown'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Economic Buyer:</span>
                  <span className="text-slate-200">{opp.economic_buyer || 'Unverified'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Champion:</span>
                  <span className="text-slate-200">{opp.champion || 'Unverified'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Primary Commercial Risk:</span>
                  <span className="text-rose-400">{opp.primary_risk || 'None specified'}</span>
                </div>
              </div>
            </div>

            {/* Quick Note Input */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-200">
                Submit Raw Intelligence / Field Evidence
              </label>
              <textarea
                value={fieldNote}
                onChange={(e) => setFieldNote(e.target.value)}
                placeholder="Paste verbatim customer quote, RFP clause, or meeting telemetry..."
                rows={3}
                className="w-full text-xs rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleRunCycle}
                disabled={runningCycle || !fieldNote.trim()}
                className="px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition disabled:opacity-50"
              >
                Incorporate Evidence & Run Cycle
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">Recommended Next Action</h3>
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 font-mono text-center">
                <div className="text-lg font-bold text-emerald-400">{opp.next_action || 'RESEARCH'}</div>
                <div className="text-[11px] text-slate-400 mt-1">Owner: {opp.next_action_owner || 'Sales Holon'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Evidence Store */}
      {activeTab === 'evidence' && (
        <div className="space-y-3">
          {evidence.map((ev) => (
            <div key={ev.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                  {ev.evidence_type}
                </span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${
                  ev.validation_status === 'verified' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {ev.validation_status}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">{ev.claim}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>Source: {ev.source}</span>
                <span>Confidence: {(ev.confidence_score ? ev.confidence_score * 100 : 80).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Hypotheses */}
      {activeTab === 'hypotheses' && (
        <div className="space-y-3">
          {hypotheses.map((hyp) => (
            <div key={hyp.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{hyp.statement}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px] uppercase">
                  {hyp.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 space-y-1 font-mono text-[11px]">
                <div>Missing Evidence: <span className="text-slate-300">{hyp.missing_evidence || 'None'}</span></div>
                <div>Verification Action: <span className="text-cyan-400">{hyp.verification_action || 'None'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Decisions */}
      {activeTab === 'decisions' && (
        <div className="space-y-3">
          {decisions.map((dec) => (
            <div key={dec.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                  {dec.recommended_action}
                </span>
                <span className="text-xs text-slate-400 font-mono">Status: <strong className="text-slate-200 uppercase">{dec.status}</strong></span>
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{dec.rationale}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Epistemic Trace */}
      {activeTab === 'trace' && (
        <div className="space-y-2">
          {events.map((ev) => (
            <div key={ev.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-400 font-semibold">{ev.event_type}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Vincent: {ev.vincent_version} • Model: {ev.model_version} • Harness: {ev.harness_version}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
