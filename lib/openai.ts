import { GoogleGenAI } from '@google/genai';
import { buildSystemPrompt } from './system-prompt';
import { getBookingUrl } from './calendly';
import { isValidIntent, type IntentCategory } from './intents';
import type { MessageRow } from './supabase';

interface AIResponse {
  intent: IntentCategory;
  reply: string;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

const FALLBACK_MESSAGE =
  "Sorry, I'm having a quick technical issue. Please call us on 020 7946 0312 and we'll sort you out straight away.";

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY ?? '',
  });
}

export async function getAIResponse(
  incomingMessage: string,
  recentMessages: MessageRow[]
): Promise<AIResponse> {
  const calendlyUrl = getBookingUrl();
  const systemPrompt = buildSystemPrompt(calendlyUrl);

  // Build conversation history for Gemini
  const conversationHistory: GeminiContent[] = recentMessages.map((msg) => ({
    role: msg.direction === 'inbound' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  try {
    const client = getGeminiClient();

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        ...conversationHistory,
        { role: 'user', parts: [{ text: incomingMessage }] },
      ],
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const content = response.text ?? '';
    return parseAIResponse(content);
  } catch (err) {
    console.error('Gemini call failed:', err);
    return {
      intent: 'general',
      reply: FALLBACK_MESSAGE,
    };
  }
}

function parseAIResponse(content: string): AIResponse {
  // Try to parse INTENT: xxx\nRESPONSE: xxx format
  const intentMatch = content.match(/INTENT:\s*(\S+)/i);
  const responseMatch = content.match(/RESPONSE:\s*([\s\S]*)/i);

  let intent: IntentCategory = 'general';
  let reply = content;

  if (intentMatch && intentMatch[1]) {
    const parsed = intentMatch[1].trim().toLowerCase();
    if (isValidIntent(parsed)) {
      intent = parsed;
    }
  }

  if (responseMatch && responseMatch[1]) {
    reply = responseMatch[1].trim();
  }

  // If parsing failed, just use the raw content as reply
  if (!reply || reply.length === 0) {
    reply = content;
  }

  return { intent, reply };
}
