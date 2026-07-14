import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockConnect = vi.fn();
const mockCreateProject = vi.fn();
const mockGenerateChecklist = vi.fn();
const mockValidateBody = vi.fn();
const mockAdminAdd = vi.fn();
const mockGetDocs = vi.fn();
const mockSendEmail = vi.fn();
const mockSendWhatsAppMessage = vi.fn();

vi.mock('@/services/api-rate-limit', () => ({
  withIpRateLimit: (_config: unknown, handler: (req: NextRequest) => Promise<Response>) => handler,
}));

vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(() => ({
    connect: mockConnect,
    on: vi.fn(),
  })),
}));

vi.mock('@/services/project-service-admin', () => ({
  createProject: mockCreateProject,
}));

vi.mock('@/services/onboarding-engine', () => ({
  generateOnboardingChecklist: mockGenerateChecklist,
}));

vi.mock('@/lib/firebase/firebase-admin', () => ({
  adminDb: {
    collection: vi.fn(() => ({
      add: mockAdminAdd,
    })),
  },
}));

vi.mock('@/lib/firebase/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  getDocs: mockGetDocs,
}));

vi.mock('@/services/email-service', () => ({
  sendEmail: mockSendEmail,
}));

vi.mock('@/services/whatsapp/whatsapp-handler', () => ({
  sendWhatsAppMessage: mockSendWhatsAppMessage,
}));

vi.mock('@/lib/api-validation', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-validation')>('@/lib/api-validation');
  return {
    ...actual,
    validateBody: mockValidateBody,
  };
});

describe('leads API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnect.mockRejectedValue(new Error('getaddrinfo ENOTFOUND db.example.supabase.co'));
    mockAdminAdd.mockResolvedValue({ id: 'lead-123' });
    mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
    mockSendEmail.mockResolvedValue(undefined);
    mockSendWhatsAppMessage.mockResolvedValue(undefined);
    mockCreateProject.mockResolvedValue('project-123');
    mockGenerateChecklist.mockResolvedValue(undefined);
    mockValidateBody.mockResolvedValue({
      success: true,
      data: {
        fullName: 'Ada Lovelace',
        workEmail: 'ada@example.com',
        companyName: 'Radbit',
        industry: 'technology',
        serviceInterest: 'ai',
        budgetRange: '500-2000',
        message: 'Interested in a demo',
        referralSource: 'website',
        audience: 'my-business',
        need: 'automation',
        budget: '500-2000',
      },
    });
  });

  it('returns success when Postgres is unavailable', async () => {
    const { POST } = await import('@/app/api/leads/route');
    const req = new NextRequest('http://localhost/api/leads', { method: 'POST' });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.projectId).toBe('project-123');
  });
});
