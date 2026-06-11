"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import FaqEditor from "../editor";
import { AuthContext } from "@/contexts/auth-context";

export default function NewFaqPage() {
  const { role } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [role, router]);

  if (role !== 'admin' && role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  return <FaqEditor />;
}
