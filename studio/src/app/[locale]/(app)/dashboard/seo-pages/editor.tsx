"use client";

import { useState } from "react";
import { seoPageService, type SeoPage } from "@/services/seo-page.service";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface Props {
  initial?: SeoPage;
}

export default function SeoPageEditor({ initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: initial?.type || 'industry' as 'industry' | 'usecase',
    slug: initial?.slug || '',
    title: initial?.title || '',
    metaDescription: initial?.metaDescription || '',
    h1: initial?.h1 || '',
    intro: initial?.intro || '',
    problems: initial?.problems || [] as { title: string; description: string }[],
    solutions: initial?.solutions || [] as { title: string; description: string }[],
    features: initial?.features || [] as string[],
    steps: initial?.steps || [] as { title: string; description: string }[],
    benefits: initial?.benefits || [] as string[],
    cta: initial?.cta || '',
    keywords: initial?.keywords?.join(', ') || '',
    published: initial?.published ?? true,
  });

  const update = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const addProblem = () => {
    setForm(prev => ({ ...prev, problems: [...prev.problems, { title: '', description: '' }] }));
  };
  const updateProblem = (i: number, field: 'title' | 'description', value: string) => {
    setForm(prev => {
      const items = [...prev.problems]; items[i] = { ...items[i], [field]: value };
      return { ...prev, problems: items };
    });
  };
  const removeProblem = (i: number) => {
    setForm(prev => ({ ...prev, problems: prev.problems.filter((_, idx) => idx !== i) }));
  };

  const addSolution = () => {
    setForm(prev => ({ ...prev, solutions: [...prev.solutions, { title: '', description: '' }] }));
  };
  const updateSolution = (i: number, field: 'title' | 'description', value: string) => {
    setForm(prev => {
      const items = [...prev.solutions]; items[i] = { ...items[i], [field]: value };
      return { ...prev, solutions: items };
    });
  };
  const removeSolution = (i: number) => {
    setForm(prev => ({ ...prev, solutions: prev.solutions.filter((_, idx) => idx !== i) }));
  };

  const addFeature = () => {
    setForm(prev => ({ ...prev, features: [...prev.features, ''] }));
  };
  const updateFeature = (i: number, value: string) => {
    setForm(prev => {
      const items = [...prev.features]; items[i] = value;
      return { ...prev, features: items };
    });
  };
  const removeFeature = (i: number) => {
    setForm(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }));
  };

  const addStep = () => {
    setForm(prev => ({ ...prev, steps: [...prev.steps, { title: '', description: '' }] }));
  };
  const updateStep = (i: number, field: 'title' | 'description', value: string) => {
    setForm(prev => {
      const items = [...prev.steps]; items[i] = { ...items[i], [field]: value };
      return { ...prev, steps: items };
    });
  };
  const removeStep = (i: number) => {
    setForm(prev => ({ ...prev, steps: prev.steps.filter((_, idx) => idx !== i) }));
  };

  const addBenefit = () => {
    setForm(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
  };
  const updateBenefit = (i: number, value: string) => {
    setForm(prev => {
      const items = [...prev.benefits]; items[i] = value;
      return { ...prev, benefits: items };
    });
  };
  const removeBenefit = (i: number) => {
    setForm(prev => ({ ...prev, benefits: prev.benefits.filter((_, idx) => idx !== i) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = {
        type: form.type,
        slug: form.slug,
        title: form.title,
        metaDescription: form.metaDescription,
        h1: form.h1,
        intro: form.intro,
        problems: form.problems.filter(p => p.title),
        solutions: form.solutions.filter(s => s.title),
        features: form.features.filter(Boolean),
        steps: form.steps.filter(s => s.title),
        benefits: form.benefits.filter(Boolean),
        cta: form.cta,
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        published: form.published,
      };
      if (initial?.id) {
        await seoPageService.update(initial.id, data);
      } else {
        await seoPageService.create(data);
      }
      router.push('/dashboard/seo-pages');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const isIndustry = form.type === 'industry';

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-headline text-2xl font-bold">
          {initial ? 'Edit SEO Page' : 'New SEO Page'}
        </h1>
        <Button onClick={save} disabled={saving || !form.title || !form.slug}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initial ? 'Update' : 'Create'}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={v => update('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="industry">Industry</SelectItem>
                <SelectItem value="usecase">Use Case</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={form.slug} onChange={e => update('slug', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="published" className="sr-only">Published</Label>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.published} onCheckedChange={v => update('published', v)} />
              <span className="text-sm">Published</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title (SEO)</Label>
          <Input id="title" value={form.title} onChange={e => update('title', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea id="metaDescription" rows={2} value={form.metaDescription} onChange={e => update('metaDescription', e.target.value)} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="h1">H1 Heading</Label>
            <Input id="h1" value={form.h1} onChange={e => update('h1', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input id="keywords" value={form.keywords} onChange={e => update('keywords', e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="intro">Intro</Label>
          <Textarea id="intro" rows={3} value={form.intro} onChange={e => update('intro', e.target.value)} />
        </div>

        {isIndustry && (
          <>
            {/* Problems */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Problems</Label>
                <Button type="button" variant="outline" size="sm" onClick={addProblem}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {form.problems.map((p, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Problem {i+1}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeProblem(i)} className="text-destructive h-6 w-6">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input value={p.title} onChange={e => updateProblem(i, 'title', e.target.value)} placeholder="Title" />
                  <Textarea rows={2} value={p.description} onChange={e => updateProblem(i, 'description', e.target.value)} placeholder="Description" />
                </div>
              ))}
            </div>

            {/* Solutions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Solutions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSolution}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {form.solutions.map((s, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Solution {i+1}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSolution(i)} className="text-destructive h-6 w-6">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input value={s.title} onChange={e => updateSolution(i, 'title', e.target.value)} placeholder="Title" />
                  <Textarea rows={2} value={s.description} onChange={e => updateSolution(i, 'description', e.target.value)} placeholder="Description" />
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Features</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {form.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Input value={f} onChange={e => updateFeature(i, e.target.value)} placeholder="Feature" className="flex-1" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(i)} className="mt-0.5 text-destructive shrink-0 h-9 w-9">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        {!isIndustry && (
          <>
            {/* Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Steps</Label>
                <Button type="button" variant="outline" size="sm" onClick={addStep}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {form.steps.map((s, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Step {i+1}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(i)} className="text-destructive h-6 w-6">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input value={s.title} onChange={e => updateStep(i, 'title', e.target.value)} placeholder="Title" />
                  <Textarea rows={2} value={s.description} onChange={e => updateStep(i, 'description', e.target.value)} placeholder="Description" />
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Benefits</Label>
                <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {form.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Input value={b} onChange={e => updateBenefit(i, e.target.value)} placeholder="Benefit" className="flex-1" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeBenefit(i)} className="mt-0.5 text-destructive shrink-0 h-9 w-9">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="cta">CTA Text</Label>
          <Textarea id="cta" rows={2} value={form.cta} onChange={e => update('cta', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
