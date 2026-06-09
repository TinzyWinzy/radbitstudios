"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Database, Lightbulb, Brain, Code, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Project } from "@/types/project";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  web: <Globe className="h-3.5 w-3.5" />,
  erp: <Database className="h-3.5 w-3.5" />,
  consulting: <Lightbulb className="h-3.5 w-3.5" />,
  "ai-platform": <Brain className="h-3.5 w-3.5" />,
  custom: <Code className="h-3.5 w-3.5" />,
};

const TYPE_LABELS: Record<string, string> = {
  web: "Web",
  erp: "ERP",
  consulting: "Consulting",
  "ai-platform": "AI Platform",
  custom: "Custom",
};

const STATUS_COLORS: Record<string, string> = {
  lead: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  onboarding: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  design: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  development: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  review: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  live: "bg-green-500/15 text-green-400 border-green-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

function parsePackageName(packageName: string): { clientName: string; typeLabel: string } {
  const match = packageName.match(/^(.+?)\s*-\s*(.+?)\s+inquiry$/i);
  if (match) {
    return { clientName: match[1].trim(), typeLabel: match[2].trim() };
  }
  return { clientName: packageName, typeLabel: "" };
}

export function AdminProjectCard({ project }: { project: Project }) {
  const { clientName, typeLabel } = parsePackageName(project.packageName);

  const createdAt = project.createdAt && "toDate" in project.createdAt
    ? (project.createdAt as { toDate: () => Date }).toDate()
    : null;

  return (
    <Link href={`/dashboard/admin/clients/${project.clientId}`}>
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 dark:hover:border-primary/40">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate">{clientName}</span>
            <Badge variant="outline" className="shrink-0 h-5 text-[10px] gap-1 px-1.5">
              {TYPE_ICONS[project.type] || <Code className="h-3.5 w-3.5" />}
              {TYPE_LABELS[project.type] || typeLabel || project.type}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">
              {project.currency === "ZiG" ? "ZiG" : "$"}{project.budget.toLocaleString()}
            </span>
            <Badge variant="outline" className={`h-5 text-[10px] px-1.5 ${STATUS_COLORS[project.status] || ""}`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>

          {createdAt && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
