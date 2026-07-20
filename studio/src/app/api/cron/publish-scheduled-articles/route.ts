import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expectedToken = process.env.CRON_SECRET;
  if (!expectedToken || request.headers.get("authorization") !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Timestamp.now();
  const snapshot = await adminDb.collection("blog_posts").where("status", "==", "scheduled").get();
  const due = snapshot.docs.filter(doc => {
    const scheduledAt = doc.data().scheduledAt;
    return scheduledAt?.toMillis?.() <= now.toMillis();
  });

  if (due.length) {
    const batch = adminDb.batch();
    due.forEach(doc => batch.update(doc.ref, {
      status: "published",
      published: true,
      publishedAt: doc.data().publishedAt || now,
      updatedAt: FieldValue.serverTimestamp(),
    }));
    await batch.commit();
  }

  return NextResponse.json({ published: due.length, checked: snapshot.size, timestamp: now.toDate().toISOString() });
}
