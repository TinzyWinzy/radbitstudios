'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Search } from 'lucide-react';

export default function EvidenceStorePage({ params: _params }: { params: { locale: string } }) {
  const [evidence, setEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetch('/api/aehml/data')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setEvidence(json.data.evidence);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = evidence.filter((e) => {
    const matchesSearch = e.claim.toLowerCase().includes(search.toLowerCase()) ||
      e.source.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || e.evidence_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-400" />
          Epistemic Evidence Repository
        </h1>
        <p className="text-xs text-slate-400">
          Section 8: Evidence hierarchy separating direct client statement, verified operational data, and inferences from speculation.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search empirical claims..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs rounded-md bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Evidence Types</option>
          <option value="direct_client_statement">direct_client_statement</option>
          <option value="verified_operational_data">verified_operational_data</option>
          <option value="observed_behavior">observed_behavior</option>
          <option value="client_document">client_document</option>
          <option value="existing_system">existing_system</option>
          <option value="demonstration">demonstration</option>
          <option value="strategic_inference">strategic_inference</option>
          <option value="speculation">speculation</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-xs">Loading Evidence...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                    {item.evidence_type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${
                      item.validation_status === 'verified'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.validation_status}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">{item.claim}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Source: {item.source}</span>
                <span>Conf: {((item.confidence_score || 0.8) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
