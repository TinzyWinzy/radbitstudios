import { NextRequest, NextResponse } from "next/server";
import { getChecklist, updateChecklistItem } from "@/services/project-service-admin";
import { generateOnboardingChecklist } from "@/services/onboarding-engine";
import { withAuth } from "@/lib/api-auth";
import { withIpRateLimit } from '@/services/api-rate-limit';

const apiRead = { maxRequests: 60, windowMs: 60 * 1000, keyPrefix: 'ratelimit:checklist' };
const apiWrite = { maxRequests: 20, windowMs: 60 * 1000, keyPrefix: 'ratelimit:checklist-write' };

export const GET = withIpRateLimit(apiRead, withAuth(async (_request: NextRequest, userId: string) => {
  try {
    const checklist = await getChecklist(userId);
    return NextResponse.json({ checklist });
  } catch (error) {
    console.error("[Checklist API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch checklist" }, { status: 500 });
  }
}));

export const POST = withIpRateLimit(apiWrite, withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json();
    const checklist = await generateOnboardingChecklist(userId, body);
    return NextResponse.json({ checklist });
  } catch (error) {
    console.error("[Checklist API] Error:", error);
    return NextResponse.json({ error: "Failed to generate checklist" }, { status: 500 });
  }
}));

export const PATCH = withIpRateLimit(apiWrite, withAuth(async (request: NextRequest) => {
  try {
    const { checklistId, itemId, status } = await request.json();
    if (!checklistId || !itemId || !status) {
      return NextResponse.json({ error: "checklistId, itemId, and status are required" }, { status: 400 });
    }
    await updateChecklistItem(checklistId, itemId, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Checklist API] Error:", error);
    return NextResponse.json({ error: "Failed to update checklist item" }, { status: 500 });
  }
}));
