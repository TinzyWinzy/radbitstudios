export const REQUIRED_DOCUMENTS = [
  { id: 'cert_incorporation', label: 'Certificate of Incorporation', description: 'Company registration document from the Registrar of Companies', perpetual: true },
  { id: 'cr14', label: 'CR14 — List of Shareholders', description: 'Current list of shareholders filed with the Registrar', perpetual: true },
  { id: 'cr6', label: 'CR6 — List of Directors', description: 'Current list of directors filed with the Registrar', perpetual: true },
  { id: 'itf263', label: 'ZIMRA Tax Clearance (ITF263)', description: 'Valid tax clearance certificate' },
  { id: 'nssa', label: 'NSSA Compliance Certificate', description: 'National Social Security Authority compliance' },
  { id: 'business_license', label: 'Business Operating License', description: 'Local council or sector-specific operating license' },
  { id: 'proof_residence', label: 'Proof of Residence (Directors)', description: 'Utility bill or bank statement for each director' },
] as const;

export type DocumentId = typeof REQUIRED_DOCUMENTS[number]['id'];
