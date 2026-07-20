"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { blogService, type BlogPost } from "@/services/blog.service";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/contexts/auth-context";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { isStalePost, resolveEditorialStatus } from "@/lib/editorial";

export default function AdminBlogPage() {
  const { role } = useContext(AuthContext);
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
    const load = async () => {
      setLoading(true);
      const all = await blogService.listAll();
      setPosts(all);
      setLoading(false);
    };
    load();
  }, [role, router]);

  if (role === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (role !== 'admin' && role !== 'super_admin') return null;

  const togglePublish = async (id: string, current: boolean) => {
    await blogService.update(id, {
      published: !current,
      status: current ? 'draft' : 'published',
    });
    const all = await blogService.listAll();
    setPosts(all);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteTarget({ id, label: title });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    await blogService.delete(deleteTarget.id);
    setDeleteTarget(null);
    const all = await blogService.listAll();
    setPosts(all);
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="font-headline text-2xl font-bold">Editorial pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">Draft, review, approve and publish Radbit Insights</p>
        </div>
        <Button asChild className="w-full sm:ml-auto sm:w-auto">
          <Link href="/dashboard/blog/new">
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">No posts yet</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/blog/new">Create your first post</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-l-2 border-primary bg-muted/20 p-4"><span className="block text-2xl font-semibold">{posts.filter(post => resolveEditorialStatus(post) === 'review').length}</span><span className="text-sm text-muted-foreground">awaiting review</span></div>
            <div className="border-l-2 border-amber-500 bg-muted/20 p-4"><span className="block text-2xl font-semibold">{posts.filter(post => resolveEditorialStatus(post) === 'scheduled').length}</span><span className="text-sm text-muted-foreground">scheduled</span></div>
            <div className="border-l-2 border-destructive bg-muted/20 p-4"><span className="block text-2xl font-semibold">{posts.filter(post => isStalePost(post)).length}</span><span className="text-sm text-muted-foreground">stale after 180 days</span></div>
          </div>
          <div className="space-y-2">
          {posts.map(post => (
            <div
              key={post.id}
              className="flex flex-col items-stretch gap-3 rounded-lg border border-border/50 bg-card p-4 transition-colors hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 sm:mr-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{post.title}</h3>
                  <span className="text-xs capitalize px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{resolveEditorialStatus(post)}</span>
                  {post.category && <span className="hidden sm:inline text-xs text-muted-foreground">{post.category}</span>}
                  {isStalePost(post) && <span className="text-xs px-1.5 py-0.5 border border-amber-500/40 text-amber-600">Review due</span>}
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">/blog/{post.slug}</p>
              </div>
              <div className="flex shrink-0 items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => post.id && togglePublish(post.id, post.published)}
                  title={post.published ? "Unpublish" : "Publish"}
                >
                  {post.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" asChild title="Edit">
                  <Link href={`/dashboard/blog/${post.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => post.id && handleDelete(post.id, post.title)}
                  title="Delete"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Blog Post"
        description={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        onConfirm={executeDelete}
      />
    </div>
  );
}
