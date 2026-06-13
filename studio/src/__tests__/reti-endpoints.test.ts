import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/services/reti-monitor', () => ({
  checkForThreatEvents: vi.fn(),
  initializeMonitorSources: vi.fn(),
}));

vi.mock('@/ai/flows/generate-threat-assessment', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    generateThreatAssessment: vi.fn(),
  };
});

import { POST as ScanPOST, GET as ScanGET } from '@/app/api/reti/scan/route';
import { POST as GenPOST, GET as GenGET } from '@/app/api/reti/generate/route';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { checkForThreatEvents, initializeMonitorSources } from '@/services/reti-monitor';
import { generateThreatAssessment } from '@/ai/flows/generate-threat-assessment';

function mockFirestoreSnapshot(docs: { id: string; data: () => Record<string, unknown> }[]) {
  return { docs, empty: docs.length === 0, size: docs.length };
}

function mockFirestoreGet<T>(value: T) {
  return vi.fn().mockResolvedValue(value as T);
}

const mockHolon = {
  holon_type: 'threat_assessment_page',
  metadata: {
    target_keyword: 'PRAZ procurement threshold compliance',
    trigger_event: 'PRAZ Updates Threshold for SMEs',
    trigger_source: 'PRAZ Zimbabwe',
    generated_at: '2026-06-13T12:00:00.000Z',
    risk_level: 'high',
  },
  hero_section: {
    h1_headline: 'Is Your SME Ready for New PRAZ Procurement Thresholds?',
    sub_headline: 'Stop losing tenders on technicalities.',
  },
  diagnostic_widget: {
    widget_title: 'PRAZ Compliance Stress-Tester',
    prompt_text: 'Describe your current document workflow.',
    underlying_radbit_solution: 'Tender Intelligence Suite',
  },
  market_reality_copy: {
    paragraph_1: 'New PRAZ thresholds mean manual processes are a disqualification risk.',
    paragraph_2: 'Radbit automatically monitors your compliance surface.',
  },
  pillar_mapping: {
    primary_pillar: 'simbare_engine' as const,
    secondary_pillar: 'executive_multiplier' as const,
    armor_layer: 'Tender Intelligence Suite',
  },
};

describe('POST /api/reti/scan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns assessmentsGenerated count on success', async () => {
    vi.mocked(initializeMonitorSources).mockResolvedValue([]);
    vi.mocked(checkForThreatEvents).mockResolvedValue(3);

    const response = await ScanPOST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, assessmentsGenerated: 3 });
    expect(initializeMonitorSources).toHaveBeenCalledOnce();
    expect(checkForThreatEvents).toHaveBeenCalledOnce();
  });

  it('returns zero when no threats detected', async () => {
    vi.mocked(initializeMonitorSources).mockResolvedValue([]);
    vi.mocked(checkForThreatEvents).mockResolvedValue(0);

    const response = await ScanPOST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, assessmentsGenerated: 0 });
  });

  it('returns 500 when checkForThreatEvents throws', async () => {
    vi.mocked(initializeMonitorSources).mockResolvedValue([]);
    vi.mocked(checkForThreatEvents).mockRejectedValue(new Error('RSS fetch failed'));

    const response = await ScanPOST();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('RSS fetch failed');
  });
});

describe('GET /api/reti/scan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns list of monitor sources', async () => {
    const mockDocs = [
      { id: 'src-1', data: () => ({ name: 'PRAZ Zimbabwe', category: 'praz', active: true, lastChecked: null }) },
      { id: 'src-2', data: () => ({ name: 'ZIMRA Updates', category: 'zimra', active: true, lastChecked: null }) },
    ];
    const mockCollection = vi.fn().mockReturnValue({ get: mockFirestoreGet(mockFirestoreSnapshot(mockDocs)) });
    vi.mocked(adminDb.collection).mockReturnValue(mockCollection() as never);

    const response = await ScanGET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sources).toHaveLength(2);
    expect(body.sources[0].name).toBe('PRAZ Zimbabwe');
    expect(body.sources[1].name).toBe('ZIMRA Updates');
  });

  it('returns empty array when no sources exist', async () => {
    const mockCollection = vi.fn().mockReturnValue({ get: mockFirestoreGet(mockFirestoreSnapshot([])) });
    vi.mocked(adminDb.collection).mockReturnValue(mockCollection() as never);

    const response = await ScanGET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sources).toEqual([]);
  });

  it('returns 500 on Firestore error', async () => {
    const mockCollection = vi.fn().mockReturnValue({ get: vi.fn().mockRejectedValue(new Error('connection refused')) });
    vi.mocked(adminDb.collection).mockReturnValue(mockCollection() as never);

    const response = await ScanGET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('connection refused');
  });
});

describe('POST /api/reti/generate', () => {
  const validInput = {
    triggerTitle: 'PRAZ Updates Threshold for SMEs',
    triggerSummary: 'PRAZ has updated the procurement threshold for SMEs from ZWL 50k to ZWL 200k.',
    triggerSource: 'PRAZ Zimbabwe',
    triggerDate: '2026-06-13',
    triggerCategory: 'praz' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates and stores threat assessment on valid input', async () => {
    vi.mocked(generateThreatAssessment).mockResolvedValue({ holon: mockHolon });
    const mockSet = vi.fn().mockResolvedValue(undefined as never);
    const mockDoc = vi.fn().mockReturnValue({ set: mockSet } as never);
    const mockCollection = vi.fn().mockReturnValue({ doc: mockDoc } as never);
    vi.mocked(adminDb.collection).mockReturnValue(mockCollection() as never);

    const req = new NextRequest('http://localhost/api/reti/generate', {
      method: 'POST',
      body: JSON.stringify(validInput),
    });
    const response = await GenPOST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.slug).toBe('praz-updates-threshold-for-smes');
    expect(body.holon).toEqual(mockHolon);
    expect(body.url).toBe('/threats/praz-updates-threshold-for-smes');
    expect(generateThreatAssessment).toHaveBeenCalledWith(validInput);
  });

  it('handles ampersands in titles', async () => {
    vi.mocked(generateThreatAssessment).mockResolvedValue({ holon: mockHolon });
    const mockSet = vi.fn().mockResolvedValue(undefined as never);
    vi.mocked(adminDb.collection).mockReturnValue({ doc: vi.fn().mockReturnValue({ set: mockSet }) } as never);

    const req = new NextRequest('http://localhost/api/reti/generate', {
      method: 'POST',
      body: JSON.stringify({
        ...validInput,
        triggerTitle: 'SADC Digital Transformation & AI Strategy 2026',
      }),
    });
    const response = await GenPOST(req);
    const body = await response.json();

    expect(body.slug).toBe('sadc-digital-transformation-ai-strategy-2026');
  });

  it('returns 400 when required field is missing', async () => {
    const req = new NextRequest('http://localhost/api/reti/generate', {
      method: 'POST',
      body: JSON.stringify({ triggerTitle: '' }),
    });
    const response = await GenPOST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid input');
    expect(body.details).toBeDefined();
  });

  it('returns 400 when triggerCategory is invalid', async () => {
    const req = new NextRequest('http://localhost/api/reti/generate', {
      method: 'POST',
      body: JSON.stringify({ ...validInput, triggerCategory: 'invalid-category' }),
    });
    const response = await GenPOST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid input');
  });

  it('returns 400 on malformed JSON body', async () => {
    const req = new NextRequest('http://localhost/api/reti/generate', {
      method: 'POST',
      body: '{invalid json',
    });
    const response = await GenPOST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBeDefined();
  });

  it('returns 500 when AI generation fails', async () => {
    vi.mocked(generateThreatAssessment).mockRejectedValue(new Error('AI service unavailable'));
    const mockSet = vi.fn().mockResolvedValue(undefined as never);
    vi.mocked(adminDb.collection).mockReturnValue({ doc: vi.fn().mockReturnValue({ set: mockSet }) } as never);

    const req = new NextRequest('http://localhost/api/reti/generate', {
      method: 'POST',
      body: JSON.stringify(validInput),
    });
    const response = await GenPOST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('AI service unavailable');
  });

  it('returns 500 when Firestore write fails', async () => {
    vi.mocked(generateThreatAssessment).mockResolvedValue({ holon: mockHolon });
    const mockSet = vi.fn().mockRejectedValue(new Error('permission denied') as never);
    vi.mocked(adminDb.collection).mockReturnValue({ doc: vi.fn().mockReturnValue({ set: mockSet }) } as never);

    const req = new NextRequest('http://localhost/api/reti/generate', {
      method: 'POST',
      body: JSON.stringify(validInput),
    });
    const response = await GenPOST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('permission denied');
  });
});

describe('GET /api/reti/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockAssessmentCollection(docs: { id: string; data: () => Record<string, unknown> }[]) {
    const snap = mockFirestoreSnapshot(docs);
    const mockGet = vi.fn().mockResolvedValue(snap);
    const chainable = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      get: mockGet,
    } as never;
    return chainable;
  }

  it('returns list of threat assessments', async () => {
    const chain = mockAssessmentCollection([
      {
        id: 'praz-new-threshold',
        data: () => ({
          triggerEvent: 'PRAZ New Threshold',
          triggerSource: 'PRAZ Zimbabwe',
          riskLevel: 'high',
          generatedAt: { toDate: () => new Date('2026-06-13') },
          viewCount: 5,
        }),
      },
      {
        id: 'sadc-digital-rules',
        data: () => ({
          triggerEvent: 'SADC Digital Rules',
          triggerSource: 'SADC Secretariat',
          riskLevel: 'medium',
          generatedAt: { toDate: () => new Date('2026-06-12') },
          viewCount: 0,
        }),
      },
    ]);
    vi.mocked(adminDb.collection).mockReturnValue(chain);

    const response = await GenGET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.assessments).toHaveLength(2);
    expect(body.assessments[0].triggerEvent).toBe('PRAZ New Threshold');
    expect(body.assessments[1].triggerSource).toBe('SADC Secretariat');
  });

  it('returns empty array when no assessments exist', async () => {
    const chain = mockAssessmentCollection([]);
    vi.mocked(adminDb.collection).mockReturnValue(chain);

    const response = await GenGET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.assessments).toEqual([]);
  });

  it('returns 500 on Firestore error', async () => {
    const mockGet = vi.fn().mockRejectedValue(new Error('unauthenticated'));
    const chain = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      get: mockGet,
    } as never;
    vi.mocked(adminDb.collection).mockReturnValue(chain);

    const response = await GenGET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('unauthenticated');
  });
});
