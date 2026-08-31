/**
 * High-risk or unfinished capabilities remain unavailable until the relevant
 * security, contractual and regulatory reviews have been completed.
 */
export const DISABLED_PAGE_PREFIXES = [
  '/escrow',
  '/penalty-protection',
  '/zimra-fiscal-device-registration',
  '/compliant-receipts',
  '/tender-compliance-bridge',
  '/diaspora-matchmaking',
  '/features/praz-compliance',
  '/features/tax-copilot',
  '/resources/tools/fiscal-compliance',
  '/use-cases/praz-compliance',
  '/vat-threshold-alerts',
  '/offline-mode',
  '/investor-portal',
  '/tax-copilot',
] as const;

export const DISABLED_API_PREFIXES = [
  '/api/escrow',
  '/api/fiscal',
  '/api/trust-seal',
  '/api/fi/trust-seal',
  '/api/compliance/certificates',
  '/api/diaspora',
] as const;

export function matchesDisabledPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
