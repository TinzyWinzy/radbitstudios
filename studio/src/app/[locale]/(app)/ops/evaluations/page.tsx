'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, BookOpen } from 'lucide-react';

export default function EvaluationsPage({ params: _params }: { params: { locale: string } }) {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/aehml/data')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setEvaluations(json.data.evaluations);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          Retrospective Evaluations & Decision Regret
        </h1>
        <p className="text-xs text-slate-400">
          Section 25, 26 & 29: 5-dimensional post-mortems, failure taxonomy classification, and quantitative regret measurement.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-xs">Loading Evaluations...</div>
      ) : (
        <div className="space-y-4">
          {evaluations.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Decision Quality: {item.decision_quality_score}%
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    Evidence: {item.evidence_quality_score}% • Process: {item.process_quality_score}%
                  </span>
                </div>

                <div className="text-xs font-mono">
                  <span className="text-slate-400">Regret: </span>
                  <span className="text-amber-400 font-bold">
                    ${(item.observed_regret ?? item.estimated_regret ?? 0).toLocaleString()} ({item.regret_label})
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <BookOpen className="h-4 w-4 text-cyan-400" />
                  <span className="font-semibold">Operating Lesson:</span>
                </div>
                <p className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200 leading-relaxed font-sans">
                  {item.lesson}
                </p>

                {item.primary_failure_category && (
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 pt-1">
                    <span className="text-slate-500">Primary Failure Taxonomy:</span>
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 uppercase">
                      {item.primary_failure_category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
