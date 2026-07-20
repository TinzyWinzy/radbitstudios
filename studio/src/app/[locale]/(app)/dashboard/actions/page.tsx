"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";
import { ArrowLeft, ArrowRight, Check, CircleAlert, Loader2, Paperclip, Plus } from "lucide-react";
import { AuthContext } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTIVE_ACTION_STATUSES,
  addActionEvidence,
  createBusinessAction,
  isActionOverdue,
  listBusinessActions,
  updateBusinessAction,
} from "@/services/business-action.service";
import type { BusinessAction, BusinessActionPriority, BusinessActionStatus, EvidenceConfidence } from "@/types/business-action";

const STATUS_LABELS: Record<BusinessActionStatus, string> = {
  planned: "Planned",
  in_progress: "In progress",
  blocked: "Blocked",
  review: "Review",
  done: "Done",
  cancelled: "Cancelled",
};

const PRIORITY_LABELS: Record<BusinessActionPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function dueLabel(dueAt: BusinessAction["dueAt"]): string {
  if (!(dueAt instanceof Timestamp)) return "No deadline";
  return dueAt.toDate().toLocaleDateString("en-ZW", { day: "numeric", month: "short", year: "numeric" });
}

export default function ActionCentrePage() {
  const { user } = useContext(AuthContext);
  const [actions, setActions] = useState<BusinessAction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", ownerName: "", dueAt: "", priority: "medium" as BusinessActionPriority, confidence: "high" as EvidenceConfidence });
  const [evidence, setEvidence] = useState({ label: "", url: "" });

  const selected = actions.find(action => action.id === selectedId) || null;
  const activeCount = actions.filter(action => ACTIVE_ACTION_STATUSES.includes(action.status)).length;
  const overdueCount = actions.filter(action => isActionOverdue(action)).length;
  const completedCount = actions.filter(action => action.status === "done").length;

  async function refresh(preferredId?: string) {
    if (!user) return;
    const next = await listBusinessActions(user.uid);
    setActions(next);
    setSelectedId(preferredId || selectedId || next[0]?.id || null);
  }

  useEffect(() => {
    if (!user) return;
    let active = true;
    listBusinessActions(user.uid)
      .then(next => { if (active) { setActions(next); setSelectedId(next[0]?.id || null); } })
      .catch(() => { if (active) setError("Actions could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  const nextMove = useMemo(() => actions.find(action => ACTIVE_ACTION_STATUSES.includes(action.status)), [actions]);

  async function createAction() {
    if (!user || form.title.trim().length < 3) return;
    setSaving(true);
    setError("");
    try {
      const id = await createBusinessAction({
        userId: user.uid,
        title: form.title.trim(),
        description: form.description.trim(),
        ownerName: form.ownerName.trim() || user.displayName || "Business owner",
        priority: form.priority,
        confidence: form.confidence,
        source: "manual",
        dueAt: form.dueAt ? new Date(`${form.dueAt}T12:00:00`) : null,
      });
      setForm({ title: "", description: "", ownerName: "", dueAt: "", priority: "medium", confidence: "high" });
      setShowCreate(false);
      await refresh(id);
    } catch {
      setError("The action could not be created. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(action: BusinessAction, status: BusinessActionStatus) {
    setSaving(true);
    try {
      await updateBusinessAction(action.id, { status });
      await refresh(action.id);
    } finally {
      setSaving(false);
    }
  }

  async function saveOutcome(action: BusinessAction, outcome: string) {
    setSaving(true);
    try {
      await updateBusinessAction(action.id, { outcome });
      await refresh(action.id);
    } finally {
      setSaving(false);
    }
  }

  async function attachEvidence(action: BusinessAction) {
    if (!evidence.label.trim() || !evidence.url.trim()) return;
    setSaving(true);
    try {
      await addActionEvidence(action.id, action.evidence || [], evidence);
      setEvidence({ label: "", url: "" });
      await refresh(action.id);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/dashboard" className="decision-link mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Today</Link>
          <p className="eyebrow">Operating workflow</p>
          <h1 className="mt-3 font-headline text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Action Centre</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Turn business signals into owned, deadline-driven work. Complete actions with evidence and record the outcome.</p>
        </div>
        <Button onClick={() => setShowCreate(value => !value)}><Plus className="mr-2 h-4 w-4" /> New action</Button>
      </header>

      <section aria-label="Action summary" className="editorial-surface grid divide-y divide-border/70 overflow-hidden rounded-xl sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[{ label: "Active", value: activeCount }, { label: "Overdue", value: overdueCount }, { label: "Completed", value: completedCount }].map(item => <div key={item.label} className="px-5 py-4"><span className="eyebrow">{item.label}</span><span className="mt-2 block text-2xl font-semibold tabular-nums">{item.value}</span></div>)}
      </section>

      {nextMove && <section className="border-l-2 border-primary bg-primary/[0.045] px-5 py-4"><p className="eyebrow text-primary">Next move</p><div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{nextMove.title}</p><p className="mt-1 text-sm text-muted-foreground">{nextMove.ownerName} · {dueLabel(nextMove.dueAt)}</p></div><button type="button" onClick={() => setSelectedId(nextMove.id)} className="decision-link inline-flex items-center gap-2 text-sm font-semibold text-primary">Open action <ArrowRight className="h-4 w-4" /></button></div></section>}

      {showCreate && <section className="frost-surface rounded-2xl p-5 sm:p-7">
        <div className="mb-6"><p className="eyebrow">Capture work</p><h2 className="mt-2 font-headline text-xl font-semibold">Create an accountable action</h2></div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="action-title">Action</Label><Input id="action-title" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Submit outstanding PRAZ documentation" /></div>
          <div className="space-y-2"><Label htmlFor="action-owner">Owner</Label><Input id="action-owner" value={form.ownerName} onChange={event => setForm({ ...form, ownerName: event.target.value })} placeholder={user?.displayName || "Business owner"} /></div>
          <div className="space-y-2 lg:col-span-2"><Label htmlFor="action-description">Definition of done</Label><Textarea id="action-description" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Describe what must be true before this action is complete." /></div>
          <div className="space-y-2"><Label htmlFor="action-due">Deadline</Label><Input id="action-due" type="date" value={form.dueAt} onChange={event => setForm({ ...form, dueAt: event.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label htmlFor="action-priority">Priority</Label><select id="action-priority" className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={form.priority} onChange={event => setForm({ ...form, priority: event.target.value as BusinessActionPriority })}>{Object.entries(PRIORITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="action-confidence">Confidence</Label><select id="action-confidence" className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={form.confidence} onChange={event => setForm({ ...form, confidence: event.target.value as EvidenceConfidence })}><option value="high">High</option><option value="moderate">Moderate</option><option value="low">Low</option><option value="unknown">Unknown</option></select></div>
          </div>
        </div>
        <div className="mt-6 flex gap-3"><Button onClick={createAction} disabled={saving || form.title.trim().length < 3}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create action</Button><Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button></div>
      </section>}

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <div className="grid min-h-[30rem] overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[minmax(280px,.72fr)_minmax(0,1.28fr)]">
        <section aria-label="Actions" className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="border-b border-border px-5 py-4"><p className="eyebrow">Work queue</p></div>
          {loading ? <div className="grid min-h-48 place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : actions.length === 0 ? <div className="p-8"><p className="font-medium">No actions yet.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Create the first action when a signal requires a decision or accountable follow-through.</p></div> : <div className="divide-y divide-border/70">{actions.map(action => <button type="button" key={action.id} onClick={() => setSelectedId(action.id)} className={`decision-link flex w-full items-start gap-3 rounded-none px-5 py-4 text-left ${selectedId === action.id ? "bg-primary/[0.07]" : "hover:bg-foreground/[0.025]"}`}><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${action.status === "done" ? "bg-[hsl(var(--radbit-mineral))]" : isActionOverdue(action) || action.priority === "critical" ? "bg-primary" : "bg-muted-foreground/50"}`} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{action.title}</span><span className="mt-1 block text-xs text-muted-foreground">{STATUS_LABELS[action.status]} · {dueLabel(action.dueAt)}</span></span></button>)}</div>}
        </section>

        <section aria-label="Action detail" className="bg-background/20 p-5 sm:p-7">
          {!selected ? <div className="grid h-full min-h-64 place-items-center text-center"><div><Check className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">Select an action to review its owner, evidence and outcome.</p></div></div> : <ActionDetail action={selected} saving={saving} evidence={evidence} setEvidence={setEvidence} onStatus={status => changeStatus(selected, status)} onOutcome={outcome => saveOutcome(selected, outcome)} onEvidence={() => attachEvidence(selected)} />}
        </section>
      </div>
    </div>
  );
}

function ActionDetail({ action, saving, evidence, setEvidence, onStatus, onOutcome, onEvidence }: { action: BusinessAction; saving: boolean; evidence: { label: string; url: string }; setEvidence: (value: { label: string; url: string }) => void; onStatus: (status: BusinessActionStatus) => void; onOutcome: (outcome: string) => void; onEvidence: () => void }) {
  const [outcome, setOutcome] = useState(action.outcome || "");
  useEffect(() => setOutcome(action.outcome || ""), [action.id, action.outcome]);
  return <div className="space-y-7">
    <div><div className="flex flex-wrap items-center gap-2"><span className="eyebrow">{PRIORITY_LABELS[action.priority]} priority</span>{isActionOverdue(action) && <span className="inline-flex items-center gap-1 text-xs font-medium text-primary"><CircleAlert className="h-3.5 w-3.5" /> Overdue</span>}</div><h2 className="mt-3 font-headline text-2xl font-semibold tracking-[-0.025em]">{action.title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{action.description || "No definition of done has been added."}</p></div>
    <dl className="grid gap-4 border-y border-border py-5 sm:grid-cols-3"><div><dt className="eyebrow">Owner</dt><dd className="mt-2 text-sm font-medium">{action.ownerName}</dd></div><div><dt className="eyebrow">Deadline</dt><dd className="mt-2 text-sm font-medium">{dueLabel(action.dueAt)}</dd></div><div><dt className="eyebrow">Confidence</dt><dd className="mt-2 text-sm font-medium capitalize">{action.confidence}</dd></div></dl>
    <div className="space-y-2"><Label htmlFor="action-status">Workflow state</Label><select id="action-status" className="h-11 w-full max-w-xs rounded-md border bg-background px-3 text-sm" value={action.status} disabled={saving} onChange={event => onStatus(event.target.value as BusinessActionStatus)}>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    <div className="space-y-3"><div><p className="text-sm font-medium">Completion evidence</p><p className="mt-1 text-xs text-muted-foreground">Attach a document, receipt, published page or other verifiable result.</p></div>{action.evidence?.length > 0 && <ul className="space-y-2">{action.evidence.map(item => <li key={`${item.label}-${item.url}`}><a href={item.url} target="_blank" rel="noreferrer" className="decision-link inline-flex items-center gap-2 text-sm text-primary hover:underline"><Paperclip className="h-3.5 w-3.5" /> {item.label}</a></li>)}</ul>}<div className="grid gap-2 sm:grid-cols-[.65fr_1fr_auto]"><Input aria-label="Evidence label" value={evidence.label} onChange={event => setEvidence({ ...evidence, label: event.target.value })} placeholder="PRAZ receipt" /><Input aria-label="Evidence URL" type="url" value={evidence.url} onChange={event => setEvidence({ ...evidence, url: event.target.value })} placeholder="https://…" /><Button variant="outline" onClick={onEvidence} disabled={saving || !evidence.label || !evidence.url}>Attach</Button></div></div>
    <div className="space-y-3"><div><Label htmlFor="action-outcome">Measured outcome</Label><p className="mt-1 text-xs text-muted-foreground">Record what changed—not merely what was completed.</p></div><Textarea id="action-outcome" value={outcome} onChange={event => setOutcome(event.target.value)} placeholder="Example: Compliance score increased from 62 to 84; tender submission unblocked." /><Button variant="outline" onClick={() => onOutcome(outcome)} disabled={saving || outcome === action.outcome}>Save outcome</Button></div>
  </div>;
}
