'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  ArrowRight,
  Search,
  Filter,
} from 'lucide-react';

export default function OpportunitiesPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale || 'en';
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // Form state for creating opportunity
  const [orgName, setOrgName] = useState('');
  const [sector, setSector] = useState('Mining');
  const [contractVal, setContractVal] = useState('25000');
  const [econBuyer, setEconBuyer] = useState('');
  const [risk, setRisk] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/aehml/opportunities');
      const json = await res.json();
      if (json.success) setOpportunities(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/aehml/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_name: orgName,
          sector,
          estimated_contract_value: Number(contractVal),
          economic_buyer: econBuyer,
          primary_risk: risk,
          stage: 'target',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setOrgName('');
        setEconBuyer('');
        setRisk('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = opportunities.filter((o) => {
    const matchesSearch = o.organization_name.toLowerCase().includes(search.toLowerCase()) ||
      o.sector.toLowerCase().includes(search.toLowerCase());
    const matchesSector = sectorFilter === 'all' || o.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            Commercial Opportunities Pipeline
          </h1>
          <p className="text-xs text-slate-400">
            All commercial targets with explicit evidence representation, score calibration and next action recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
        >
          <Plus className="h-4 w-4" />
          <span>New Opportunity Target</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by company or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="text-xs rounded-md bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Sectors</option>
            <option value="Mining">Mining</option>
            <option value="Hospitality">Hospitality</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Fintech">Fintech</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-xs">Loading Opportunities...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{opp.organization_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                    Score: {opp.opportunity_score}/100
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{opp.sector}</span>
                  <span>Stage: <strong className="text-slate-300 uppercase">{opp.stage}</strong></span>
                </div>

                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 text-[11px] space-y-1 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Contract Value:</span>
                    <span className="text-slate-200">${(opp.estimated_contract_value || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Expected Value:</span>
                    <span className="text-emerald-400 font-semibold">${(opp.expected_value || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Recommended Action:</span>
                    <span className="text-cyan-400 font-semibold">{opp.next_action || 'RESEARCH'}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/${locale}/ops/opportunities/${opp.id}`}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-1"
              >
                <span>Command Center</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-slate-100">Create New Opportunity Target</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Delta Minerals Ltd"
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Mining">Mining</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Manufacturing">Manufacturing</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Estimated Contract Value ($ USD)</label>
                <input
                  type="number"
                  value={contractVal}
                  onChange={(e) => setContractVal(e.target.value)}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Economic Buyer</label>
                <input
                  type="text"
                  value={econBuyer}
                  onChange={(e) => setEconBuyer(e.target.value)}
                  placeholder="e.g. Tendai Chikore (CFO)"
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Primary Commercial Risk</label>
                <input
                  type="text"
                  value={risk}
                  onChange={(e) => setRisk(e.target.value)}
                  placeholder="e.g. Budget authorization requires parent board sign-off"
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
                >
                  Create Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
