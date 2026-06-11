"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { faqService, type FaqItem } from "@/services/faq.service";
import Link from "next/link";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/contexts/auth-context";

export default function AdminFaqPage() {
  const { role } = useContext(AuthContext);
  const router = useRouter();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
    const load = async () => {
      setLoading(true);
      const all = await faqService.listAll();
      setItems(all);
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

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Delete "${question}"?`)) return;
    await faqService.delete(id);
    const all = await faqService.listAll();
    setItems(all);
  };

  const grouped = items.reduce<Record<string, FaqItem[]>>((acc, item) => {
    const cat = item.category || 'Uncategorised';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-2xl font-bold">FAQ Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage frequently asked questions</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/faq/new">
            <Plus className="mr-2 h-4 w-4" /> New FAQ
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">No FAQ items yet</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/faq/new">Create your first FAQ</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category}>
              <h2 className="font-headline text-lg font-semibold mb-3 text-muted-foreground">{category}</h2>
              <div className="space-y-2">
                {catItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">#{item.order}</span>
                        <h3 className="font-medium truncate">{item.question}</h3>
                        {!item.published && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Hidden</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" asChild title="Edit">
                        <Link href={`/dashboard/faq/${item.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => item.id && handleDelete(item.id, item.question)}
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
          ))}
        </div>
      )}
    </div>
  );
}
