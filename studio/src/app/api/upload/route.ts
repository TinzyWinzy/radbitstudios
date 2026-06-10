import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { withIpRateLimit } from '@/services/api-rate-limit';

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const POST = withIpRateLimit(
  { maxRequests: 10, windowMs: 60 * 1000, keyPrefix: 'ratelimit:upload' },
  withAuth(async (request: NextRequest, userId: string) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;

    if (!file || !projectId) {
      return NextResponse.json({ error: "file and projectId are required" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `File type '${file.type}' is not allowed. Accepted: images, PDF, Word, Excel, text` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "bin";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storagePath = `projects/${projectId}/${filename}`;

    const { storage } = await import("@/lib/firebase/firebase");
    const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");

    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, buffer, {
      contentType: file.type,
      customMetadata: { uploadedBy: userId, originalName: file.name },
    });
    const url = await getDownloadURL(storageRef);

    return NextResponse.json({
      success: true,
      url,
      filename,
      storagePath,
    });
  } catch (error) {
    console.error("[Upload API] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}));
