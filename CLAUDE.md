# Bright Smile Dental — WhatsApp Agent

## Status
- [x] Phase 1: Project setup + Supabase
- [x] Phase 2: WhatsApp webhook + message handling
- [x] Phase 3: AI agent + system prompt
- [x] Phase 4: Calendly integration
- [x] Phase 5: Dashboard UI
- [x] Phase 6: Real-time updates + polish

## Architecture

```
WhatsApp Cloud API → POST /api/webhook → Parse message → Log to Supabase
                                        → Get AI response (Gemini 2.0 Flash)
                                        → Parse intent + reply
                                        → Log outbound to Supabase
                                        → Send reply via WhatsApp API
                                        → Mark as read

Dashboard (/dashboard) → GET /api/patients → Supabase query
                       → GET /api/messages/[phone] → Supabase query
                       → POST /api/send-booking → WhatsApp send + Supabase log
                       → Supabase real-time subscription (or 5s polling fallback)
```

### Data Flow
1. Patient sends WhatsApp message → Meta webhook → `/api/webhook`
2. Webhook returns 200 immediately, processes in background
3. Message logged to Supabase `messages` table with direction='inbound'
4. Last 6 messages fetched for context window
5. Gemini called with system prompt + context
6. Response parsed for INTENT and RESPONSE
7. Outbound message logged to Supabase with detected intent
8. Reply sent to patient via WhatsApp Cloud API
9. Dashboard receives real-time update via Supabase subscription

### Key Design Decisions
- System prompt is modular: built from `clinic-info.ts`, `treatment-info.ts`, and `intents.ts`
- Intent detection happens in the same Gemini call (no separate classifier)
- WhatsApp send has 1 retry with 2s delay
- Supabase logging failures never block the conversation flow
- Dashboard uses Supabase real-time with polling fallback

## Environment Variables Required
```
WHATSAPP_PHONE_NUMBER_ID=     # Meta WhatsApp Business API phone number ID
WHATSAPP_ACCESS_TOKEN=        # Meta permanent access token
WHATSAPP_WEBHOOK_VERIFY_TOKEN= # Custom verify token for webhook setup
SUPABASE_URL=                 # Supabase project URL
SUPABASE_ANON_KEY=            # Supabase anonymous key (dashboard client)
SUPABASE_SERVICE_ROLE_KEY=    # Supabase service role key (server-side)
GEMINI_API_KEY=               # Google Gemini API key (gemini-2.0-flash)
CALENDLY_API_KEY=             # Calendly personal access token
CALENDLY_EVENT_URL=           # Calendly booking page URL

# For dashboard real-time (optional, falls back to polling)
NEXT_PUBLIC_SUPABASE_URL=     # Same as SUPABASE_URL but exposed to client
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Same as SUPABASE_ANON_KEY but exposed to client
```

## Supabase Setup

Create the `messages` table in Supabase SQL editor:

```sql
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_phone text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content text NOT NULL,
  intent text NOT NULL DEFAULT 'general',
  wa_message_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_messages_patient_phone ON messages(patient_phone);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_wa_id ON messages(wa_message_id);
```

Enable real-time on the `messages` table in Supabase dashboard for live dashboard updates.

## Deployment Notes

### Vercel
1. Push to GitHub and connect to Vercel
2. Add all environment variables in Vercel project settings
3. Deploy — Vercel auto-detects Next.js
4. After deploy, set webhook URL in Meta Developer Console:
   - Webhook URL: `https://your-domain.vercel.app/api/webhook`
   - Verify token: matches `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - Subscribe to: `messages`

### Meta WhatsApp Setup
1. Create a Meta Developer account and app
2. Add WhatsApp product to the app
3. Get a test phone number (or verify your own)
4. Set the webhook URL to your deployed `/api/webhook` endpoint
5. Generate a permanent access token

### Calendly Setup
1. Get a personal access token from Calendly integrations page
2. Create an event type for appointments
3. Set `CALENDLY_EVENT_URL` to the public booking page URL
