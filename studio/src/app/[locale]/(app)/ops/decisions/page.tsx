'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function DecisionsApprovalsPage({ params: _params }: { params: { locale: string } }) {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [overrideModal, setOverrideModal] = useState<any>(null);
  const [overrideAction, setOverrideAction] = useState<string>('CALL');
  const [overrideReason, setOverrideReason] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/aehml/data');
      const json = await res.json();
      if (json.success) {
        setDecisions(json.data.decisions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (decisionId: string) => {
    try {
      const res = await fetch('/api/aehml/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionId,
          actionType: 'approve',
          operatorId: 'operator-tinotenda',
        }),
      });
      const json = await res.json();
      if (json.success) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModal) return;
    try {
      const res = await fetch('/api/aehml/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionId: overrideModal.id,
          actionType: 'override',
          operatorId: 'operator-tinotenda',
          overrideAction,
          overrideReason,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setOverrideModal(null);
        setOverrideReason('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          Decision Approvals & Human Overrides
        </h1>
        <p className="text-xs text-slate-400">
          Section 12: Human overrides are critical training evidence — never treated as failures.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-xs">Loading Decisions...</div>
      ) : (
        <div className="space-y-4">
          {decisions.map((dec) => (
            <div
              key={dec.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold text-xs">
                    {dec.recommended_action}
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    Confidence: {(dec.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded ${
                      dec.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : dec.status === 'overridden'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}
                  >
                    {dec.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                {dec.rationale}
              </p>

              {dec.status === 'proposed' && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setOverrideModal(dec)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium transition"
                  >
                    Override Decision
                  </button>
                  <button
                    onClick={() => handleApprove(dec.id)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition"
                  >
                    Approve Action
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-slate-100">Record Human Override</h2>
            <p className="text-xs text-slate-400">
              Captures operator intent to benchmark AEHML recommendation vs human action vs real outcome.
            </p>

            <form onSubmit={handleOverrideSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Recommended by AEHML</label>
                <input
                  type="text"
                  disabled
                  value={overrideModal.recommended_action}
                  className="w-full rounded-md bg-slate-950/50 border border-slate-800 px-3 py-2 text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Operator Chosen Action</label>
                <select
                  value={overrideAction}
                  onChange={(e) => setOverrideAction(e.target.value)}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="REJECT">REJECT</option>
                  <option value="RESEARCH">RESEARCH</option>
                  <option value="CONTACT">CONTACT</option>
                  <option value="QUESTION">QUESTION</option>
                  <option value="CALL">CALL</option>
                  <option value="DEMONSTRATE">DEMONSTRATE</option>
                  <option value="QUANTIFY">QUANTIFY</option>
                  <option value="DISCOVER">DISCOVER</option>
                  <option value="PROPOSE">PROPOSE</option>
                  <option value="FOLLOW_UP">FOLLOW_UP</option>
                  <option value="WAIT">WAIT</option>
                  <option value="ESCALATE">ESCALATE</option>
                  <option value="DISQUALIFY">DISQUALIFY</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Operator Rationale</label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why the human operator selected a different action..."
                  className="w-full rounded-md bg-slate-950 border border-slate-700 p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setOverrideModal(null)}
                  className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400"
                >
                  Save Override Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
