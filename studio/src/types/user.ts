import type { User } from "firebase/auth";
import type { UserRole } from "@/services/permissions";

export type PlanName = "Free" | "Growth" | "Tender Starter" | "Pro" | "Enterprise";

export interface AppUser extends User {
  businessName: string;
  industry: string;
  businessDescription: string;
  plan: PlanName;
  usage: Record<string, { remaining: number; total: number }>;
  role?: UserRole;
  countryCode?: string;
  currencyPreference?: string;
  dismissedOnboarding?: boolean;
  aiBudget?: { used: number; limit: number };
  subscriptionId?: string;
  phone?: string;
  whatsappOptIn?: boolean;
}
