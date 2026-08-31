const BASE_URL = 'https://graph.facebook.com/v21.0';

export async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return false;

  try {
    const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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
      console.error('[WhatsApp] Send failed:', await res.text());
    }
    return res.ok;
  } catch (error) {
    console.error('[WhatsApp] Send error:', error);
    return false;
  }
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  params: Record<string, string>,
): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return false;

  const bodyParams = Object.values(params).map((value) => ({
    type: 'text',
    text: value,
  }));

  try {
    const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: bodyParams.length > 0 ? [{ type: 'body', parameters: bodyParams }] : undefined,
        },
      }),
    });
    if (!res.ok) {
      console.error('[WhatsApp] Template send failed:', await res.text());
    }
    return res.ok;
  } catch (error) {
    console.error('[WhatsApp] Template send error:', error);
    return false;
  }
}

/**
 * Inbound WhatsApp automation is suspended until account ownership can be
 * verified with an authenticated, expiring challenge. Keeping this denial at
 * the service layer prevents alternate webhook routes from bypassing it.
 */
export async function handleIncomingMessage(
  from: string,
  _text: string,
  _displayPhoneNumber: string,
  _phoneNumberId: string,
): Promise<void> {
  await sendWhatsAppMessage(
    from,
    'Radbit WhatsApp account services are temporarily unavailable. Please sign in at https://radbitstudios.co.zw to access your account. Radbit does not register fiscal devices, issue official receipts, verify investments, or hold deposits through WhatsApp.',
  );
}
