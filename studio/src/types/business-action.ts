import type { FieldValue, Timestamp } from "firebase/firestore";

export type BusinessActionStatus = "planned" | "in_progress" | "blocked" | "review" | "done" | "cancelled";
export type BusinessActionPriority = "low" | "medium" | "high" | "critical";
export type BusinessActionSource = "manual" | "compliance" | "finance" | "operations" | "tender" | "assessment" | "ai";
export type EvidenceConfidence = "high" | "moderate" | "low" | "unknown";

export interface ActionEvidence {
  label: string;
  url: string;
  addedAt: Timestamp | FieldValue;
}

export interface BusinessAction {
  id: string;
  userId: string;
  businessId: string;
  title: string;
  description: string;
  status: BusinessActionStatus;
  priority: BusinessActionPriority;
  source: BusinessActionSource;
  sourceId?: string;
  confidence: EvidenceConfidence;
  ownerName: string;
  dueAt: Timestamp | null;
  completedAt: Timestamp | null;
  outcome: string;
  evidence: ActionEvidence[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export type CreateBusinessAction = Pick<BusinessAction, "title" | "description" | "priority" | "source" | "confidence" | "ownerName"> & {
  userId: string;
  businessId?: string;
  dueAt?: Date | null;
  sourceId?: string;
};
