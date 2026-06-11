"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { seoPageService, type SeoPage } from "@/services/seo-page.service";
import Link from "next/link";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/contexts/auth-context";

export default function AdminSeoPagesPage() {
  const { role } = useContext(AuthContext);
  const router = useRouter();
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
    seoPageService.listAll().then(all => {
      setPages(all);
      setLoading(false);
    });
  }, [role, router]);

  if (role === null) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (role !== 'admin' && role !== 'super_admin') return null;

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await seoPageService.delete(id);
    const all = await seoPageService.listAll();
    setPages(all);
  };

  const industries = pages.filter(p => p.type === 'industry');
  const usecases = pages.filter(p => p.type === 'usecase');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-2xl font-bold">SEO Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage industry and use-case landing pages</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/seo-pages/new">
            <Plus className="mr-2 h-4 w-4" /> New SEO Page
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : (
        <div className="space-y-8">
          <Section title="Industry Pages" pages={industries} onDelete={handleDelete} />
          <Section title="Use Case Pages" pages={usecases} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  pages,
  onDelete,
}: {
  title: string;
  pages: SeoPage[];
  onDelete: (id: string, title: string) => void;
}) {
  if (pages.length === 0) return null;
  return (
    <div>
      <h2 className="font-headline text-lg font-semibold mb-3 text-muted-foreground">{title}</h2>
      <div className="space-y-2">
        {pages.map(page => (
          <div key={page.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4 hover:border-primary/20 transition-colors">
            <div className="flex-1 min-w-0 mr-4">
              <h3 className="font-medium truncate">{page.h1}</h3>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                /{page.type === 'industry' ? 'solutions' : 'use-cases'}/{page.slug}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" asChild title="Edit">
                <Link href={`/dashboard/seo-pages/${page.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => page.id && onDelete(page.id, page.h1)} title="Delete" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
