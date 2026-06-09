"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Globe, Database, Briefcase, Brain, Code, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PROJECT_STATUS_FLOW, getStatusLabel } from "@/services/project-service";
import type { Project, ProjectTask } from "@/types/project";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  web: <Globe className="h-4 w-4" />,
  erp: <Database className="h-4 w-4" />,
  consulting: <Briefcase className="h-4 w-4" />,
  "ai-platform": <Brain className="h-4 w-4" />,
  custom: <Code className="h-4 w-4" />,
};

const STATUS_COLORS: Record<string, string> = {
  lead: "bg-muted text-muted-foreground border-border",
  onboarding: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  design: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  development: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  review: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  live: "bg-green-500/15 text-green-500 border-green-500/30",
  completed: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

interface ProjectProgressProps {
  project: Project;
  tasks: ProjectTask[];
}

export function ProjectProgress({ project, tasks }: ProjectProgressProps) {
  const statusIndex = PROJECT_STATUS_FLOW.indexOf(project.status);
  const progress = project.status === "cancelled"
    ? 0
    : Math.round((Math.min(statusIndex + 1, PROJECT_STATUS_FLOW.length) / PROJECT_STATUS_FLOW.length) * 100);

  const budgetDisplay = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: project.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(project.budget);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="shrink-0 text-primary/70">
              {TYPE_ICONS[project.type] || <Code className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{project.packageName}</CardTitle>
              <CardDescription className="truncate">
                {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
              </CardDescription>
            </div>
          </div>
          <Badge className={`shrink-0 ${STATUS_COLORS[project.status] || ""}`}>
            {getStatusLabel(project.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Budget</span>
          <span className="font-semibold">{budgetDisplay}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tasks</span>
          <span>{tasks.filter(t => t.status === "done").length}/{tasks.length} done</span>
        </div>

        <Link
          href={`/dashboard/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          View Project
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
