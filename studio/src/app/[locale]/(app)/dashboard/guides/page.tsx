"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { guideService, type Guide } from "@/services/guide.service";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/contexts/auth-context";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function AdminGuidesPage() {
  const { role } = useContext(AuthContext);
  const router = useRouter();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
    const load = async () => {
      setLoading(true);
      const all = await guideService.listAll();
      setGuides(all);
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

  const handleDelete = (id: string, title: string) => {
    setDeleteTarget({ id, label: title });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    await guideService.delete(deleteTarget.id);
    setDeleteTarget(null);
    const all = await guideService.listAll();
    setGuides(all);
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-2xl font-bold">Guides Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage guide content</p>
        </div>
        <Button asChild className="ml-auto">
          <Link href="/dashboard/guides/new">
            <Plus className="mr-2 h-4 w-4" /> New Guide
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : guides.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">No guides yet</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/guides/new">Create your first guide</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {guides.map(guide => (
            <div
              key={guide.id}
              className="flex flex-col items-stretch gap-3 rounded-lg border border-border/50 bg-card p-4 transition-colors hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 sm:mr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{guide.icon}</span>
                  <h3 className="font-medium truncate">{guide.title}</h3>
                  {!guide.published && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Draft</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">/resources/guides/{guide.slug}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" asChild title="Edit">
                  <Link href={`/dashboard/guides/${guide.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => guide.id && handleDelete(guide.id, guide.title)}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Guide"
        description={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        onConfirm={executeDelete}
      />
    </div>
  );
}
