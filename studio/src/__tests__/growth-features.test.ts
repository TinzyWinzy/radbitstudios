import { describe, it, expect } from 'vitest';
import { classifyPrazTier, getPrazFee, formatPrazSavings, PRAZ_FEES } from '@/lib/praz-constants';
import { REQUIRED_DOCUMENTS } from '@/services/praz-compliance';
import { PROCURING_ENTITIES, getEntitiesByType, getEntityById } from '@/data/procuring-entities';
import { checkUpstashRateLimit } from '@/lib/upstash-ratelimit';
import { checkRateLimit } from '@/lib/scraper-cache';
import { enqueueOutboundMessage } from '@/services/whatsapp/outbound-queue';
import { sendWhatsAppTemplate } from '@/services/whatsapp/whatsapp-handler';

// ─── Task 1 & 2: PRAZ Fee Structure & Classification ──────────────────────

describe('PRAZ Constants', () => {
  it('has correct fee structure for Micro Enterprise', () => {
    expect(PRAZ_FEES.micro.usd).toBe(50);
    expect(PRAZ_FEES.micro.zig).toBe(1304);
    expect(PRAZ_FEES.micro.label).toBe('Micro Enterprise (ME)');
  });

  it('has correct fee structure for SME', () => {
    expect(PRAZ_FEES.sme.usd).toBe(60);
    expect(PRAZ_FEES.sme.zig).toBe(1564.80);
  });

  it('has correct fee structure for Other Entity', () => {
    expect(PRAZ_FEES.other.usd).toBe(75);
    expect(PRAZ_FEES.other.zig).toBe(1956);
  });
});

describe('classifyPrazTier', () => {
  it('classifies Micro Enterprise for low revenue, few staff, low assets', () => {
    expect(classifyPrazTier(25000, 3, 5000)).toBe('micro');
  });

  it('classifies SME for mid-range revenue', () => {
    expect(classifyPrazTier(250000, 25, 50000)).toBe('sme');
  });

  it('classifies Other for high revenue', () => {
    expect(classifyPrazTier(750000, 100, 250000)).toBe('other');
  });

  it('classifies as Other when any single metric exceeds SME threshold', () => {
    expect(classifyPrazTier(25000, 100, 5000)).toBe('other');
  });
});

describe('formatPrazSavings', () => {
  it('shows $95 savings for Micro Enterprise', () => {
    const result = formatPrazSavings('micro');
    expect(result.savedUsd).toBe(95);
    expect(result.message).toContain('$95');
  });

  it('shows $85 savings for SME', () => {
    const result = formatPrazSavings('sme');
    expect(result.savedUsd).toBe(85);
  });

  it('shows $70 savings for Other Entity', () => {
    const result = formatPrazSavings('other');
    expect(result.savedUsd).toBe(70);
  });
});

describe('getPrazFee', () => {
  it('returns correct fee object for each tier', () => {
    expect(getPrazFee('micro')).toEqual(PRAZ_FEES.micro);
    expect(getPrazFee('sme')).toEqual(PRAZ_FEES.sme);
    expect(getPrazFee('other')).toEqual(PRAZ_FEES.other);
  });
});

describe('REQUIRED_DOCUMENTS', () => {
  it('has 7 required documents', () => {
    expect(REQUIRED_DOCUMENTS.length).toBe(7);
  });

  it('includes all essential PRAZ documents', () => {
    const ids = REQUIRED_DOCUMENTS.map(d => d.id);
    expect(ids).toContain('cert_incorporation');
    expect(ids).toContain('cr14');
    expect(ids).toContain('cr6');
    expect(ids).toContain('itf263');
    expect(ids).toContain('nssa');
    expect(ids).toContain('business_license');
    expect(ids).toContain('proof_residence');
  });

  it('marks perpetual documents correctly', () => {
    const perpetualIds = ['cert_incorporation', 'cr14', 'cr6'];
    for (const doc of REQUIRED_DOCUMENTS) {
      if (perpetualIds.includes(doc.id)) {
        expect((doc as any).perpetual).toBe(true);
      }
    }
  });
});

// ─── Task 3: Entity Scrapers ──────────────────────────────────────────────

describe('PROCURING_ENTITIES', () => {
  it('has 20 entities across all types', () => {
    expect(PROCURING_ENTITIES.length).toBe(20);
  });

  it('includes all 7 municipalities', () => {
    const municipalities = getEntitiesByType('municipality');
    expect(municipalities.length).toBe(7);
    const names = municipalities.map(e => e.name);
    expect(names).toContain('City of Harare');
    expect(names).toContain('City of Bulawayo');
    expect(names).toContain('City of Gweru');
    expect(names).toContain('City of Kadoma');
    expect(names).toContain('City of Mutare');
    expect(names).toContain('Chitungwiza Municipality');
    expect(names).toContain('Chivi Rural District Council');
  });

  it('includes all 5 healthcare entities', () => {
    const healthcare = getEntitiesByType('healthcare');
    expect(healthcare.length).toBe(5);
  });

  it('includes all 5 state enterprises', () => {
    const enterprises = getEntitiesByType('state_enterprise');
    expect(enterprises.length).toBe(5);
  });

  it('includes all 3 mining entities', () => {
    const mining = getEntitiesByType('mining');
    expect(mining.length).toBe(3);
  });

  it('every entity has required fields', () => {
    for (const entity of PROCURING_ENTITIES) {
      expect(entity.id).toBeTruthy();
      expect(entity.name).toBeTruthy();
      expect(entity.type).toBeTruthy();
      expect(entity.active).toBe(true);
      expect(['rss', 'html', 'pdf', 'praz_feed']).toContain(entity.scraperMethod);
    }
  });

  it('looks up entity by id', () => {
    const entity = getEntityById('city_harare');
    expect(entity).toBeDefined();
    expect(entity?.name).toBe('City of Harare');
  });

  it('returns undefined for unknown id', () => {
    expect(getEntityById('nonexistent')).toBeUndefined();
  });
});

// ─── Task 4: Rate Limiting ────────────────────────────────────────────────

describe('checkUpstashRateLimit', () => {
  it('returns allowed when Upstash is not configured', async () => {
    const result = await checkUpstashRateLimit('test-key');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(999);
  });
});

describe('scraper-cache checkRateLimit', () => {
  it('returns rate limit result structure', async () => {
    const result = await checkRateLimit('test-scraper', 'default');
    expect(result).toHaveProperty('allowed');
    expect(result).toHaveProperty('remaining');
    expect(result).toHaveProperty('resetIn');
  });
});

// ─── Task 5: WhatsApp Outbound Queue ──────────────────────────────────────

describe('enqueueOutboundMessage', () => {
  it('rejects without Firestore emulator', async () => {
    // Without a running Firestore emulator, adminDb calls will throw
    await expect(enqueueOutboundMessage('user1', '+263700000000', 'assessment_results_ready', { name: 'Test' }, 0))
      .rejects.toThrow();
  });
});

describe('sendWhatsAppTemplate', () => {
  it('returns false without env vars', async () => {
    const result = await sendWhatsAppTemplate('+263700000000', 'assessment_results_ready', { name: 'Test' });
    expect(result).toBe(false);
  });
});

// ─── Structure verification ───────────────────────────────────────────────

describe('New Route Structure', () => {
  it('has solution pages directory structure', () => {
    const fs = require('fs');
    const path = require('path');
    const solutionsDir = path.join(process.cwd(), 'src/app/[locale]/(marketing)/solutions');
    expect(fs.existsSync(path.join(solutionsDir, 'logistics-pharmacies/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(solutionsDir, 'agri-tech-manufacturing/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(solutionsDir, 'hospitality-studios/page.tsx'))).toBe(true);
  });

  it('has partner pages directory structure', () => {
    const fs = require('fs');
    const path = require('path');
    const partnersDir = path.join(process.cwd(), 'src/app/[locale]/(marketing)/partners');
    expect(fs.existsSync(path.join(partnersDir, 'techhub-harare/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(partnersDir, 'impact-hub/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(partnersDir, 'moto-republik/page.tsx'))).toBe(true);
  });

  it('has events and diaspora pages', () => {
    const fs = require('fs');
    const path = require('path');
    const marketingDir = path.join(process.cwd(), 'src/app/[locale]/(marketing)');
    expect(fs.existsSync(path.join(marketingDir, 'events/zimbabwe-business-expo-2026/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(marketingDir, 'diaspora-matchmaking/page.tsx'))).toBe(true);
  });
});
