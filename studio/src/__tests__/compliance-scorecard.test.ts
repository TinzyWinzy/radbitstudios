import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getPrazProfile } from '@/services/praz-compliance';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { calculateComplianceScore } from '@/services/compliance-scorecard';

vi.mock('@/services/praz-compliance', () => ({
  getPrazProfile: vi.fn(),
}));

vi.mock('@/services/zimra-fiscal', () => ({
  getFiscalComplianceStatus: vi.fn().mockResolvedValue({ status: 'not_registered' }),
}));

const collectionStore = new Map<string, any[]>();

function setCollectionData(name: string, docs: any[]) {
  collectionStore.set(name, docs);
}

function makeQuerySnapshot(docs: any[]) {
  const empty = docs.length === 0;
  return {
    empty,
    size: docs.length,
    docs: docs.map(d => ({ data: () => d, exists: true, id: 'mock-id' })),
    forEach(cb: (doc: any) => void) {
      docs.forEach(d => cb({ data: () => d, exists: true, id: 'mock-id' }));
    },
  };
}

function setupMockDb() {
  const mockCollection = vi.fn().mockImplementation((name: string) => {
    const filters: Array<{ field: string; op: string; value: unknown }> = [];

    const queryRef: any = {
      where: vi.fn().mockImplementation((field: string, op: string, value: unknown) => {
        filters.push({ field, op, value });
        return queryRef;
      }),
      orderBy: vi.fn().mockImplementation(() => queryRef),
      limit: vi.fn().mockImplementation(() => queryRef),
      get: vi.fn().mockImplementation(() => {
        let docs = collectionStore.get(name) || [];
        for (const f of filters) {
          if (f.field === 'type') docs = docs.filter((d: any) => d.type === f.value);
          if (f.field === 'userId') docs = docs.filter((d: any) => d.userId === f.value);
          if (f.field === 'status') docs = docs.filter((d: any) => d.status === f.value);
        }
        return Promise.resolve(makeQuerySnapshot(docs));
      }),
    };

    const docRef = {
      get: vi.fn().mockResolvedValue({ exists: name !== 'compliance_scorecards', data: () => ({ businessName: 'Test Business' }) }),
      set: vi.fn().mockResolvedValue(undefined),
    };

    return {
      where: vi.fn().mockReturnValue(queryRef),
      orderBy: vi.fn().mockReturnValue(queryRef),
      limit: vi.fn().mockReturnValue(queryRef),
      doc: vi.fn().mockReturnValue(docRef),
      get: vi.fn().mockResolvedValue(makeQuerySnapshot([])),
      add: vi.fn().mockResolvedValue({ id: 'mock-id' }),
    };
  });

  (adminDb.collection as unknown as Mock).mockImplementation(mockCollection);
}

beforeEach(() => {
  vi.clearAllMocks();
  collectionStore.clear();
  setupMockDb();
});

describe('calculateComplianceScore', () => {
  it('scores correctly with valid PRAZ, tax, and NSSA', async () => {
    setCollectionData('users', [{ businessName: 'Acme Pvt Ltd' }]);
    (getPrazProfile as unknown as Mock).mockResolvedValue({
      readinessScore: 100,
      documents: {
        cert_incorporation: { status: 'valid' },
        cr14: { status: 'valid' },
        cr6: { status: 'valid' },
        itf263: { status: 'valid' },
        nssa: { status: 'valid' },
        business_license: { status: 'valid' },
        proof_residence: { status: 'valid' },
      },
    });
    setCollectionData('compliance_certificates', [
      { userId: 'user1', type: 'zimra_tax_clearance', status: 'valid', expiryDate: new Date('2027-12-31') },
      { userId: 'user1', type: 'nssa', status: 'valid', expiryDate: new Date('2027-12-31') },
    ]);
    setCollectionData('scraped_items', []);

    const result = await calculateComplianceScore('user1');

    expect(result.breakdown.praz_registration.score).toBe(100);
    expect(result.breakdown.tax_clearance.score).toBe(100);
    expect(result.breakdown.nssa_compliance.score).toBe(100);
    expect(result.overallScore).toBe(40);
    expect(result.status).toBe('red');
  });

  it('scores NSSA separately from tax clearance', async () => {
    setCollectionData('users', [{ businessName: 'Acme' }]);
    (getPrazProfile as unknown as Mock).mockResolvedValue({ readinessScore: 0, documents: {} });
    setCollectionData('compliance_certificates', [
      { userId: 'user1', type: 'zimra_tax_clearance', status: 'expired', expiryDate: new Date('2025-01-01') },
      { userId: 'user1', type: 'nssa', status: 'valid', expiryDate: new Date('2027-12-31') },
    ]);
    setCollectionData('scraped_items', []);

    const result = await calculateComplianceScore('user1');

    expect(result.breakdown.tax_clearance.status).toBe('non_compliant');
    expect(result.breakdown.tax_clearance.score).toBe(0);
    expect(result.breakdown.nssa_compliance.status).toBe('compliant');
    expect(result.breakdown.nssa_compliance.score).toBe(100);
  });

  it('scores PRAZ readiness proportionally', async () => {
    setCollectionData('users', [{ businessName: 'Acme' }]);
    (getPrazProfile as unknown as Mock).mockResolvedValue({
      readinessScore: 75,
      documents: {
        cert_incorporation: { status: 'valid' },
        cr14: { status: 'valid' },
        cr6: { status: 'valid' },
        itf263: { status: 'valid' },
        nssa: null,
        business_license: null,
        proof_residence: null,
      },
    });
    setCollectionData('compliance_certificates', []);
    setCollectionData('scraped_items', []);

    const result = await calculateComplianceScore('user1');
    expect(result.breakdown.praz_registration.score).toBe(75);
    expect(result.breakdown.praz_registration.status).toBe('partial');
  });

  it('returns non_compliant for expired certificates', async () => {
    setCollectionData('users', [{ businessName: 'Acme' }]);
    (getPrazProfile as unknown as Mock).mockResolvedValue({ readinessScore: 0, documents: {} });
    setCollectionData('compliance_certificates', [
      { userId: 'user1', type: 'zimra_tax_clearance', status: 'expired', expiryDate: new Date('2025-01-01') },
    ]);
    setCollectionData('scraped_items', []);

    const result = await calculateComplianceScore('user1');
    expect(result.breakdown.tax_clearance.status).toBe('non_compliant');
    expect(result.breakdown.tax_clearance.score).toBe(0);
  });

  it('returns expiring certificates as partial', async () => {
    setCollectionData('users', [{ businessName: 'Acme' }]);
    (getPrazProfile as unknown as Mock).mockResolvedValue({ readinessScore: 0, documents: {} });
    setCollectionData('compliance_certificates', [
      { userId: 'user1', type: 'zimra_tax_clearance', status: 'expiring', expiryDate: new Date('2026-07-15') },
    ]);
    setCollectionData('scraped_items', []);

    const result = await calculateComplianceScore('user1');
    expect(result.breakdown.tax_clearance.status).toBe('partial');
    expect(result.breakdown.tax_clearance.score).toBe(60);
  });

  it('marks not_tracked checks with score 0', async () => {
    setCollectionData('users', [{ businessName: 'Acme' }]);
    (getPrazProfile as unknown as Mock).mockResolvedValue({ readinessScore: 0, documents: {} });
    setCollectionData('compliance_certificates', []);
    setCollectionData('scraped_items', []);

    const result = await calculateComplianceScore('user1');

    expect(result.breakdown.paye_remittance.status).toBe('not_tracked');
    expect(result.breakdown.paye_remittance.score).toBe(0);
    expect(result.breakdown.saz_iso.status).toBe('not_tracked');
    expect(result.breakdown.litigation.status).toBe('not_tracked');
    expect(result.breakdown.blacklist_status.status).toBe('not_tracked');
    expect(result.breakdown.banking_history.status).toBe('not_tracked');
  });

  it('returns red for low scores', async () => {
    setCollectionData('users', [{ businessName: 'Fail Co' }]);
    (getPrazProfile as unknown as Mock).mockResolvedValue({ readinessScore: 0, documents: {} });
    setCollectionData('compliance_certificates', []);
    setCollectionData('scraped_items', []);

    const result = await calculateComplianceScore('user1');
    expect(result.status).toBe('red');
    expect(result.overallScore).toBeLessThan(60);
  });

  it('returns amber for mixed scores', async () => {
    setCollectionData('users', [{ businessName: 'Mixed Co' }]);
    (getPrazProfile as unknown as Mock).mockResolvedValue({
      readinessScore: 100,
      documents: {
        cert_incorporation: { status: 'valid' },
        cr14: { status: 'valid' },
        cr6: { status: 'valid' },
        itf263: { status: 'valid' },
        nssa: { status: 'valid' },
        business_license: { status: 'valid' },
        proof_residence: { status: 'valid' },
      },
    });
    setCollectionData('compliance_certificates', [
      { userId: 'user1', type: 'zimra_tax_clearance', status: 'valid', expiryDate: new Date('2027-12-31') },
      { userId: 'user1', type: 'nssa', status: 'valid', expiryDate: new Date('2027-12-31') },
    ]);
    setCollectionData('scraped_items', [
      { userId: 'user1', title: 'Road Construction Tender', status: 'won' },
      { userId: 'user1', title: 'IT Services Tender', status: 'won' },
      { userId: 'user1', title: 'Consultancy Tender', status: 'lost' },
    ]);

    const result = await calculateComplianceScore('user1');
    expect(result.breakdown.tender_track_record.score).toBe(67);
    expect(result.overallScore).toBeGreaterThanOrEqual(50);
    expect(result.overallScore).toBeLessThan(80);
  });

  it('includes all 10 breakdown checks', async () => {
    setCollectionData('users', [{ businessName: 'Acme' }]);
    (getPrazProfile as unknown as Mock).mockResolvedValue({ readinessScore: 0, documents: {} });
    setCollectionData('compliance_certificates', []);
    setCollectionData('scraped_items', []);

    const result = await calculateComplianceScore('user1');

    const checkKeys = Object.keys(result.breakdown);
    expect(checkKeys).toEqual([
      'praz_registration',
      'tax_clearance',
      'nssa_compliance',
      'paye_remittance',
      'saz_iso',
      'tender_track_record',
      'litigation',
      'blacklist_status',
      'banking_history',
      'zimra_fiscal_device',
    ]);
  });
});
