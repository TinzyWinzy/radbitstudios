import { adminDb } from '@/lib/firebase/firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'LicensedAgents' });

const AGENTS_COLLECTION = 'licensed_agents';

export interface LicensedAgent {
  bpNumber: string;
  name: string;
  f64Number: string;
  physicalAddress: string;
  email: string;
  contactNumber: string;
  licenseFeeReceipt?: string;
  licenseYear: number;
  location?: string;
  services?: string[];
}

function loadAllAgents(): Omit<LicensedAgent, 'licenseYear'>[] {
  try {
    const jsonPath = resolve(process.cwd(), 'src/services/agents-data.json');
    const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    return data.agents || [];
  } catch (err) {
    log.warn('Could not load agents-data.json, using empty seed');
    return [];
  }
}

const ALL_AGENTS = loadAllAgents();

export async function seedAgents(): Promise<number> {
  if (ALL_AGENTS.length === 0) {
    log.warn('No agent data available to seed');
    return 0;
  }

  let count = 0;
  let batch = adminDb.batch();
  let ops = 0;

  for (const agent of ALL_AGENTS) {
    const existing = await adminDb.collection(AGENTS_COLLECTION)
      .where('bpNumber', '==', agent.bpNumber)
      .limit(1)
      .get();

    if (existing.empty) {
      const ref = adminDb.collection(AGENTS_COLLECTION).doc();
      batch.set(ref, {
        ...agent,
        licenseYear: 2026,
        createdAt: new Date(),
      });
      ops++;
      count++;

      if (ops >= 400) {
        await batch.commit();
        batch = adminDb.batch();
        ops = 0;
      }
    }
  }

  if (ops > 0) {
    await batch.commit();
  }

  log.info(`Seeded ${count}/${ALL_AGENTS.length} licensed agents`);
  return count;
}

type CollectionRef = ReturnType<typeof adminDb.collection>;

export async function searchAgents(searchTerm?: string, location?: string): Promise<LicensedAgent[]> {
  try {
    let query: CollectionRef = adminDb.collection(AGENTS_COLLECTION);

    if (location && location !== 'All') {
      query = query.where('location', '==', location) as CollectionRef;
    }

    const snap = await query.limit(50).get();
    let agents = snap.docs.map((d: typeof snap.docs[number]) => ({ ...d.data(), id: d.id } as LicensedAgent & { id: string }));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      agents = agents.filter(a =>
        a.name.toLowerCase().includes(term) ||
        a.bpNumber.toLowerCase().includes(term) ||
        a.location?.toLowerCase().includes(term) ||
        a.services?.some(s => s.toLowerCase().includes(term))
      );
    }

    return agents;
  } catch {
    return [];
  }
}

export async function getAgentByBpNumber(bpNumber: string): Promise<LicensedAgent | null> {
  try {
    const snap = await adminDb.collection(AGENTS_COLLECTION)
      .where('bpNumber', '==', bpNumber)
      .limit(1)
      .get();

    if (snap.empty) return null;
    return snap.docs[0].data() as LicensedAgent;
  } catch {
    return null;
  }
}

export function getAgentLocations(): string[] {
  const locs = new Set<string>();
  for (const a of ALL_AGENTS) {
    if (a.location && a.location !== 'Other') locs.add(a.location);
  }
  return [...locs].sort();
}

export function getAgentServiceTypes(): string[] {
  const types = new Set<string>();
  for (const a of ALL_AGENTS) {
    a.services?.forEach(s => types.add(s));
  }
  return [...types].sort();
}
