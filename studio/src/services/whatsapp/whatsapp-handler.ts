import { getOrCreateSession, addExchange, linkSessionToUser, setActiveFlow } from './session-store';
import { AIGateway } from '@/services/ai/ai-gateway';
import { adminDb } from '@/lib/firebase/firebase-admin';

const gateway = new AIGateway();
const BASE_URL = 'https://graph.facebook.com/v21.0';

async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return false;

  try {
    const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('[WhatsApp] Send failed:', errText);
    }
    return res.ok;
  } catch (error) {
    console.error('[WhatsApp] Send error:', error);
    return false;
  }
}

function extractEmail(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

function isLinkingCommand(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return lower.startsWith('link') || lower.startsWith('connect') || lower.startsWith('account');
}

function isTenderSearch(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return lower.startsWith('search tender') || lower.startsWith('find tender') || lower.startsWith('tender');
}

function isTaxQuery(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return lower.startsWith('tax') || lower.startsWith('zimra') || lower.startsWith('vat');
}

export async function handleIncomingMessage(
  from: string,
  text: string,
  _displayPhoneNumber: string,
  _phoneNumberId: string,
): Promise<void> {
  const session = await getOrCreateSession(from);

  await addExchange(from, 'user', text);

  const lower = text.toLowerCase().trim();

  if (isLinkingCommand(lower)) {
    const email = extractEmail(text);
    if (email) {
      const userSnap = await adminDb.collection('users').where('email', '==', email).get();
      if (userSnap.empty) {
        await sendWhatsAppMessage(from, 'No account found with that email. Please sign up at https://radbitstudios.co.zw first, then try again.');
        await addExchange(from, 'assistant', 'No account found response');
        return;
      }

      const userId = userSnap.docs[0].id;
      await linkSessionToUser(from, userId);
      await adminDb.doc(`users/${userId}`).update({ phone: from, whatsappOptIn: true });
      await setActiveFlow(from, undefined);

      const welcomeMsg = '✅ Account linked! You can now ask me about:\n' +
        '• Business advice 📊\n' +
        '• Tender opportunities 🔍\n' +
        '• Tax / ZIMRA questions 💰\n' +
        '• Any SME-related question\n\n' +
        'Try: "What tenders are available for construction?" or "How do I register for VAT?"';
      await sendWhatsAppMessage(from, welcomeMsg);
      await addExchange(from, 'assistant', welcomeMsg);
    } else {
      await sendWhatsAppMessage(from, 'To link your account, send: Link account: your@email.com');
      await addExchange(from, 'assistant', 'Prompt for email');
    }
    return;
  }

  if (!session.userId) {
    await sendWhatsAppMessage(from,
      'Welcome to Radbit SME Hub! 🇿🇼\n\n' +
      'To get started, link your account:\n' +
      '  Link account: your@email.com\n\n' +
      'If you don\'t have an account yet, sign up at:\n' +
      'https://radbitstudios.co.zw'
    );
    await addExchange(from, 'assistant', 'Welcome - account linking prompt');
    return;
  }

  let flowType: string;
  if (isTenderSearch(lower)) {
    flowType = 'tender_search';
    await setActiveFlow(from, 'tender_search');
  } else if (isTaxQuery(lower)) {
    flowType = 'tax';
    await setActiveFlow(from, 'tax');
  } else {
    flowType = 'mentor';
    await setActiveFlow(from, 'mentor');
  }

  const userDoc = await adminDb.doc(`users/${session.userId}`).get();
  const userData = userDoc.data() || {};

  const contextStr = session.context
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const systemPrompts: Record<string, string> = {
    mentor: `You are a business mentor for Zimbabwean SMEs. Answer concisely (max 400 chars for WhatsApp). Provide actionable advice. Be friendly and encouraging.`,
    tender_search: `You help find tender opportunities for Zimbabwean businesses. Respond concisely (max 400 chars). Ask clarifying questions about sector, location, or budget.`,
    tax: `You are a ZIMRA tax compliance assistant for Zimbabwean SMEs. Respond concisely (max 400 chars). Include relevant regulation references. Note: consult a professional accountant for specific filings.`,
  };

  const prompt = `User business: ${userData.businessName || 'Not set'} | ${userData.industry || 'Not set'}
${userData.businessDescription ? `Description: ${userData.businessDescription}` : ''}

Previous conversation:
${contextStr || 'No prior conversation.'}

User's message: ${text}

Respond in a friendly, helpful tone. Keep it under 400 characters.`;

  try {
    const result = await gateway.generate({
      prompt,
      systemPrompt: systemPrompts[flowType] || systemPrompts.mentor,
      difficulty: 'simple',
      maxTokens: 512,
      temperature: 0.7,
      userId: session.userId,
    });

    const reply = result.content.slice(0, 4096);
    await sendWhatsAppMessage(from, reply);
    await addExchange(from, 'assistant', reply);
  } catch (error) {
    console.error('[WhatsApp] AI generation failed:', error);
    const fallback = 'Sorry, I had trouble processing your request. Please try again or contact support.';
    await sendWhatsAppMessage(from, fallback);
    await addExchange(from, 'assistant', fallback);
  }
}
