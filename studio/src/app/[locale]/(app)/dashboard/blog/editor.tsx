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
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import { VersionsDialog } from "@/components/editor/versions-dialog";
import { saveVersion } from "@/services/version.service";

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
  const isLegacy = typeof initial?.content === 'string';
  const initialJson = isLegacy || !initial?.content
    ? null
    : initial.content as Record<string, unknown>;

  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    excerpt: initial?.excerpt || '',
    content: initialJson,
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
        content: form.content || null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        published: form.published,
        authorName: form.authorName || 'Radbit',
        imageUrl: form.imageUrl,
      };
      if (initial?.id) {
        await saveVersion('blog_posts', initial.id, initial.authorName || 'Radbit').catch(() => {});
        await blogService.update(initial.id, data);
      } else {
        const newId = await blogService.create(data);
        // Save initial version for new posts
        await saveVersion('blog_posts', newId, form.authorName || 'Radbit', 'Initial version').catch(() => {});
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
          {initial?.id && (
            <VersionsDialog
              collectionName="blog_posts"
              docId={initial.id}
              userId={initial.authorName || 'Radbit'}
              onRestore={() => router.push('/dashboard/blog')}
            />
          )}
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
        <div className="p-6 rounded-xl border border-border/50">
          <h1 className="font-headline text-3xl font-bold mb-6">{form.title || 'Untitled'}</h1>
          <RichTextRenderer content={form.content} />
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
            <Label>Content</Label>
            <RichTextEditor
              content={form.content}
              onChange={(val) => setForm(prev => ({ ...prev, content: val }))}
              placeholder="Start writing your blog post..."
            />
            {isLegacy && (
              <p className="text-xs text-amber-500">
                This post was created with the old markdown editor. Saving will convert it to the new rich text format.
              </p>
            )}
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
