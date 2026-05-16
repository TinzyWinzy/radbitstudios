"use client";

import { useState } from "react";
import { blogService, type BlogPost } from "@/services/blog.service";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Eye } from "lucide-react";

interface Props {
  initial?: BlogPost;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function BlogEditor({ initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    excerpt: initial?.excerpt || '',
    content: initial?.content || '',
    tags: initial?.tags?.join(', ') || '',
    published: initial?.published ?? false,
    authorName: initial?.authorName || 'Radbit',
    imageUrl: initial?.imageUrl || '',
  });

  const update = (key: string, value: any) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !initial) next.slug = slugify(next.title);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt,
        content: form.content,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        published: form.published,
        authorName: form.authorName || 'Radbit',
        imageUrl: form.imageUrl,
      };
      if (initial?.id) {
        await blogService.update(initial.id, data);
      } else {
        await blogService.create(data);
      }
      router.push('/dashboard/blog');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline text-2xl font-bold">
          {initial ? 'Edit Post' : 'New Post'}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreview(!preview)}>
            <Eye className="mr-2 h-4 w-4" /> {preview ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initial ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {preview ? (
        <div className="prose prose-neutral dark:prose-invert max-w-none p-6 rounded-xl border border-border/50">
          <h1 className="font-headline text-3xl font-bold">{form.title || 'Untitled'}</h1>
          <div dangerouslySetInnerHTML={{ __html: simpleMarkdown(form.content) }} />
        </div>
      ) : (
        <div className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" rows={2} value={form.excerpt} onChange={e => update('excerpt', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (markdown)</Label>
            <Textarea id="content" rows={16} className="font-mono text-sm" value={form.content} onChange={e => update('content', e.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" value={form.tags} onChange={e => update('tags', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" value={form.imageUrl} onChange={e => update('imageUrl', e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="authorName">Author</Label>
              <Input id="authorName" value={form.authorName} onChange={e => update('authorName', e.target.value)} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <Switch checked={form.published} onCheckedChange={v => update('published', v)} />
                <span className="text-sm">Published</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function simpleMarkdown(md: string): string {
  let html = md
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="rounded-xl w-full my-6" />')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^### (.+)/gm, '<h3 class="font-headline text-xl font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)/gm, '<h2 class="font-headline text-2xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^- (.+)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc pl-6 mb-4 space-y-1">$&</ul>');
  return html;
}
