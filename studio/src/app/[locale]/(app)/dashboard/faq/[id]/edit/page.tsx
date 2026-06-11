"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { faqService, type FaqItem } from "@/services/faq.service";
import FaqEditor from "../../editor";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthContext } from "@/contexts/auth-context";

export default function EditFaqPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useContext(AuthContext);
  const router = useRouter();
  const [item, setItem] = useState<FaqItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
    faqService.getById(id).then(i => {
      setItem(i);
      setLoading(false);
    });
  }, [id, role, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return <p className="text-muted-foreground py-16 text-center">FAQ not found.</p>;
  }

  return <FaqEditor initial={item} />;
}
