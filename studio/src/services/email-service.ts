import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = 'Radbit <hello@radbitstudios.co.zw>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://radbitstudios.co.zw';
const BRAND = '#1A8A7A';

function wrapper(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0a0a0a;color:#e5e0d8;margin:0;padding:40px 20px"><div style="max-width:480px;margin:0 auto;background:#111;border-radius:12px;padding:32px;border:1px solid #333"><div style="text-align:center;margin-bottom:24px"><h1 style="color:${BRAND};margin:0;font-size:20px">Radbit</h1></div>${content}<div style="margin-top:32px;padding-top:16px;border-top:1px solid #333;text-align:center"><p style="color:#666;font-size:12px;margin:0">Radbit — AI tools for Zimbabwean enterprises</p><p style="color:#555;font-size:11px;margin:4px 0 0">Harare, Zimbabwe</p></div></div></body></html>`;
}

export function welcomeEmail(userName: string): { subject: string; html: string } {
  return {
    subject: `${userName}, welcome to Radbit`,
    html: wrapper(`
      <h2 style="color:#fff;margin:0 0 8px">Welcome, ${userName}!</h2>
      <p style="color:#aaa;line-height:1.6;margin:0 0 16px">Your account is ready. Start with your free digital readiness assessment — it takes 5 minutes and gives you a personalized AI report on your business.</p>
      <a href="${FRONTEND_URL}/assessment" style="display:inline-block;background:${BRAND};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:8px 0 24px">Start Your Free Assessment</a>
      <p style="color:#aaa;line-height:1.6;margin:0">Need more? Upgrade to <strong>Growth ($5/mo)</strong> for unlimited tenders, AI insights, and 10x more credits.</p>
      <a href="${FRONTEND_URL}/pricing" style="color:${BRAND};text-decoration:underline">See all plans →</a>
    `),
  };
}

export function paymentConfirmationEmail(userName: string, plan: string, price: number): { subject: string; html: string } {
  return {
    subject: `Payment confirmed — Your ${plan} plan is active`,
    html: wrapper(`
      <h2 style="color:#fff;margin:0 0 8px">Payment confirmed, ${userName}!</h2>
      <p style="color:#aaa;line-height:1.6;margin:0 0 16px">Your <strong style="color:#fff">${plan}</strong> plan is now active at <strong style="color:#fff">$${price}/mo</strong>.</p>
      <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin:0 0 16px">
        <p style="color:#4ade80;font-weight:600;margin:0">All features unlocked</p>
        <p style="color:#4ade80;font-weight:600;margin:4px 0 0">Credits reset monthly</p>
      </div>
      <a href="${FRONTEND_URL}/dashboard" style="display:inline-block;background:${BRAND};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Go to Dashboard</a>
    `),
  };
}

export function usageWarningEmail(userName: string, feature: string, remaining: number): { subject: string; html: string } {
  return {
    subject: `Only ${remaining} ${feature} credits left`,
    html: wrapper(`
      <h2 style="color:#fff;margin:0 0 8px">Running low, ${userName}</h2>
      <p style="color:#aaa;line-height:1.6;margin:0 0 16px">You have <strong style="color:#f59e0b">only ${remaining} ${feature} ${remaining === 1 ? 'credit' : 'credits'}</strong> remaining. Upgrade to keep using the AI tools without interruption.</p>
      <a href="${FRONTEND_URL}/settings?tab=account" style="display:inline-block;background:${BRAND};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:8px 0 24px">Upgrade Now</a>
      <p style="color:#666;font-size:12px;margin:0">Credits reset on the 1st of each month. Upgrade for higher limits.</p>
    `),
  };
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!resend || !to) return;
  try {
    await resend.emails.send({ from: FROM, to: [to], subject, html });
  } catch (err) {
    console.error('[EmailService] Failed:', err);
  }
}
