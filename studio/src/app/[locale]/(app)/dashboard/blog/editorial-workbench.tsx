"use client";

import { useState } from "react";
import { BrainCircuit, ChevronRight, Loader2, Network, ShieldCheck } from "lucide-react";
import { generateEditorialBrief, type EditorialBriefOutput } from "@/ai/flows/generate-editorial-brief";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DraftPatch = {
  title: string;
  slug: string;
  excerpt: string;
  tags: string;
  content: Record<string, unknown>;
  editorial: EditorialBriefOutput;
};

function textNode(text: string) {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

function toRichText(brief: EditorialBriefOutput): Record<string, unknown> {
  const content: Record<string, unknown>[] = [];
  for (const section of brief.sections) {
    content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: section.heading }] });
    section.paragraphs.forEach(paragraph => content.push(textNode(paragraph)));
  }
  if (brief.faq.length) {
    content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Frequently asked questions" }] });
    brief.faq.forEach(item => {
      content.push({ type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: item.question }] });
      content.push(textNode(item.answer));
    });
  }
  content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Next step" }] });
  content.push(textNode(brief.suggestedCta));
  return { type: "doc", content };
}

export function EditorialWorkbench({ onApply }: { onApply: (patch: DraftPatch) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brief, setBrief] = useState<EditorialBriefOutput | null>(null);
  const [input, setInput] = useState({ topic: "", audience: "", targetKeyword: "", firsthandContext: "" });

  async function generate() {
    setLoading(true);
    setError("");
    try {
      setBrief(await generateEditorialBrief(input));
    } catch {
      setError("The editorial brief could not be generated. Check the topic and AI configuration, then try again.");
    } finally {
      setLoading(false);
    }
  }

  function apply() {
    if (!brief) return;
    onApply({
      title: brief.title,
      slug: brief.slug,
      excerpt: brief.excerpt,
      tags: [brief.primaryKeyword, ...brief.secondaryKeywords].join(", "),
      content: toRichText(brief),
      editorial: brief,
    });
    setOpen(false);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <button type="button" onClick={() => setOpen(value => !value)} className="flex w-full items-center justify-between gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset">
        <span className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><BrainCircuit className="h-5 w-5" /></span>
          <span><span className="block font-headline font-semibold">Editorial intelligence</span><span className="block text-sm text-muted-foreground">Research → strategy → draft → SEO → human review</span></span>
        </span>
        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && <div className="border-t border-border p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]">
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="editorial-topic">Business problem or article question</Label><Textarea id="editorial-topic" rows={3} value={input.topic} onChange={e => setInput({ ...input, topic: e.target.value })} placeholder="Why do qualified enquiries go cold before a small team replies?" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="editorial-audience">Audience</Label><Input id="editorial-audience" value={input.audience} onChange={e => setInput({ ...input, audience: e.target.value })} placeholder="Hotel owners in Zimbabwe" /></div>
              <div className="space-y-2"><Label htmlFor="editorial-keyword">Target keyword (optional)</Label><Input id="editorial-keyword" value={input.targetKeyword} onChange={e => setInput({ ...input, targetKeyword: e.target.value })} placeholder="hotel enquiry automation" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="editorial-context">Firsthand Radbit context</Label><Textarea id="editorial-context" rows={4} value={input.firsthandContext} onChange={e => setInput({ ...input, firsthandContext: e.target.value })} placeholder="Add project observations, constraints, results, and what you personally learned. The model cannot invent these." /></div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="button" onClick={generate} disabled={loading || input.topic.trim().length < 10}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}{loading ? "Building intelligence brief…" : "Generate editorial brief"}</Button>
          </div>

          <aside className="rounded-xl border border-border bg-muted/25 p-4">
            {!brief ? <div className="space-y-4 text-sm text-muted-foreground"><p className="font-medium text-foreground">Human review stays mandatory.</p><p>The system prepares a structured draft and exposes weak evidence. It never publishes automatically.</p><div className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>Claims are labelled by confidence and unsupported experience is flagged.</span></div><div className="flex gap-2"><Network className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>Each draft creates an internal-link and future-content graph.</span></div></div> : <div className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Brief ready</p><h3 className="mt-2 font-headline text-lg font-semibold leading-snug">{brief.title}</h3><p className="mt-2 text-sm text-muted-foreground">{brief.searchIntent} · {brief.readerLevel}</p></div><div className="grid grid-cols-2 gap-2 text-sm"><div className="rounded-lg border bg-background p-3"><span className="block text-xl font-semibold">{brief.internalLinks.length}</span><span className="text-muted-foreground">internal links</span></div><div className="rounded-lg border bg-background p-3"><span className="block text-xl font-semibold">{brief.contentGraph.missingContent.length}</span><span className="text-muted-foreground">content gaps</span></div></div>{brief.reviewNotes.length > 0 && <div><p className="text-sm font-medium">Editor checks</p><ul className="mt-2 space-y-1 text-sm text-muted-foreground">{brief.reviewNotes.slice(0, 4).map(note => <li key={note}>— {note}</li>)}</ul></div>}<Button type="button" className="w-full" onClick={apply}>Apply draft to editor</Button></div>}
          </aside>
        </div>
      </div>}
    </section>
  );
}
