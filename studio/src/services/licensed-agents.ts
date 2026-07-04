import { adminDb } from '@/lib/firebase/firebase-admin';
import type { FirebaseFirestore } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'LicensedAgents' });

const AGENTS_COLLECTION = 'licensed_agents';

interface LicensedAgent {
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

const SEED_AGENTS: Omit<LicensedAgent, 'licenseYear'>[] = [
  { bpNumber: '200124894', name: 'Classroyal Enterprises', f64Number: 'R3', physicalAddress: '155 Wellington Rd, Beitbridge', email: 'classroyal@gmail.com', contactNumber: '775816334', location: 'Beitbridge', services: ['clearing', 'freight'] },
  { bpNumber: '200283926', name: 'Valcham Investments', f64Number: 'R2', physicalAddress: '21038 Darwendale Dam View Norton', email: 'valentinemanagementpl@gmail.com', contactNumber: '772999615', location: 'Norton', services: ['clearing'] },
  { bpNumber: '200025978', name: 'Clover Cargo International', f64Number: 'R5', physicalAddress: '108 Nelson Mandela, Harare', email: 'emugugu@clovercargo.co.zw', contactNumber: '242703838', location: 'Harare', services: ['clearing', 'freight', 'international'] },
  { bpNumber: '200335385', name: 'Parladdie Agencies', f64Number: 'R6', physicalAddress: '1177 Dulibadzimo Town, Beitbridge', email: 'ladgamanya@gmail.com', contactNumber: '771210815', location: 'Beitbridge', services: ['clearing'] },
  { bpNumber: '200002876', name: 'Larkcon Enterprises', f64Number: 'R4', physicalAddress: 'Suite 1 Murandy Square West Highlands, Harare', email: 'chrisbrice2704@gmail.com', contactNumber: '772725725', location: 'Harare', services: ['clearing'] },
  { bpNumber: '200153126', name: 'Palent Freight Services', f64Number: 'R34', physicalAddress: 'Office 11 Milidi Complex, Beitbridge', email: 'fundai.marungise@gmail.com', contactNumber: '772359004', location: 'Beitbridge', services: ['freight', 'clearing'] },
  { bpNumber: '200226101', name: 'Shreveport Investments (Pvt) Ltd', f64Number: 'R15', physicalAddress: '154 Wellington Road, Beitbridge', email: 'introcashcapital@gmail.com', contactNumber: '776231246', location: 'Beitbridge', services: ['clearing', 'investment'] },
  { bpNumber: '200074324', name: 'Akasan Trading', f64Number: 'R17', physicalAddress: '33 St Davids Road Hatfield, Harare', email: 'tradingakasan@gmail.com', contactNumber: '772731978', location: 'Harare', services: ['clearing', 'trading'] },
  { bpNumber: '200281044', name: 'Quatern Freight Solution (Pvt) Ltd', f64Number: 'R29', physicalAddress: '10 Warren Close Greendale, Harare', email: 'kmafundu@gmail.com', contactNumber: '777780219', location: 'Harare', services: ['freight', 'clearing'] },
  { bpNumber: '200176272', name: 'Nashenic Freight Services', f64Number: 'R53', physicalAddress: '113 Herbert Chitepo Street, Mutare', email: 'gundanicholas@gmail.com', contactNumber: '772423628', location: 'Mutare', services: ['freight', 'clearing'] },
  { bpNumber: '200049237', name: 'Bridge Towers Enterprises', f64Number: 'R102', physicalAddress: '5 Livingwaters, Beitbridge', email: 'pcbbadmin@reglink.co.za', contactNumber: '774477278', location: 'Beitbridge', services: ['clearing', 'logistics'] },
  { bpNumber: '200094698', name: 'Shalon Logistics', f64Number: 'R114', physicalAddress: '4350 Chikanga 2, Karoi', email: 'dmgagady@gmail.com', contactNumber: '772891753', location: 'Karoi', services: ['logistics', 'clearing'] },
  { bpNumber: '200165011', name: 'Allied Customs Freight', f64Number: 'R60', physicalAddress: '1st Floor Manica Chambers, Herbert Chitepo St, Mutare', email: 'gmpanduki@gmail.com', contactNumber: '773043508', location: 'Mutare', services: ['customs', 'freight', 'clearing'] },
  { bpNumber: '200084762', name: 'Afrotude Investments', f64Number: 'R30', physicalAddress: '19B Border Service Station, Beitbridge', email: 'afrotudeshipping@gmail.com', contactNumber: '773408611', location: 'Beitbridge', services: ['clearing', 'shipping'] },
  { bpNumber: '200084064', name: 'Shipping Champions', f64Number: 'R87', physicalAddress: '4207 Denhe Close Budiriro 2, Harare', email: 'brianmzw@yahoo.com', contactNumber: '772927651', location: 'Harare', services: ['shipping', 'clearing'] },
];

export async function seedAgents(): Promise<number> {
  let count = 0;
  for (const agent of SEED_AGENTS) {
    const existing = await adminDb.collection(AGENTS_COLLECTION)
      .where('bpNumber', '==', agent.bpNumber)
      .limit(1)
      .get();

    if (existing.empty) {
      await adminDb.collection(AGENTS_COLLECTION).add({
        ...agent,
        licenseYear: 2026,
        createdAt: new Date(),
      });
      count++;
    }
  }
  log.info(`Seeded ${count} licensed agents`);
  return count;
}

export async function searchAgents(searchTerm?: string, location?: string): Promise<LicensedAgent[]> {
  try {
    let query: FirebaseFirestore.Query = adminDb.collection(AGENTS_COLLECTION);

    if (location) {
      query = query.where('location', '==', location);
    }

    const snap = await query.limit(50).get();
    let agents = snap.docs.map(d => d.data() as LicensedAgent);

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
  return ['Beitbridge', 'Harare', 'Mutare', 'Norton', 'Karoi', 'Bulawayo', 'Chirundu', 'Plumtree', 'Victoria Falls'];
}

export function getAgentServiceTypes(): string[] {
  return ['clearing', 'freight', 'customs', 'shipping', 'logistics', 'trading', 'investment', 'international'];
}
