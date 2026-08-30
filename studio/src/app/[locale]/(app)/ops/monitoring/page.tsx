'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function MonitoringAlertsPage({ params: _params }: { params: { locale: string } }) {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/aehml/data')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setInterventions(json.data.interventions);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
          Monitor Holon Interventions & Risk Watchdogs
        </h1>
        <p className="text-xs text-slate-400">
          Section 24: Active watchdogs for stage inflation, stalled momentum, low-value resource drain, and constitutional proximity.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-xs">Loading Monitor Interventions...</div>
      ) : (
        <div className="space-y-4">
          {interventions.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
              No active monitor warnings or workflow interrupts detected.
            </div>
          ) : (
            interventions.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold uppercase text-slate-100">
                      {item.risk_type.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                        item.severity === 'critical' || item.severity === 'high'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      Severity: {item.severity}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    {item.interrupted_execution ? (
                      <strong className="text-rose-400">WORKFLOW INTERRUPTED</strong>
                    ) : (
                      'ADVISORY WARNING'
                    )}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-slate-300 font-semibold">Recommended Intervention:</div>
                  <p className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200 leading-relaxed font-sans">
                    {item.recommended_action}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
