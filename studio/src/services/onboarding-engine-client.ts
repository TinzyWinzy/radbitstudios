export function getSuggestedPackage(persona: string, need: string, budget: string): string {
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
