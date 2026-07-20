"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import type { DiagnosticTool } from "@/data/diagnostic-tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DiagnosticToolEngine({ tool }: { tool: DiagnosticTool }) {
  const defaults = Object.fromEntries(tool.questions.map(q => [q.id, q.defaultValue || 0]));
  const [values, setValues] = useState<Record<string, number>>(defaults);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [lead, setLead] = useState({ fullName: "", workEmail: "", companyName: "" });
  const total = useMemo(() => Object.values(values).reduce((sum, value) => sum + Number(value || 0), 0), [values]);
  const result = useMemo(() => {
    if (tool.mode === "leakage") {
      const exposure = (values.leads || 0) * ((values.missed || 0) / 100) * ((values.conversion || 0) / 100) * (values.value || 0);
      return { value: exposure, label: `$${Math.round(exposure).toLocaleString()} estimated monthly exposure`, band: exposure < 250 ? tool.low : exposure < 1500 ? tool.medium : tool.high };
    }
    if (tool.mode === "cost") return { value: total, label: `$${Math.round(total * .8).toLocaleString()}–$${Math.round(total * 1.35).toLocaleString()} preliminary range`, band: total < 1800 ? tool.low : total < 7000 ? tool.medium : tool.high };
    return { value: total, label: `${Math.round(total)} / 100 readiness score`, band: total < 45 ? tool.low : total < 75 ? tool.medium : tool.high };
  }, [tool, total, values]);

  async function sendLead(event: React.FormEvent) {
    event.preventDefault(); setSending(true);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...lead, serviceInterest: tool.slug, referralSource: `diagnostic:${tool.slug}`, message: `${result.label}. ${result.band}` }) });
      if (response.ok) setSent(true);
    } finally { setSending(false); }
  }

  return <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]">
    <form onSubmit={event => { event.preventDefault(); setSubmitted(true); }} className="space-y-7">
      {tool.questions.map((question, index) => <fieldset key={question.id} className="border-t border-border pt-5">
        <legend className="flex gap-3 font-medium"><span className="text-xs tabular-nums text-primary">0{index + 1}</span>{question.label}</legend>
        {question.help && <p className="mt-2 text-sm text-muted-foreground">{question.help}</p>}
        {question.type === "select" && <select value={values[question.id]} onChange={e => setValues({ ...values, [question.id]: Number(e.target.value) })} className="mt-4 h-11 w-full border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{question.options?.map(option => <option key={option.label} value={option.value}>{option.label}</option>)}</select>}
        {question.type === "number" && <Input className="mt-4" type="number" min={question.min} max={question.max} value={values[question.id]} onChange={e => setValues({ ...values, [question.id]: Number(e.target.value) })} />}
        {question.type === "check" && <label className="mt-4 flex cursor-pointer items-center gap-3"><input type="checkbox" checked={values[question.id] > 0} onChange={e => setValues({ ...values, [question.id]: e.target.checked ? (question.options?.[0].value || 0) : 0 })} className="size-5 accent-primary" /><span className="text-sm">{question.options?.[0].label || "Yes"}</span></label>}
      </fieldset>)}
      <Button type="submit" size="lg">Calculate my result</Button>
    </form>

    <aside className="lg:sticky lg:top-24 lg:self-start">
      {!submitted ? <div className="border-l-2 border-border bg-muted/20 p-7"><p className="font-headline text-2xl font-semibold">Your result stays visible.</p><p className="mt-3 text-sm leading-6 text-muted-foreground">Complete the questions and see the diagnosis immediately. No email gate.</p></div> : <div aria-live="polite" className="border-l-2 border-primary bg-muted/20 p-7"><p className="text-xs font-semibold uppercase tracking-wider text-primary">Your result</p><p className="mt-3 font-headline text-3xl font-semibold">{result.label}</p><p className="mt-4 leading-7 text-muted-foreground">{result.band}</p><Link href={tool.serviceHref} className="mt-6 inline-flex items-center gap-2 font-medium text-primary">Explore {tool.serviceLabel} <ArrowRight className="size-4" /></Link>
        <div className="my-7 border-t border-border" />
        {sent ? <p className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="size-4 text-primary" /> Assessment sent to Radbit. We will follow up.</p> : <form onSubmit={sendLead} className="space-y-3"><p className="text-sm font-medium">Want help interpreting it? <span className="font-normal text-muted-foreground">Contact details are optional.</span></p><Input required aria-label="Full name" placeholder="Full name" value={lead.fullName} onChange={e => setLead({ ...lead, fullName: e.target.value })} /><Input required type="email" aria-label="Work email" placeholder="Work email" value={lead.workEmail} onChange={e => setLead({ ...lead, workEmail: e.target.value })} /><Input aria-label="Company" placeholder="Company (optional)" value={lead.companyName} onChange={e => setLead({ ...lead, companyName: e.target.value })} /><Button className="w-full" variant="outline" disabled={sending}>{sending && <Loader2 className="mr-2 size-4 animate-spin" />}Request a discussion</Button></form>}
      </div>}
    </aside>
  </div>;
}
