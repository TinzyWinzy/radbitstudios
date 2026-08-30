'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';

export default function LearningPoliciesPage({ params: _params }: { params: { locale: string } }) {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/aehml/data')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setPolicies(json.data.policies);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const buckets = [
    { label: '0-10%', count: 1, actualWinRate: '0%' },
    { label: '10-20%', count: 1, actualWinRate: '0%' },
    { label: '20-40%', count: 1, actualWinRate: '0%' },
    { label: '40-60%', count: 2, actualWinRate: '50%' },
    { label: '60-80%', count: 2, actualWinRate: '65%' },
    { label: '80-100%', count: 1, actualWinRate: '100%' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-400" />
          Learning Layer & Forecast Calibration
        </h1>
        <p className="text-xs text-slate-400">
          Section 30, 31 & 34: Policy promotion pipeline (Candidate → Shadow → Experiment → Active → Retired) and calibration tracking by probability buckets.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-xs">Loading Calibration Metrics...</div>
      ) : (
        <>
          {/* Forecast Calibration Grid */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">Probability Forecast Calibration (Section 30)</h2>
              <span className="text-xs font-mono text-emerald-400">Calibration Index: 0.88</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {buckets.map((b) => (
                <div key={b.label} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center font-mono">
                  <div className="text-xs text-slate-400">{b.label}</div>
                  <div className="text-lg font-bold text-slate-100 mt-1">{b.count} deals</div>
                  <div className="text-[11px] text-cyan-400 mt-0.5">Win: {b.actualWinRate}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Registry */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">Commercial Action Policy Registry</h2>
            <div className="space-y-3">
              {policies.map((pol) => (
                <div key={pol.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{pol.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {pol.version} • {pol.policy_type}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px] uppercase">
                      {pol.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono text-[11px]">
                    Target: Next-Action Selection across buyer state matrix (Section 31)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
