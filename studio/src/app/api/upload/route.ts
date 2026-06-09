import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;

    if (!file || !projectId) {
      return NextResponse.json({ error: "file and projectId are required" }, { status: 400 });
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
});
