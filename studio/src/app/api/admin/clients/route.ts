import { NextRequest, NextResponse } from "next/server";
import { getAllProjects, getClientProjects, getClientNotes, createNote, deleteNote } from "@/services/project-service-admin";
import { withAuth } from "@/lib/api-auth";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId");

    if (clientId) {
      const [projects, notes] = await Promise.all([
        getClientProjects(clientId),
        getClientNotes(clientId),
      ]);
      return NextResponse.json({ projects, notes });
    }

    const projects = await getAllProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[Admin Clients API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const { clientId, content } = await request.json();
    if (!clientId || !content) {
      return NextResponse.json({ error: "clientId and content are required" }, { status: 400 });
    }
    const noteId = await createNote({
      clientId,
      authorId: userId,
      content,
    });
    return NextResponse.json({ success: true, noteId });
  } catch (error) {
    console.error("[Admin Clients API] Error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { noteId } = await request.json();
    if (!noteId) {
      return NextResponse.json({ error: "noteId is required" }, { status: 400 });
    }
    await deleteNote(noteId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Clients API] Error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
});
