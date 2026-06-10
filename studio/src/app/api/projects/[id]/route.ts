import { NextRequest, NextResponse } from "next/server";
import { getProject, getProjectTasks } from "@/services/project-service-admin";
import { withAuth } from "@/lib/api-auth";
import { withIpRateLimit } from '@/services/api-rate-limit';

export const GET = withIpRateLimit(
  { maxRequests: 100, windowMs: 60 * 1000, keyPrefix: 'ratelimit:project-detail' },
  withAuth(async (_request: NextRequest, _userId: string) => {
  try {
    const url = new URL(_request.url);
    const segments = url.pathname.split("/");
    const projectId = segments[segments.length - 1];

    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const tasks = await getProjectTasks(projectId);

    return NextResponse.json({ project, tasks });
  } catch (error) {
    console.error("[Project API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}));
