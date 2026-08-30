'use client';

import React, { useEffect, useState } from 'react';
import { Sliders } from 'lucide-react';

export default function VincentDoctrineSettingsPage({ params: _params }: { params: { locale: string } }) {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/aehml/data')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setRules(json.data.vincentRules);
      })
      .finally(() => setLoading(false));
  }, []);

  const scoringDimensions = [
    { name: 'Economic Impact', weight: 20, desc: 'Estimated contract value and budget size' },
    { name: 'Problem Severity', weight: 15, desc: 'Verified operational cost and leakage evidence' },
    { name: 'Urgency', weight: 15, desc: 'Decision window and immediate business pressure' },
    { name: 'Ability to Pay', weight: 10, desc: 'Solvency and allocated CapEx/OpEx funds' },
    { name: 'Authority Access', weight: 10, desc: 'Direct access to Economic Buyer or Decision Maker' },
    { name: 'Champion Strength', weight: 10, desc: 'Internal advocate alignment with Radbit' },
    { name: 'Solution Fit', weight: 10, desc: 'Technical match and gross margin capability' },
    { name: 'Timing', weight: 5, desc: 'Buyer state progression readiness' },
    { name: 'Expansion Potential', weight: 5, desc: 'Cross-sell and multi-site rollout capacity' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-emerald-400" />
          Vincent H4 Governance Doctrine & Scoring Matrix
        </h1>
        <p className="text-xs text-slate-400">
          Section 17, 18 & 19: Machine-readable constitutional hard rules, proposal gating criteria, and the 100-point Opportunity Score formula.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-xs">Loading Governance Settings...</div>
      ) : (
        <>
          {/* 100-Point Scoring Engine */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">Vincent Opportunity Scoring Weights (Total: 100)</h2>
              <span className="text-xs font-mono text-emerald-400">Model Version: v0.1.0</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {scoringDimensions.map((dim) => (
                <div key={dim.name} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{dim.name}</span>
                    <span className="font-mono text-emerald-400 font-bold">{dim.weight} pts</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{dim.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vincent Rules Engine */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">Machine-Readable Rule Registry</h2>
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{rule.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                        {rule.category} • {rule.rule_type}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                        rule.severity === 'hard'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {rule.severity} RULE
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
