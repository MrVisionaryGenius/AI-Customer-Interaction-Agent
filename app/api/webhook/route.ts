import { NextRequest } from 'next/server';
import {
  parseWebhookPayload,
  sendWhatsAppMessage,
  markMessageAsRead,
} from '@/lib/whatsapp';
import {
  ensureMessagesTable,
  logMessage,
  isDuplicateMessage,
  getRecentMessages,
} from '@/lib/supabase';
import { getAIResponse } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge ?? '', { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest): Promise<Response> {
  // Return 200 immediately to avoid webhook timeout
  // Process in the background

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response('OK', { status: 200 });
  }

  // Fire and forget the processing
  processWebhookMessage(body).catch((err) => {
    console.error('Background webhook processing failed:', err);
  });

  return new Response('OK', { status: 200 });
}

async function processWebhookMessage(
  body: Record<string, unknown>
): Promise<void> {
  await ensureMessagesTable();

  const parsed = parseWebhookPayload(body);
  if (!parsed) return;

  const { from, messageId, text, timestamp: _ } = parsed;

  // Handle non-text messages
  if (!text || text.length === 0) {
    const nonTextReply =
      "Thanks for sending that — unfortunately I can only read text messages at the moment. Could you describe what you need and I'll do my best to help?";

    try {
      await logMessage(from, 'inbound', '[Non-text message]', 'general', messageId);
    } catch {
      // Don't block on logging failure
    }

    try {
      await sendWhatsAppMessage(from, nonTextReply);
      await logMessage(from, 'outbound', nonTextReply, 'general');
    } catch (err) {
      console.error('Failed to send non-text response:', err);
    }
    return;
  }

  // Check for duplicate messages
  const isDuplicate = await isDuplicateMessage(messageId);
  if (isDuplicate) return;

  // Log inbound message immediately
  try {
    await logMessage(from, 'inbound', text, 'general', messageId);
  } catch (err) {
    console.error('Failed to log inbound message:', err);
    // Continue processing — don't block on logging failure
  }

  // Fetch recent conversation context (last 6 messages)
  const recentMessages = await getRecentMessages(from, 6);

  // Get AI response
  const aiResponse = await getAIResponse(text, recentMessages);

  // Log outbound message with detected intent
  try {
    await logMessage(from, 'outbound', aiResponse.reply, aiResponse.intent);
  } catch (err) {
    console.error('Failed to log outbound message:', err);
    // Continue — still send to patient
  }

  // Send reply via WhatsApp
  try {
    await sendWhatsAppMessage(from, aiResponse.reply);
  } catch (err) {
    console.error('Failed to send WhatsApp message:', err);
  }

  // Mark as read
  try {
    await markMessageAsRead(messageId);
  } catch {
    // Silent fail for read receipts
  }
}
