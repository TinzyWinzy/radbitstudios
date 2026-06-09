import type { Timestamp, FieldValue } from "firebase/firestore";

export type ProjectStatus =
  | "lead"
  | "onboarding"
  | "design"
  | "development"
  | "review"
  | "live"
  | "completed"
  | "cancelled";

export type ProjectType =
  | "web"
  | "erp"
  | "consulting"
  | "ai-platform"
  | "custom";

export type Persona = "individual" | "sme" | "enterprise";

export type TaskStatus = "pending" | "in_progress" | "review" | "done";

export type TaskAssignee = "client" | "admin";

export type ChecklistItemType = "info" | "upload" | "action" | "decision";

export interface Project {
  id: string;
  clientId: string;
  type: ProjectType;
  status: ProjectStatus;
  packageName: string;
  budget: number;
  currency: "USD" | "ZiG";
  persona: Persona;
  startedAt: Timestamp | null;
  deadline: Timestamp | null;
  completedAt: Timestamp | null;
  assignedTo: string | null;
  notes: string;
  createdAt: FieldValue | Timestamp;
  updatedAt: FieldValue | Timestamp;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: TaskAssignee;
  order: number;
  createdAt: FieldValue | Timestamp;
  dueDate: Timestamp | null;
  completedAt: Timestamp | null;
}

export interface ChecklistItem {
  id: string;
  task: string;
  description: string;
  type: ChecklistItemType;
  status: "pending" | "completed";
  link: string | null;
}

export interface OnboardingChecklist {
  id: string;
  userId: string;
  persona: Persona;
  items: ChecklistItem[];
  generatedAt: FieldValue | Timestamp;
  completedAt: FieldValue | Timestamp | null;
}

export interface ClientNote {
  id: string;
  clientId: string;
  authorId: string;
  content: string;
  createdAt: Timestamp;
}

export interface PersonaAnswers {
  audience: "myself" | "my-business" | "not-sure";
  need:
    | "website"
    | "online-store"
    | "business-software"
    | "consulting"
    | "ai-tools"
    | "not-sure";
  budget:
    | "under-500"
    | "500-2000"
    | "2000-10000"
    | "over-10000"
    | "not-sure";
  name: string;
  email: string;
  company?: string;
  industry?: string;
  message?: string;
}
