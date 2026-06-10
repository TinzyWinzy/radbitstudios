import { NextRequest, NextResponse } from "next/server";
import { getClientProjects, getAllProjects, updateProject, deleteProject } from "@/services/project-service-admin";
import { withAuth } from "@/lib/api-auth";
import { withIpRateLimit } from '@/services/api-rate-limit';

const rlRead = { maxRequests: 100, windowMs: 60 * 1000, keyPrefix: 'ratelimit:projects' };
const rlWrite = { maxRequests: 20, windowMs: 60 * 1000, keyPrefix: 'ratelimit:projects-write' };

export const GET = withIpRateLimit(rlRead, withAuth(async (request: NextRequest, userId: string) => {
  try {
    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId");
    const admin = url.searchParams.get("admin");

    if (admin === "true") {
      const projects = await getAllProjects();
      return NextResponse.json({ projects });
    }

    if (clientId) {
      const projects = await getClientProjects(clientId);
      return NextResponse.json({ projects });
    }

    const projects = await getClientProjects(userId);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[Projects API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}));

export const PATCH = withIpRateLimit(rlWrite, withAuth(async (request: NextRequest, _userId: string) => {
  try {
    const { projectId, ...data } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    await updateProject(projectId, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Projects API] Error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}));

export const DELETE = withIpRateLimit(rlWrite, withAuth(async (request: NextRequest) => {
  try {
    const { projectId } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    await deleteProject(projectId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Projects API] Error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}));
