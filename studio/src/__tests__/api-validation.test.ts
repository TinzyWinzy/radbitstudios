import { describe, it, expect } from 'vitest';
import {
  CreateLeadSchema,
  AiStreamSchema,
  PaymentActionSchema,
  SetRoleSchema,
  AnalyticsTrackSchema,
  RefreshSessionSchema,
  PrazDocumentSchema,
} from '@/lib/api-validation';

describe('API Validation Schemas', () => {
  describe('CreateLeadSchema', () => {
    it('should accept valid lead data', () => {
      const result = CreateLeadSchema.safeParse({
        fullName: 'John Doe',
        workEmail: 'john@example.com',
        companyName: 'Acme Corp',
        industry: 'Technology',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing fullName', () => {
      const result = CreateLeadSchema.safeParse({
        workEmail: 'john@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = CreateLeadSchema.safeParse({
        fullName: 'John',
        workEmail: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const result = CreateLeadSchema.safeParse({
        fullName: 'John',
        workEmail: 'john@example.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('AiStreamSchema', () => {
    it('should accept valid AI request', () => {
      const result = AiStreamSchema.safeParse({
        prompt: 'Hello world',
        model: 'gemini-2.5-flash',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty prompt', () => {
      const result = AiStreamSchema.safeParse({ prompt: '' });
      expect(result.success).toBe(false);
    });

    it('should reject prompt exceeding max length', () => {
      const result = AiStreamSchema.safeParse({
        prompt: 'a'.repeat(32001),
      });
      expect(result.success).toBe(false);
    });

    it('should apply default model', () => {
      const result = AiStreamSchema.safeParse({ prompt: 'test' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.model).toBe('gemini-2.5-flash');
      }
    });
  });

  describe('PaymentActionSchema', () => {
    it('should accept create-subscription action', () => {
      const result = PaymentActionSchema.safeParse({
        action: 'create-subscription',
        plan: 'growth',
        billingPeriod: 'monthly',
        country: 'ZW',
        currency: 'USD',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid plan', () => {
      const result = PaymentActionSchema.safeParse({
        action: 'create-subscription',
        plan: 'Free',
        billingPeriod: 'monthly',
        country: 'ZW',
        currency: 'USD',
      });
      expect(result.success).toBe(false);
    });

    it('should accept cancel-subscription action', () => {
      const result = PaymentActionSchema.safeParse({
        action: 'cancel-subscription',
        subscriptionId: 'sub_123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject unknown action', () => {
      const result = PaymentActionSchema.safeParse({
        action: 'unknown',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('SetRoleSchema', () => {
    it('should accept valid role', () => {
      const result = SetRoleSchema.safeParse({
        uid: 'user123',
        role: 'admin',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const result = SetRoleSchema.safeParse({
        uid: 'user123',
        role: 'superuser',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('AnalyticsTrackSchema', () => {
    it('should accept valid event', () => {
      const result = AnalyticsTrackSchema.safeParse({
        event: 'page_view',
        path: '/dashboard',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing event', () => {
      const result = AnalyticsTrackSchema.safeParse({ path: '/dashboard' });
      expect(result.success).toBe(false);
    });
  });

  describe('RefreshSessionSchema', () => {
    it('should accept valid token', () => {
      const result = RefreshSessionSchema.safeParse({
        idToken: 'eyJhbGciOiJSUzI1NiJ9.test',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const result = RefreshSessionSchema.safeParse({ idToken: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('PrazDocumentSchema', () => {
    it('should accept valid document', () => {
      const result = PrazDocumentSchema.safeParse({
        docType: 'tax_clearance',
        fileName: 'tax.pdf',
        fileUrl: 'https://example.com/tax.pdf',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const result = PrazDocumentSchema.safeParse({
        docType: 'tax_clearance',
        fileName: 'tax.pdf',
        fileUrl: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });
  });
});
