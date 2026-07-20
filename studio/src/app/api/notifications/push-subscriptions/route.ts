import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { withAuth } from "@/lib/api-auth";

export const runtime = "nodejs";

const SubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({ auth: z.string().min(1), p256dh: z.string().min(1) }),
  device: z.object({
    userAgent: z.string().max(500),
    platform: z.string().max(100),
    standalone: z.boolean(),
  }),
});

function subscriptionId(userId: string, endpoint: string): string {
  return createHash("sha256").update(`${userId}:${endpoint}`).digest("hex");
}

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  const parsed = SubscriptionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });
  const id = subscriptionId(userId, parsed.data.endpoint);
  const ref = adminDb.collection("push_subscriptions").doc(id);
  const existing = await ref.get();
  await ref.set({
    userId,
    subscription: {
      endpoint: parsed.data.endpoint,
      expirationTime: parsed.data.expirationTime ?? null,
      keys: parsed.data.keys,
    },
    device: parsed.data.device,
    active: true,
    createdAt: existing.exists ? existing.data()?.createdAt : new Date(),
    lastSeenAt: new Date(),
    updatedAt: new Date(),
  }, { merge: true });
  return NextResponse.json({ id, active: true });
});

export const DELETE = withAuth(async (request: NextRequest, userId: string) => {
  const endpoint = new URL(request.url).searchParams.get("endpoint");
  if (!endpoint) return NextResponse.json({ error: "Endpoint is required" }, { status: 400 });
  await adminDb.collection("push_subscriptions").doc(subscriptionId(userId, endpoint)).delete();
  return NextResponse.json({ removed: true });
});
