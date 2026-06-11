"use client";

import { useState } from "react";
import { faqService, type FaqItem } from "@/services/faq.service";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface Props {
  initial?: FaqItem;
}

export default function FaqEditor({ initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: initial?.category || '',
    question: initial?.question || '',
    answer: initial?.answer || '',
    link: initial?.link || '',
    linkText: initial?.linkText || '',
    order: initial?.order ?? 0,
    published: initial?.published ?? true,
  });

  const update = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!form.category || !form.question || !form.answer) return;
    setSaving(true);
    try {
      const data = {
        category: form.category,
        question: form.question,
        answer: form.answer,
        link: form.link || undefined,
        linkText: form.linkText || undefined,
        order: form.order,
        published: form.published,
      };
      if (initial?.id) {
        await faqService.update(initial.id, data);
      } else {
        await faqService.create(data);
      }
      router.push('/dashboard/faq');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline text-2xl font-bold">
          {initial ? 'Edit FAQ' : 'New FAQ'}
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={save} disabled={saving || !form.category || !form.question || !form.answer}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initial ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={form.category} onChange={e => update('category', e.target.value)} placeholder="e.g. Platform Basics" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input id="order" type="number" value={form.order} onChange={e => update('order', parseInt(e.target.value) || 0)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question">Question</Label>
          <Input id="question" value={form.question} onChange={e => update('question', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="answer">Answer</Label>
          <Textarea id="answer" rows={4} value={form.answer} onChange={e => update('answer', e.target.value)} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="link">Link URL (optional)</Label>
            <Input id="link" value={form.link} onChange={e => update('link', e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkText">Link Text (optional)</Label>
            <Input id="linkText" value={form.linkText} onChange={e => update('linkText', e.target.value)} placeholder="Learn more" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={form.published} onCheckedChange={v => update('published', v)} />
          <span className="text-sm">Published</span>
        </div>
      </div>
    </div>
  );
}
