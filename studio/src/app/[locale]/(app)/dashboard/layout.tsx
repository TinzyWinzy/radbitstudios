"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const DASHBOARD_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard — Radbit",
  "/dashboard/checklist": "Onboarding Checklist — Radbit",
  "/dashboard/projects": "My Projects — Radbit",
  "/dashboard/blog": "Blog Manager — Radbit",
  "/dashboard/blog/new": "New Blog Post — Radbit",
  "/dashboard/faq": "FAQ Manager — Radbit",
  "/dashboard/faq/new": "New FAQ — Radbit",
  "/dashboard/guides": "Guides Manager — Radbit",
  "/dashboard/guides/new": "New Guide — Radbit",
  "/dashboard/seo-pages": "SEO Pages — Radbit",
  "/dashboard/seo-pages/new": "New SEO Page — Radbit",
  "/dashboard/media": "Media Library — Radbit",
  "/dashboard/admin": "Admin Panel — Radbit",
  "/dashboard/admin/partners": "Partner Management — Radbit",
};

const DYNAMIC_TITLE_RULES: [RegExp, string][] = [
  [/^\/dashboard\/projects\/[^/]+$/, "Project Details — Radbit"],
  [/^\/dashboard\/blog\/[^/]+\/edit$/, "Edit Blog Post — Radbit"],
  [/^\/dashboard\/faq\/[^/]+\/edit$/, "Edit FAQ — Radbit"],
  [/^\/dashboard\/guides\/[^/]+\/edit$/, "Edit Guide — Radbit"],
  [/^\/dashboard\/seo-pages\/[^/]+\/edit$/, "Edit SEO Page — Radbit"],
  [/^\/dashboard\/admin\/clients\/[^/]+$/, "Client Details — Radbit"],
];

function getDashboardTitle(pathname: string): string | null {
  if (DASHBOARD_TITLES[pathname]) return DASHBOARD_TITLES[pathname];
  for (const [pattern, title] of DYNAMIC_TITLE_RULES) {
    if (pattern.test(pathname)) return title;
  }
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const title = getDashboardTitle(pathname);
    if (title) document.title = title;
  }, [pathname]);

  return <>{children}</>;
}
