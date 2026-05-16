"use client";

import dynamic from "next/dynamic";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const isConfigured = !!projectId;

const StudioContent = isConfigured
  ? dynamic(() => import("./studio-content"), { ssr: false })
  : null;

export default function StudioPage() {
  if (!StudioContent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-headline text-2xl font-bold mb-2">Sanity Studio</h1>
          <p className="text-muted-foreground">
            Not configured. Set <code className="bg-muted px-1.5 py-0.5 rounded text-sm">NEXT_PUBLIC_SANITY_PROJECT_ID</code> to enable.
          </p>
        </div>
      </div>
    );
  }
  return <StudioContent />;
}
