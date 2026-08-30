'use client';

import React, { useEffect, useState } from 'react';
import { Cpu } from 'lucide-react';

export default function HolonRegistryPage({ params: _params }: { params: { locale: string } }) {
  const [holons, setHolons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/aehml/data')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setHolons(json.data.holons);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-emerald-400" />
          First-Class Holon Registry & Harness Topology
        </h1>
        <p className="text-xs text-slate-400">
          Section 5 & 35: Every logical holon exists as an independent database object with explicit policy version, harness version, and authority scopes.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-xs">Loading Holon Registry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {holons.map((holon) => (
            <div
              key={holon.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-100">{holon.name}</h2>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {holon.type} • slug: {holon.slug}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px] uppercase">
                  {holon.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">{holon.objective}</p>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500">Capabilities:</span>{' '}
                  <span className="text-slate-200">{(holon.capabilities || []).join(', ')}</span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Policy: <strong className="text-emerald-400">{holon.policy_version}</strong></span>
                  <span>Harness: <strong className="text-cyan-400">{holon.harness_version}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
