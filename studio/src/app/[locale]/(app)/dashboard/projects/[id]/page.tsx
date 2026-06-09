"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Database, Briefcase, Brain, Code, Calendar, DollarSign, User, AlertTriangle, RefreshCw } from "lucide-react";
import { PROJECT_STATUS_FLOW, getStatusLabel } from "@/services/project-service";
import { DocumentUpload } from "@/components/document-upload";
import type { Project, ProjectTask } from "@/types/project";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  web: <Globe className="h-4 w-4" />,
  erp: <Database className="h-4 w-4" />,
  consulting: <Briefcase className="h-4 w-4" />,
  "ai-platform": <Brain className="h-4 w-4" />,
  custom: <Code className="h-4 w-4" />,
};

const TASK_STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  review: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  done: "bg-green-500/15 text-green-500 border-green-500/30",
};

const TASK_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);

    fetch(`/api/projects/${projectId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        if (mounted) {
          setProject(data.project);
          setTasks(data.tasks || []);
          setLoading(false);
        }
      })
      .catch(e => {
        console.error("[ProjectDetail] Failed to fetch project:", e);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-6">
          This project could not be loaded. It may have been removed or you may not have access.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Retry
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = PROJECT_STATUS_FLOW.indexOf(project.status);
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: project.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/dashboard">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.packageName}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {project.type.charAt(0).toUpperCase() + project.type.slice(1)} project
          </p>
        </div>
        <Badge className="text-sm px-3 py-1 text-foreground border-primary/30 bg-primary/10">
          {getStatusLabel(project.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Timeline</CardTitle>
              <CardDescription>Progress through the project lifecycle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
                <div className="space-y-0">
                  {PROJECT_STATUS_FLOW.map((status, i) => {
                    const isCompleted = i <= currentStatusIndex;
                    const isCurrent = i === currentStatusIndex;
                    return (
                      <div key={status} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                        <div
                          className={`relative z-10 mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isCompleted
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30 bg-background"
                          }`}
                        >
                          {isCurrent && (
                            <div className="size-2 rounded-full bg-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p
                            className={`text-sm font-medium ${
                              isCompleted ? "text-foreground" : "text-muted-foreground/50"
                            }`}
                          >
                            {getStatusLabel(status)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tasks</CardTitle>
              <CardDescription>
                {tasks.filter(t => t.status === "done").length} of {tasks.length} completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <Code className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No tasks yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-lg border p-3.5"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium">{task.title}</p>
                          <Badge className={`shrink-0 ${TASK_STATUS_COLORS[task.status] || ""}`}>
                            {TASK_STATUS_LABELS[task.status] || task.status}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground">
                        {task.assignedTo === "client" ? "You" : "Admin"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="text-primary/70 shrink-0">
                  {TYPE_ICONS[project.type] || <Code className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium">Type</p>
                  <p className="text-muted-foreground text-xs capitalize">{project.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-primary/70 shrink-0" />
                <div>
                  <p className="font-medium">Budget</p>
                  <p className="text-muted-foreground text-xs">
                    {currencyFormatter.format(project.budget)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
                <div>
                  <p className="font-medium">Started</p>
                  <p className="text-muted-foreground text-xs">
                    {project.startedAt?.toDate
                      ? project.startedAt.toDate().toLocaleDateString()
                      : "Not started"}
                  </p>
                </div>
              </div>

              {project.deadline && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
                  <div>
                    <p className="font-medium">Deadline</p>
                    <p className="text-muted-foreground text-xs">
                      {project.deadline.toDate
                        ? project.deadline.toDate().toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary/70 shrink-0" />
                <div>
                  <p className="font-medium">Persona</p>
                  <p className="text-muted-foreground text-xs capitalize">{project.persona}</p>
                </div>
              </div>

              {project.notes && (
                <div className="border-t pt-3">
                  <p className="text-xs font-medium mb-1">Notes</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{project.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-4">
            <DocumentUpload projectId={projectId} />
          </div>
        </div>
      </div>
    </div>
  );
}
