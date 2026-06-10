'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Project, ProjectTask } from '@/types/project';

interface UseProjectsReturn {
  projects: Project[];
  projectTasks: Record<string, ProjectTask[]>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProjects(userId?: string): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<Record<string, ProjectTask[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = userId ? `/api/projects?clientId=${userId}` : '/api/projects';
      const res = await fetch(url);
      const json = await res.json();

      if (json.projects) {
        setProjects(json.projects);

        const tasksPromises = json.projects.map((p: Project) =>
          fetch(`/api/projects/${p.id}`)
            .then(r => r.json())
            .catch(() => ({ tasks: [] }))
        );

        const tasksResults = await Promise.all(tasksPromises);
        const tasksMap: Record<string, ProjectTask[]> = {};

        json.projects.forEach((p: Project, i: number) => {
          tasksMap[p.id] = tasksResults[i]?.tasks || [];
        });

        setProjectTasks(tasksMap);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      console.error('[useProjects] Failed:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, projectTasks, loading, error, refetch: fetchProjects };
}
