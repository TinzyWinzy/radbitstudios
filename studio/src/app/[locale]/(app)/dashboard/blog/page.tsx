"use client";

import { useState, useEffect } from "react";
import { blogService, type BlogPost } from "@/services/blog.service";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const all = await blogService.listAll();
    setPosts(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (id: string, current: boolean) => {
    await blogService.update(id, { published: !current });
    load();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await blogService.delete(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-2xl font-bold">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your blog content</p>
        </div>
        <Button asChild>
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
        <div className="space-y-2">
          {posts.map(post => (
            <div
              key={post.id}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4 hover:border-primary/20 transition-colors"
            >
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{post.title}</h3>
                  {!post.published && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Draft</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">/blog/{post.slug}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
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
      )}
    </div>
  );
}
