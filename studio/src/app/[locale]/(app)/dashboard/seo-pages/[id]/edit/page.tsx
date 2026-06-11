"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { seoPageService, type SeoPage } from "@/services/seo-page.service";
import SeoPageEditor from "../../editor";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthContext } from "@/contexts/auth-context";

export default function EditSeoPagePage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useContext(AuthContext);
  const router = useRouter();
  const [page, setPage] = useState<SeoPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') { router.push('/dashboard'); return; }
    seoPageService.getById(id).then(p => { setPage(p); setLoading(false); });
  }, [id, role, router]);

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!page) return <p className="text-muted-foreground py-16 text-center">Page not found.</p>;
  return <SeoPageEditor initial={page} />;
}
