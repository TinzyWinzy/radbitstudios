import { db } from "@/lib/firebase/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  ActionEvidence,
  BusinessAction,
  BusinessActionPriority,
  BusinessActionStatus,
  CreateBusinessAction,
} from "@/types/business-action";

const COLLECTION = "business_actions";

export const ACTIVE_ACTION_STATUSES: BusinessActionStatus[] = ["planned", "in_progress", "blocked", "review"];
export const PRIORITY_WEIGHT: Record<BusinessActionPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };

function timestampMillis(value: BusinessAction["dueAt"]): number {
  return value instanceof Timestamp ? value.toMillis() : Number.MAX_SAFE_INTEGER;
}

export function sortBusinessActions(actions: BusinessAction[]): BusinessAction[] {
  return [...actions].sort((a, b) => {
    const statusDelta = Number(!ACTIVE_ACTION_STATUSES.includes(a.status)) - Number(!ACTIVE_ACTION_STATUSES.includes(b.status));
    if (statusDelta) return statusDelta;
    const priorityDelta = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (priorityDelta) return priorityDelta;
    return timestampMillis(a.dueAt) - timestampMillis(b.dueAt);
  });
}

export function isActionOverdue(action: BusinessAction, now = new Date()): boolean {
  return ACTIVE_ACTION_STATUSES.includes(action.status) && action.dueAt instanceof Timestamp && action.dueAt.toMillis() < now.getTime();
}

export async function listBusinessActions(userId: string): Promise<BusinessAction[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where("userId", "==", userId)));
  return sortBusinessActions(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as BusinessAction)));
}

export async function createBusinessAction(input: CreateBusinessAction): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    businessId: input.businessId || input.userId,
    sourceId: input.sourceId || null,
    status: "planned",
    dueAt: input.dueAt ? Timestamp.fromDate(input.dueAt) : null,
    completedAt: null,
    outcome: "",
    evidence: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBusinessAction(id: string, patch: Partial<Pick<BusinessAction, "title" | "description" | "priority" | "status" | "confidence" | "ownerName" | "outcome">> & { dueAt?: Date | null }): Promise<void> {
  const next: Record<string, unknown> = { ...patch, updatedAt: serverTimestamp() };
  if (patch.status === "done") next.completedAt = serverTimestamp();
  if (patch.status && patch.status !== "done") next.completedAt = null;
  delete next.dueAt;
  if (patch.dueAt !== undefined) next.dueAt = patch.dueAt ? Timestamp.fromDate(patch.dueAt) : null;
  await updateDoc(doc(db, COLLECTION, id), next);
}

export async function addActionEvidence(id: string, existing: ActionEvidence[], evidence: { label: string; url: string }): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    evidence: [...existing, { ...evidence, addedAt: Timestamp.now() }],
    updatedAt: serverTimestamp(),
  });
}
