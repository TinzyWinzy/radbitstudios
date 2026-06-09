import { NextRequest, NextResponse } from "next/server";
import { getChecklist, updateChecklistItem } from "@/services/project-service";
import { generateOnboardingChecklist } from "@/services/onboarding-engine";
import { withAuth } from "@/lib/api-auth";

export const GET = withAuth(async (_request: NextRequest, userId: string) => {
  try {
    const checklist = await getChecklist(userId);
    return NextResponse.json({ checklist });
  } catch (error) {
    console.error("[Checklist API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch checklist" }, { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json();
    const checklist = await generateOnboardingChecklist(userId, body);
    return NextResponse.json({ checklist });
  } catch (error) {
    console.error("[Checklist API] Error:", error);
    return NextResponse.json({ error: "Failed to generate checklist" }, { status: 500 });
  }
});

export const PATCH = withAuth(async (request: NextRequest) => {
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
});
