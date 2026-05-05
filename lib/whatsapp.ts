const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0';

interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<WhatsAppSendResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error('WhatsApp credentials not configured');
    return { success: false, error: 'Credentials not configured' };
  }

  const url = `${WHATSAPP_API_URL}/${phoneNumberId}/messages`;

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: text },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('WhatsApp send failed:', response.status, errorData);

      // Retry once after 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const retryResponse = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!retryResponse.ok) {
        const retryError = await retryResponse.text();
        console.error('WhatsApp retry also failed:', retryError);
        return { success: false, error: retryError };
      }

      const retryData = await retryResponse.json();
      return {
        success: true,
        messageId: retryData?.messages?.[0]?.id,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data?.messages?.[0]?.id,
    };
  } catch (err) {
    console.error('WhatsApp send error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) return;

  const url = `${WHATSAPP_API_URL}/${phoneNumberId}/messages`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  } catch (err) {
    console.error('Failed to mark message as read:', err);
  }
}

interface WhatsAppWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
}

interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: { name: string };
        wa_id: string;
      }>;
      messages?: WhatsAppWebhookMessage[];
      statuses?: Array<Record<string, unknown>>;
    };
    field: string;
  }>;
}

export interface ParsedWhatsAppMessage {
  from: string;
  messageId: string;
  text: string;
  timestamp: string;
}

export function parseWebhookPayload(
  body: Record<string, unknown>
): ParsedWhatsAppMessage | null {
  try {
    const entries = (body.entry as WhatsAppWebhookEntry[]) ?? [];
    for (const entry of entries) {
      for (const change of entry.changes) {
        const value = change.value;

        // Ignore status updates
        if (value.statuses && value.statuses.length > 0) {
          return null;
        }

        const messages = value.messages;
        if (!messages || messages.length === 0) continue;

        const msg = messages[0];

        // Only process text messages
        if (msg.type !== 'text' || !msg.text?.body) {
          return {
            from: msg.from,
            messageId: msg.id,
            text: '',
            timestamp: msg.timestamp,
          };
        }

        return {
          from: msg.from,
          messageId: msg.id,
          text: msg.text.body,
          timestamp: msg.timestamp,
        };
      }
    }
    return null;
  } catch (err) {
    console.error('Error parsing webhook payload:', err);
    return null;
  }
}
