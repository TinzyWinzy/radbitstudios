"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectProgress } from "@/components/project-progress";
import { ArrowLeft, FolderOpen } from "lucide-react";
import Link from "next/link";
import type { Project, ProjectTask } from "@/types/project";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<Record<string, ProjectTask[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (json.projects) {
        setProjects(json.projects);
        const tasksPromises = json.projects.map((p: Project) =>
          fetch(`/api/projects/${p.id}`).then(r => r.json()).catch(() => ({ tasks: [] }))
        );
        const tasksResults = await Promise.all(tasksPromises);
        const tasksMap: Record<string, ProjectTask[]> = {};
        json.projects.forEach((p: Project, i: number) => {
          tasksMap[p.id] = tasksResults[i]?.tasks || [];
        });
        setProjectTasks(tasksMap);
      }
    } catch (e) {
      console.error("[MyProjects] Failed:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground text-sm">All your ongoing and completed projects.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-4 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-20" /></CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <CardTitle className="mb-2">No projects yet</CardTitle>
            <CardDescription>
              When you inquire about a service, your projects will appear here.
            </CardDescription>
            <Button asChild className="mt-6">
              <Link href="/solutions">Explore Services</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectProgress
              key={project.id}
              project={project}
              tasks={projectTasks[project.id] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
