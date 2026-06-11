"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { guideService, type Guide } from "@/services/guide.service";
import GuideEditor from "../../editor";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthContext } from "@/contexts/auth-context";

export default function EditGuidePage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useContext(AuthContext);
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
    guideService.getById(id).then(g => {
      setGuide(g);
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

  if (!guide) {
    return <p className="text-muted-foreground py-16 text-center">Guide not found.</p>;
  }

  return <GuideEditor initial={guide} />;
}
