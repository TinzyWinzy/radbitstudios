'use client';

import React, { useEffect, useState } from 'react';
import { GitBranch } from 'lucide-react';

export default function EvolutionProposalsPage({ params: _params }: { params: { locale: string } }) {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/aehml/data')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setProposals(json.data.evolutionProposals);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-emerald-400" />
          Structural Evolution Proposals (Section 49–51)
        </h1>
        <p className="text-xs text-slate-400">
          Principle of Minimum Sufficient Evolution: Mutation proposals generated from accumulated trajectory evidence without autonomous execution.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-xs">Loading Evolution Proposals...</div>
      ) : (
        <div className="space-y-4">
          {proposals.map((prop) => (
            <div
              key={prop.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold text-xs">
                    {prop.operator_type}
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    Confidence: {(prop.confidence * 100).toFixed(0)}% • Risk: {prop.risk}
                  </span>
                </div>

                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                  STATUS: {prop.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-slate-300 font-semibold">Evolution Hypothesis:</div>
                <p className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200 leading-relaxed font-sans">
                  {prop.hypothesis}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px] pt-2">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-500">EXPECTED GAIN</div>
                    <div className="text-emerald-400 font-bold text-xs mt-0.5">+${prop.expected_gain.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-500">COMPLEXITY COST</div>
                    <div className="text-amber-400 font-bold text-xs mt-0.5">-${prop.expected_complexity_cost.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-500">SUPPORTING TRAJECTORIES</div>
                    <div className="text-slate-200 font-bold text-xs mt-0.5">{prop.supporting_trajectory_ids.length} recorded</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
