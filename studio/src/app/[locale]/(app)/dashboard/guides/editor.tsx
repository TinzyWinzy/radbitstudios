"use client";

import { useState } from "react";
import { guideService, type Guide, type GuideStep, type GuideFaqItem } from "@/services/guide.service";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { VersionsDialog } from "@/components/editor/versions-dialog";
import { saveVersion } from "@/services/version.service";

interface Props {
  initial?: Guide;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function GuideEditor({ initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    excerpt: initial?.excerpt || '',
    icon: initial?.icon || 'FileText',
    readTime: initial?.readTime || '',
    category: initial?.category || '',
    published: initial?.published ?? false,
    steps: initial?.steps || [] as GuideStep[],
    tips: initial?.tips || [] as string[],
    faq: initial?.faq || [] as GuideFaqItem[],
    content: initial?.content as Record<string, unknown> | null || null,
  });

  const update = (key: string, value: any) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !initial) next.slug = slugify(next.title);
      return next;
    });
  };

  const addStep = () => {
    setForm(prev => ({
      ...prev,
      steps: [...prev.steps, { icon: 'CheckCircle2', title: '', body: '' }],
    }));
  };

  const updateStep = (i: number, field: keyof GuideStep, value: string) => {
    setForm(prev => {
      const steps = [...prev.steps];
      steps[i] = { ...steps[i], [field]: value };
      return { ...prev, steps };
    });
  };

  const removeStep = (i: number) => {
    setForm(prev => ({ ...prev, steps: prev.steps.filter((_, idx) => idx !== i) }));
  };

  const addTip = () => {
    setForm(prev => ({ ...prev, tips: [...prev.tips, ''] }));
  };

  const updateTip = (i: number, value: string) => {
    setForm(prev => {
      const tips = [...prev.tips];
      tips[i] = value;
      return { ...prev, tips };
    });
  };

  const removeTip = (i: number) => {
    setForm(prev => ({ ...prev, tips: prev.tips.filter((_, idx) => idx !== i) }));
  };

  const addFaq = () => {
    setForm(prev => ({ ...prev, faq: [...prev.faq, { q: '', a: '' }] }));
  };

  const updateFaq = (i: number, field: keyof GuideFaqItem, value: string) => {
    setForm(prev => {
      const faq = [...prev.faq];
      faq[i] = { ...faq[i], [field]: value };
      return { ...prev, faq };
    });
  };

  const removeFaq = (i: number) => {
    setForm(prev => ({ ...prev, faq: prev.faq.filter((_, idx) => idx !== i) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt,
        icon: form.icon,
        readTime: form.readTime,
        category: form.category,
        published: form.published,
        steps: form.steps,
        tips: form.tips.filter(Boolean),
        faq: form.faq.filter(f => f.q && f.a),
        content: form.content,
      };
      if (initial?.id) {
        await saveVersion('guides', initial.id, form.title).catch(() => {});
        await guideService.update(initial.id, data);
      } else {
        const newId = await guideService.create(data);
        await saveVersion('guides', newId, form.title, 'Initial version').catch(() => {});
      }
      router.push('/dashboard/guides');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline text-2xl font-bold">
          {initial ? 'Edit Guide' : 'New Guide'}
        </h1>
        <div className="flex items-center gap-2">
          {initial?.id && (
            <VersionsDialog
              collectionName="guides"
              docId={initial.id}
              userId={form.title}
              onRestore={() => router.push('/dashboard/guides')}
            />
          )}
          <Button onClick={save} disabled={saving || !form.title}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initial ? 'Update' : 'Create'}
        </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Metadata */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={e => update('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={form.slug} onChange={e => update('slug', e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (Lucide name)</Label>
            <Input id="icon" value={form.icon} onChange={e => update('icon', e.target.value)} placeholder="e.g. FileText" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="readTime">Read Time</Label>
            <Input id="readTime" value={form.readTime} onChange={e => update('readTime', e.target.value)} placeholder="e.g. 15 min read" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={form.category} onChange={e => update('category', e.target.value)} placeholder="e.g. Registration & Compliance" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" rows={2} value={form.excerpt} onChange={e => update('excerpt', e.target.value)} />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Steps</Label>
            <Button type="button" variant="outline" size="sm" onClick={addStep}>
              <Plus className="h-4 w-4 mr-1" /> Add Step
            </Button>
          </div>
          {form.steps.map((step, i) => (
            <div key={i} className="rounded-lg border border-border/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Step {i + 1}</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(i)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Icon</Label>
                  <Input value={step.icon} onChange={e => updateStep(i, 'icon', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input value={step.title} onChange={e => updateStep(i, 'title', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Body</Label>
                <Textarea rows={2} value={step.body} onChange={e => updateStep(i, 'body', e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Tips</Label>
            <Button type="button" variant="outline" size="sm" onClick={addTip}>
              <Plus className="h-4 w-4 mr-1" /> Add Tip
            </Button>
          </div>
          {form.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <Textarea
                rows={1}
                value={tip}
                onChange={e => updateTip(i, e.target.value)}
                placeholder="Enter tip text..."
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeTip(i)} className="mt-1 text-destructive shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">FAQ</Label>
            <Button type="button" variant="outline" size="sm" onClick={addFaq}>
              <Plus className="h-4 w-4 mr-1" /> Add FAQ
            </Button>
          </div>
          {form.faq.map((item, i) => (
            <div key={i} className="rounded-lg border border-border/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">FAQ {i + 1}</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeFaq(i)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Question</Label>
                <Input value={item.q} onChange={e => updateFaq(i, 'q', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Answer</Label>
                <Textarea rows={2} value={item.a} onChange={e => updateFaq(i, 'a', e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        {/* Rich text content */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Additional Content</Label>
          <RichTextEditor
            content={form.content}
            onChange={(val) => update('content', val)}
            placeholder="Optional body content between sections..."
          />
        </div>

        {/* Publish */}
        <div className="flex items-center gap-3">
          <Switch checked={form.published} onCheckedChange={v => update('published', v)} />
          <span className="text-sm">Published</span>
        </div>
      </div>
    </div>
  );
}
