import { serverTimestamp } from "firebase/firestore";
import type { Persona, PersonaAnswers, ChecklistItem } from "@/types/project";
import { createChecklist } from "./project-service";
import { generateOnboardingChecklistFlow } from "@/ai/flows/generate-onboarding-checklist";

const FALLBACK_TEMPLATES: Record<string, ChecklistItem[]> = {
  "individual-website": [
    { id: "domain", task: "Choose your domain name", description: "Pick a .co.zw or .com domain for your site", type: "action", status: "pending", link: null },
    { id: "photos", task: "Prepare photos of your work", description: "Provide 3-5 high-quality photos showcasing what you do", type: "upload", status: "pending", link: null },
    { id: "bio", task: "Write your business description", description: "Tell visitors who you are and what you offer", type: "info", status: "pending", link: null },
    { id: "colors", task: "Choose your color scheme", description: "Pick 2-3 colors that represent your brand", type: "decision", status: "pending", link: null },
    { id: "content", task: "Provide page content", description: "Write the text for each page of your site", type: "upload", status: "pending", link: null },
    { id: "review", task: "Review and approve design", description: "Check the design mockup and give feedback", type: "action", status: "pending", link: null },
  ],
  "individual-online-store": [
    { id: "domain", task: "Choose your domain name", description: "Pick a .co.zw or .com domain", type: "action", status: "pending", link: null },
    { id: "products", task: "List your products", description: "Provide product names, prices, and descriptions", type: "upload", status: "pending", link: null },
    { id: "photos", task: "Upload product photos", description: "High-quality photos for each product", type: "upload", status: "pending", link: null },
    { id: "payment", task: "Choose payment methods", description: "EcoCash, Stripe, or both", type: "decision", status: "pending", link: null },
    { id: "shipping", task: "Set delivery details", description: "Define shipping zones and costs", type: "info", status: "pending", link: null },
    { id: "review", task: "Review and approve store", description: "Check the store before launch", type: "action", status: "pending", link: null },
  ],
  "sme-website": [
    { id: "domain", task: "Choose your domain name", description: "Business domain for your company", type: "action", status: "pending", link: null },
    { id: "branding", task: "Provide brand assets", description: "Logo, brand colors, and brand guidelines", type: "upload", status: "pending", link: null },
    { id: "pages", task: "Define page structure", description: "List the pages you need (About, Services, Contact, etc.)", type: "info", status: "pending", link: null },
    { id: "content", task: "Provide content for each page", description: "Text, images, and any media for your pages", type: "upload", status: "pending", link: null },
    { id: "seo", task: "Provide SEO keywords", description: "Keywords your customers search for", type: "info", status: "pending", link: null },
    { id: "review", task: "Review and approve design", description: "Sign off on the final design", type: "action", status: "pending", link: null },
  ],
  "sme-erp": [
    { id: "requirements", task: "Define business processes", description: "Walk us through your current workflows", type: "info", status: "pending", link: null },
    { id: "users", task: "List system users", description: "Who needs access and what permissions", type: "info", status: "pending", link: null },
    { id: "data", task: "Prepare existing data", description: "Export current data for migration", type: "upload", status: "pending", link: null },
    { id: "integrations", task: "Identify integrations needed", description: "Banking, ZIMRA, payroll, etc.", type: "info", status: "pending", link: null },
    { id: "training", task: "Schedule team training", description: "Book training sessions for your staff", type: "action", status: "pending", link: null },
  ],
  "sme-consulting": [
    { id: "goals", task: "Define your goals", description: "What do you want to achieve with this engagement", type: "info", status: "pending", link: null },
    { id: "docs", task: "Share relevant documents", description: "Any existing plans, reports, or data", type: "upload", status: "pending", link: null },
    { id: "stakeholders", task: "Identify key stakeholders", description: "Who needs to be involved in decisions", type: "info", status: "pending", link: null },
    { id: "timeline", task: "Set expected timeline", description: "When do you need deliverables by", type: "decision", status: "pending", link: null },
    { id: "kickoff", task: "Schedule kickoff meeting", description: "Book the initial discovery session", type: "action", status: "pending", link: null },
  ],
  "enterprise": [
    { id: "rfp", task: "Submit detailed RFP", description: "Formal requirements document for your project", type: "upload", status: "pending", link: null },
    { id: "budget", task: "Confirm budget range", description: "Finalize the budget for your project", type: "decision", status: "pending", link: null },
    { id: "timeline", task: "Define milestones", description: "Agree on key delivery milestones", type: "info", status: "pending", link: null },
    { id: "sla", task: "Review SLA terms", description: "Service level agreement review", type: "action", status: "pending", link: null },
    { id: "team", task: "Introduce project team", description: "Meet the team working on your project", type: "action", status: "pending", link: null },
    { id: "kickoff", task: "Schedule kickoff meeting", description: "Formal project kickoff", type: "action", status: "pending", link: null },
  ],
};

function detectPersona(answers: PersonaAnswers): Persona {
  if (answers.audience === "myself") return "individual";
  if (answers.budget === "over-10000") return "enterprise";
  if (answers.audience === "my-business" && answers.need === "consulting" && answers.budget === "2000-10000") {
    return "enterprise";
  }
  return "sme";
}

function getFallbackKey(persona: Persona, need: string): string {
  if (persona === "enterprise") return "enterprise";
  const safeNeed = need === "not-sure" ? "website" : need;
  return `${persona}-${safeNeed}`;
}

function fallbackChecklist(persona: Persona, need: string): ChecklistItem[] {
  const key = getFallbackKey(persona, need);
  const template = FALLBACK_TEMPLATES[key];
  if (template) return template.map((item) => ({ ...item }));
  return FALLBACK_TEMPLATES["individual-website"]!.map((item) => ({ ...item }));
}

export async function generateOnboardingChecklist(
  userId: string,
  answers: PersonaAnswers,
): Promise<{ checklistId: string; persona: Persona; items: ChecklistItem[] }> {
  const persona = detectPersona(answers);
  let items: ChecklistItem[];

  try {
    const aiResult = await generateOnboardingChecklistFlow({
      audience: answers.audience,
      need: answers.need,
      budget: answers.budget,
      name: answers.name,
      company: answers.company,
      industry: answers.industry,
      message: answers.message,
    });

    items = aiResult.items.map((item) => ({
      ...item,
      status: "pending" as const,
      link: null,
    }));
  } catch {
    items = fallbackChecklist(persona, answers.need);
  }

  if (!items.length) {
    items = fallbackChecklist(persona, answers.need);
  }

  const checklistId = await createChecklist({
    userId,
    persona,
    items,
    generatedAt: serverTimestamp(),
    completedAt: null,
  });

  return { checklistId, persona, items };
}

export function getSuggestedPackage(persona: Persona, need: string, budget: string): string {
  if (persona === "individual") {
    if (need === "online-store") return "E-Commerce — $1,000";
    if (budget === "under-500") return "Starter Site — $150";
    return "Business Site — $400";
  }
  if (persona === "enterprise") return "Custom Solution — Request Quote";
  if (need === "erp" || need === "business-software") return "ERP Starter — $49/mo";
  if (need === "consulting") return "Professional Services — from $500";
  if (need === "ai-tools") return "AI Platform — Free plan available";
  return "Business Site — $400";
}
