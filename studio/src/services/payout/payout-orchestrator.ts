import type { PayoutProvider, PayoutProviderName } from './providers/payout-provider.interface';
import { EcoCashPayoutProvider } from './providers/ecocash-payout.provider';
import { InnBucksPayoutProvider } from './providers/innbucks-payout.provider';
import { payoutService } from '@/services/payout.service';
import { partnerService } from '@/services/partner.service';

const providers: Record<PayoutProviderName, PayoutProvider> = {
  ecocash: new EcoCashPayoutProvider(),
  innbucks: new InnBucksPayoutProvider(),
};

export class PayoutOrchestrator {
  /**
   * Process a single pending payout by sending money through the appropriate provider.
   */
  async processPayout(payoutId: string): Promise<{ success: boolean; error?: string }> {
    const payout = await payoutService.getById(payoutId);
    if (!payout) return { success: false, error: 'Payout not found' };
    if (payout.status !== 'pending') return { success: false, error: `Payout is ${payout.status}, not pending` };

    const partner = await partnerService.getById(payout.partnerId);
    if (!partner) return { success: false, error: 'Partner not found' };

    // Map payout method to provider
    const providerName = this.methodToProvider(payout.method);
    if (!providerName) return { success: false, error: `Unsupported payout method: ${payout.method}` };

    const provider = providers[providerName];

    // Determine recipient from partner data
    const recipient = this.getRecipient(partner, payout.method);
    if (!recipient) return { success: false, error: `Missing recipient details for ${payout.method} payout` };

    await payoutService.updateStatus(payoutId, 'processing');

    const result = await provider.sendPayout({
      amount: payout.amount,
      currency: 'USD',
      recipient,
      reference: `RBT-PO-${payoutId.slice(0, 8)}`,
      description: `Partner commission payout — ${partner.name}`,
    });

    if (result.success) {
      await payoutService.updateStatus(payoutId, 'sent', result.providerRef);
      return { success: true };
    } else {
      await payoutService.updateStatus(payoutId, 'failed', result.providerRef);
      return { success: false, error: result.errorMessage };
    }
  }

  /**
   * Process all pending payouts. Returns results summary.
   */
  async processAllPending(): Promise<{ processed: number; succeeded: number; failed: number; errors: string[] }> {
    const pending = await payoutService.getPending();
    let succeeded = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const payout of pending) {
      if (!payout.id) continue;
      const result = await this.processPayout(payout.id);
      if (result.success) {
        succeeded++;
      } else {
        failed++;
        errors.push(`Payout ${payout.id}: ${result.error}`);
      }
    }

    return { processed: pending.length, succeeded, failed, errors };
  }

  private methodToProvider(method: string): PayoutProviderName | null {
    switch (method) {
      case 'ecocash': return 'ecocash';
      case 'bank':
      case 'crypto':
        // Bank and crypto routed through InnBucks if they support it
        return 'innbucks';
      default:
        return null;
    }
  }

  private getRecipient(partner: { phone?: string; email?: string; name?: string }, method: string): string | null {
    switch (method) {
      case 'ecocash':
        return partner.phone || null;
      case 'bank':
      case 'crypto':
        return partner.phone || partner.email || null;
      default:
        return null;
    }
  }
}

export const payoutOrchestrator = new PayoutOrchestrator();
