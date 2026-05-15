import { db } from '@/lib/firebase/firebase';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';

export interface InvoiceData {
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  description: string;
  country: string;
  paymentProviderRef?: string;
  paidAt?: Date;
  dueAt?: Date;
}

export class InvoiceService {
  async generateInvoice(data: InvoiceData): Promise<string> {
    const invoiceRef = doc(collection(db, 'invoices'));
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const dueAt = data.dueAt || new Date(Date.now() + 7 * 86400000);

    const invoice = {
      invoiceNumber,
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      status: data.paidAt ? 'paid' : 'pending',
      paidAt: data.paidAt || null,
      dueAt,
      country: data.country,
      providerRef: data.paymentProviderRef || null,
      billingAddress: null,
      // ZIMRA fields
      vatRate: data.country === 'ZW' ? 0.15 : 0,
      vatAmount: data.country === 'ZW' ? data.amount * 0.15 / 1.15 : 0,
      taxExclusiveAmount: data.country === 'ZW' ? data.amount / 1.15 : data.amount,
      created: serverTimestamp(),
    };

    await setDoc(invoiceRef, invoice);
    return invoiceNumber;
  }

  generateInvoiceHtml(invoice: { invoiceNumber: string; amount: number; currency: string; description: string; paidAt?: Date; dueAt?: Date }): string {
    const paidDate = invoice.paidAt ? invoice.paidAt.toLocaleDateString('en-ZW') : '—';
    const dueDate = invoice.dueAt ? invoice.dueAt.toLocaleDateString('en-ZW') : '—';
    const vatExcl = (invoice.amount / 1.15).toFixed(2);
    const vat = (invoice.amount - invoice.amount / 1.15).toFixed(2);
    const status = invoice.paidAt ? 'Paid' : 'Pending';

    return `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #33D6C2;">Radbit SME Hub</h2>
        <h3>Tax Invoice</h3>
        <hr/>
        <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-ZW')}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p><strong>Paid Date:</strong> ${paidDate}</p>
        <hr/>
        <p><strong>Description:</strong> ${invoice.description}</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f5f5f5;"><th style="padding: 8px; text-align: left;">Item</th><th style="padding: 8px; text-align: right;">Amount</th></tr>
          <tr><td style="padding: 8px;">${invoice.description}</td><td style="padding: 8px; text-align: right;">${vatExcl} ${invoice.currency}</td></tr>
          <tr><td style="padding: 8px;">VAT (15%)</td><td style="padding: 8px; text-align: right;">${vat} ${invoice.currency}</td></tr>
          <tr style="font-weight: bold;"><td style="padding: 8px;">Total</td><td style="padding: 8px; text-align: right;">${invoice.amount.toFixed(2)} ${invoice.currency}</td></tr>
        </table>
        <p style="color: gray; font-size: 12px;">ZIMRA Registration: 0000000 | VAT Number: ZV-0000000</p>
      </div>
    `;
  }
}
