import { db } from "@/lib/firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import type {
  Project,
  ProjectStatus,
  ProjectTask,
  OnboardingChecklist,
  ChecklistItem,
  ClientNote,
} from "@/types/project";

const PROJECTS_COLLECTION = "projects";
const TASKS_COLLECTION = "project_tasks";
const CHECKLISTS_COLLECTION = "onboarding_checklists";
const NOTES_COLLECTION = "client_notes";

function withId<T>(doc: { id: string; data: () => Record<string, unknown> }): T {
  return { id: doc.id, ...doc.data() } as T;
}

export async function getProject(projectId: string): Promise<Project | null> {
  const snap = await getDoc(doc(db, PROJECTS_COLLECTION, projectId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Project;
}

export async function getClientProjects(clientId: string): Promise<Project[]> {
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where("clientId", "==", clientId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Project>(d));
}

export async function getAllProjects(max = 50): Promise<Project[]> {
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Project>(d));
}

export async function getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Project>(d));
}

export async function createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, PROJECTS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProject(projectId: string, data: Partial<Project>): Promise<void> {
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
}

export async function getProjectTasks(projectId: string): Promise<ProjectTask[]> {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("projectId", "==", projectId),
    orderBy("order", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<ProjectTask>(d));
}

export async function createTask(data: Omit<ProjectTask, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, TASKS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTask(taskId: string, data: Partial<ProjectTask>): Promise<void> {
  await updateDoc(doc(db, TASKS_COLLECTION, taskId), data);
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
}

export async function getChecklist(userId: string): Promise<OnboardingChecklist | null> {
  const q = query(
    collection(db, CHECKLISTS_COLLECTION),
    where("userId", "==", userId),
    orderBy("generatedAt", "desc"),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return withId<OnboardingChecklist>(snap.docs[0]);
}

export async function createChecklist(data: Omit<OnboardingChecklist, "id">): Promise<string> {
  const ref = await addDoc(collection(db, CHECKLISTS_COLLECTION), data);
  return ref.id;
}

export async function updateChecklistItem(
  checklistId: string,
  itemId: string,
  status: "pending" | "completed",
): Promise<void> {
  const ref = doc(db, CHECKLISTS_COLLECTION, checklistId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const items: ChecklistItem[] = snap.data().items || [];
  const updated = items.map((item) =>
    item.id === itemId ? { ...item, status } : item,
  );
  const allDone = updated.every((item) => item.status === "completed");
  await updateDoc(ref, {
    items: updated,
    ...(allDone ? { completedAt: serverTimestamp() } : {}),
  });
}

export async function deleteChecklist(checklistId: string): Promise<void> {
  await deleteDoc(doc(db, CHECKLISTS_COLLECTION, checklistId));
}

export async function getClientNotes(clientId: string): Promise<ClientNote[]> {
  const q = query(
    collection(db, NOTES_COLLECTION),
    where("clientId", "==", clientId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<ClientNote>(d));
}

export async function createNote(data: Omit<ClientNote, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, NOTES_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteNote(noteId: string): Promise<void> {
  await deleteDoc(doc(db, NOTES_COLLECTION, noteId));
}

export async function getProjectsByAdmin(adminId: string): Promise<Project[]> {
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where("assignedTo", "==", adminId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Project>(d));
}

export async function batchUpdateProjectStatus(
  updates: Array<{ projectId: string; status: ProjectStatus }>,
): Promise<void> {
  const batch = writeBatch(db);
  const now = serverTimestamp();
  for (const { projectId, status } of updates) {
    const ref = doc(db, PROJECTS_COLLECTION, projectId);
    batch.update(ref, { status, updatedAt: now });
  }
  await batch.commit();
}

export const PROJECT_STATUS_FLOW: ProjectStatus[] = [
  "lead",
  "onboarding",
  "design",
  "development",
  "review",
  "live",
  "completed",
];

export function canTransitionTo(
  current: ProjectStatus,
  next: ProjectStatus,
): boolean {
  const idx = PROJECT_STATUS_FLOW.indexOf(current);
  const nextIdx = PROJECT_STATUS_FLOW.indexOf(next);
  if (next === "cancelled") return true;
  return nextIdx > idx;
}

export function getStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    lead: "Lead",
    onboarding: "Onboarding",
    design: "Design",
    development: "Development",
    review: "Review",
    live: "Live",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status];
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
