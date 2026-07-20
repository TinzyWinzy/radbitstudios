"use client";

import { useState } from "react";
import { blogService, type BlogPost, type EditorialStatus } from "@/services/blog.service";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ARTICLE_CATEGORIES, CONTENT_CLUSTERS } from "@/data/content-clusters";
import { estimateReadingMinutes, resolveEditorialStatus } from "@/lib/editorial";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import { VersionsDialog } from "@/components/editor/versions-dialog";
import { saveVersion } from "@/services/version.service";
import { EditorialWorkbench } from "./editorial-workbench";

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
    status: initial ? resolveEditorialStatus(initial) : 'draft' as EditorialStatus,
    category: initial?.category || ARTICLE_CATEGORIES[0],
    cluster: initial?.cluster || CONTENT_CLUSTERS[0].slug,
    metaTitle: initial?.metaTitle || initial?.title || '',
    metaDescription: initial?.metaDescription || initial?.editorial?.metaDescription || '',
    canonicalUrl: initial?.canonicalUrl || '',
    scheduledAt: initial?.scheduledAt?.toDate?.().toISOString().slice(0, 16) || '',
    relatedSlugs: initial?.relatedSlugs?.join(', ') || '',
    serviceLinks: initial?.serviceLinks?.join(', ') || '',
    industryLinks: initial?.industryLinks?.join(', ') || '',
    authorName: initial?.authorName || 'Tinotenda Brandon Duma',
    authorBio: initial?.authorBio || 'Founder and systems architect at Radbit Studios.',
    imageUrl: initial?.imageUrl || '',
    editorial: initial?.editorial,
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
        status: form.status,
        published: form.status === 'published',
        category: form.category,
        cluster: form.cluster,
        metaTitle: form.metaTitle || form.title,
        metaDescription: form.metaDescription || form.excerpt,
        canonicalUrl: form.canonicalUrl,
        scheduledAt: form.status === 'scheduled' && form.scheduledAt
          ? Timestamp.fromDate(new Date(form.scheduledAt)) : null,
        publishedAt: form.status === 'published'
          ? (initial?.publishedAt || Timestamp.now()) : initial?.publishedAt,
        readingMinutes: estimateReadingMinutes(form.content),
        relatedSlugs: form.relatedSlugs.split(',').map(t => t.trim()).filter(Boolean),
        serviceLinks: form.serviceLinks.split(',').map(t => t.trim()).filter(Boolean),
        industryLinks: form.industryLinks.split(',').map(t => t.trim()).filter(Boolean),
        authorName: form.authorName || 'Tinotenda Brandon Duma',
        authorBio: form.authorBio,
        imageUrl: form.imageUrl,
        editorial: form.editorial,
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
            {initial ? 'Save changes' : 'Save draft'}
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
          <EditorialWorkbench onApply={(patch) => setForm(prev => ({ ...prev, ...patch }))} />
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
              <Label>Editorial status</Label>
              <Select value={form.status} onValueChange={v => update('status', v as EditorialStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Ready for review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => update('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ARTICLE_CATEGORIES.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content cluster</Label>
              <Select value={form.cluster} onValueChange={v => update('cluster', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONTENT_CLUSTERS.map(item => <SelectItem key={item.slug} value={item.slug}>{item.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {form.status === 'scheduled' && (
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="scheduledAt">Publication date and time</Label>
              <Input id="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={e => update('scheduledAt', e.target.value)} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" rows={2} value={form.excerpt} onChange={e => update('excerpt', e.target.value)} />
          </div>

          <section className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-5">
            <div>
              <h2 className="font-headline text-lg font-semibold">Search presentation</h2>
              <p className="text-sm text-muted-foreground">Control how this article appears in search and social previews.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta title <span className="text-muted-foreground">({form.metaTitle.length}/60)</span></Label>
              <Input id="metaTitle" value={form.metaTitle} onChange={e => update('metaTitle', e.target.value)} maxLength={70} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta description <span className="text-muted-foreground">({form.metaDescription.length}/160)</span></Label>
              <Textarea id="metaDescription" rows={3} value={form.metaDescription} onChange={e => update('metaDescription', e.target.value)} maxLength={180} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="canonicalUrl">Canonical URL override</Label>
              <Input id="canonicalUrl" value={form.canonicalUrl} onChange={e => update('canonicalUrl', e.target.value)} placeholder="Leave blank to use /blog/article-slug" />
            </div>
          </section>

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
            <div className="space-y-2">
              <Label htmlFor="authorBio">Author bio</Label>
              <Input id="authorBio" value={form.authorBio} onChange={e => update('authorBio', e.target.value)} />
            </div>
          </div>

          <section className="space-y-4 rounded-xl border border-border/60 p-5">
            <div>
              <h2 className="font-headline text-lg font-semibold">Internal link plan</h2>
              <p className="text-sm text-muted-foreground">Use URL paths or article slugs, separated by commas. Each article should connect to its pillar, a service, an industry solution and two related articles.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Related article slugs</Label><Input value={form.relatedSlugs} onChange={e => update('relatedSlugs', e.target.value)} /></div>
              <div className="space-y-2"><Label>Service links</Label><Input value={form.serviceLinks} onChange={e => update('serviceLinks', e.target.value)} placeholder="/services/custom-software" /></div>
            </div>
            <div className="space-y-2"><Label>Industry solution links</Label><Input value={form.industryLinks} onChange={e => update('industryLinks', e.target.value)} placeholder="/solutions/hospitality" /></div>
          </section>
        </div>
      )}
    </div>
  );
}
