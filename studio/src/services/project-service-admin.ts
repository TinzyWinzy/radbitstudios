import { adminDb } from "@/lib/firebase/firebase-admin";
import {
  Timestamp,
} from "firebase-admin/firestore";
import type {
  Project,
  ProjectStatus,
  ProjectTask,
  OnboardingChecklist,
  ChecklistItem,
  ClientNote,
} from "@/types/project";
import { getStatusLabel } from "./project-service";

const PROJECTS_COLLECTION = "projects";
const TASKS_COLLECTION = "project_tasks";
const CHECKLISTS_COLLECTION = "onboarding_checklists";
const NOTES_COLLECTION = "client_notes";

function withId<T>(doc: { id: string; data: () => Record<string, unknown> }): T {
  return { id: doc.id, ...doc.data() } as T;
}

export async function getProject(projectId: string): Promise<Project | null> {
  const snap = await adminDb.collection(PROJECTS_COLLECTION).doc(projectId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as Project;
}

export async function getClientProjects(clientId: string): Promise<Project[]> {
  const snap = await adminDb.collection(PROJECTS_COLLECTION)
    .where("clientId", "==", clientId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => withId<Project>(d));
}

export async function getAllProjects(max = 50): Promise<Project[]> {
  const snap = await adminDb.collection(PROJECTS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();
  return snap.docs.map((d) => withId<Project>(d));
}

export async function getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
  const snap = await adminDb.collection(PROJECTS_COLLECTION)
    .where("status", "==", status)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => withId<Project>(d));
}

export async function createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await adminDb.collection(PROJECTS_COLLECTION).add({
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateProject(projectId: string, data: Partial<Project>): Promise<void> {
  await adminDb.collection(PROJECTS_COLLECTION).doc(projectId).update({
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  await adminDb.collection(PROJECTS_COLLECTION).doc(projectId).delete();
}

export async function getProjectTasks(projectId: string): Promise<ProjectTask[]> {
  const snap = await adminDb.collection(TASKS_COLLECTION)
    .where("projectId", "==", projectId)
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((d) => withId<ProjectTask>(d));
}

export async function createTask(data: Omit<ProjectTask, "id" | "createdAt">): Promise<string> {
  const ref = await adminDb.collection(TASKS_COLLECTION).add({
    ...data,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateTask(taskId: string, data: Partial<ProjectTask>): Promise<void> {
  await adminDb.collection(TASKS_COLLECTION).doc(taskId).update(data);
}

export async function deleteTask(taskId: string): Promise<void> {
  await adminDb.collection(TASKS_COLLECTION).doc(taskId).delete();
}

export async function getChecklist(userId: string): Promise<OnboardingChecklist | null> {
  const snap = await adminDb.collection(CHECKLISTS_COLLECTION)
    .where("userId", "==", userId)
    .orderBy("generatedAt", "desc")
    .limit(1)
    .get();
  if (snap.empty) return null;
  return withId<OnboardingChecklist>(snap.docs[0]);
}

export async function createChecklist(data: Omit<OnboardingChecklist, "id">): Promise<string> {
  const ref = await adminDb.collection(CHECKLISTS_COLLECTION).add(data);
  return ref.id;
}

export async function updateChecklistItem(
  checklistId: string,
  itemId: string,
  status: "pending" | "completed",
): Promise<void> {
  const ref = adminDb.collection(CHECKLISTS_COLLECTION).doc(checklistId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const items: ChecklistItem[] = snap.data()?.items || [];
  const updated = items.map((item) =>
    item.id === itemId ? { ...item, status } : item,
  );
  const allDone = updated.every((item) => item.status === "completed");
  await ref.update({
    items: updated,
    ...(allDone ? { completedAt: Timestamp.now() } : {}),
  });
}

export async function deleteChecklist(checklistId: string): Promise<void> {
  await adminDb.collection(CHECKLISTS_COLLECTION).doc(checklistId).delete();
}

export async function getClientNotes(clientId: string): Promise<ClientNote[]> {
  const snap = await adminDb.collection(NOTES_COLLECTION)
    .where("clientId", "==", clientId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => withId<ClientNote>(d));
}

export async function createNote(data: Omit<ClientNote, "id" | "createdAt">): Promise<string> {
  const ref = await adminDb.collection(NOTES_COLLECTION).add({
    ...data,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function deleteNote(noteId: string): Promise<void> {
  await adminDb.collection(NOTES_COLLECTION).doc(noteId).delete();
}

export async function getProjectsByAdmin(adminId: string): Promise<Project[]> {
  const snap = await adminDb.collection(PROJECTS_COLLECTION)
    .where("assignedTo", "==", adminId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => withId<Project>(d));
}

export async function batchUpdateProjectStatus(
  updates: Array<{ projectId: string; status: ProjectStatus }>,
): Promise<void> {
  const batch = adminDb.batch();
  const now = Timestamp.now();
  for (const { projectId, status } of updates) {
    const ref = adminDb.collection(PROJECTS_COLLECTION).doc(projectId);
    batch.update(ref, { status, updatedAt: now });
  }
  await batch.commit();
}

export async function createProjectNotification(params: {
  userId: string;
  projectId: string;
  projectName: string;
  newStatus: ProjectStatus;
  oldStatus?: ProjectStatus;
}): Promise<void> {
  const { createNotification } = await import("@/services/notifications/notifications-service");
  const statusLabel = getStatusLabel(params.newStatus);
  await createNotification({
    userId: params.userId,
    title: `Project Update: ${params.projectName}`,
    body: `Status changed to ${statusLabel}`,
    type: "project",
    read: false,
    link: `/dashboard/projects/${params.projectId}`,
  });
}


