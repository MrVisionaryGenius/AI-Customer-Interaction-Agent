# Product Requirements Document (PRD)

## Product Name
Bright Smile Dental WhatsApp Agent

## Document Status
Draft v1.0

## 1) Product Overview
Bright Smile Dental WhatsApp Agent is a conversational assistant that helps patients ask questions, get treatment information, and book appointments through WhatsApp.  
It also provides an internal dashboard for staff to monitor conversations and send booking links.

## 2) Problem Statement
- Patients prefer quick, familiar communication channels over phone calls.
- Clinic staff spend repetitive effort answering similar FAQs and coordinating booking steps.
- The clinic needs a reliable message log and lightweight operations dashboard.

## 3) Goals
- Respond to inbound WhatsApp messages automatically and reliably.
- Detect patient intent in real time and provide accurate clinic-specific replies.
- Support appointment booking flow through Calendly links.
- Give staff a dashboard to view conversations and take manual actions when needed.

## 4) Non-Goals
- Full EHR/EMR integration.
- Payment processing inside chat.
- Multi-language NLP optimization beyond baseline model capability.
- Voice call handling.

## 5) Target Users
- **Primary:** Dental clinic patients contacting via WhatsApp.
- **Secondary:** Front-desk and clinic staff using the dashboard.

## 6) User Stories
- As a patient, I want to ask about treatments and pricing so I can decide on care.
- As a patient, I want to receive a booking link quickly so I can schedule without calling.
- As staff, I want to see recent conversations in one place so I can intervene when needed.
- As staff, I want near real-time updates so I can track active patient chats.

## 7) Scope

### In Scope
- WhatsApp webhook verification and inbound message handling.
- AI-generated reply and intent extraction in one model call.
- Supabase logging for inbound and outbound messages.
- Staff dashboard with patient list, message thread view, and send-booking action.
- Real-time dashboard updates with polling fallback.

### Out of Scope
- CRM synchronization.
- Campaign broadcasts.
- Advanced analytics beyond core operational metrics.

## 8) Functional Requirements

### FR-1: Webhook Ingestion
- System shall expose `POST /api/webhook` to receive WhatsApp events.
- System shall return HTTP 200 quickly and continue processing asynchronously.

### FR-2: Message Persistence
- System shall save inbound and outbound messages in Supabase `messages` table.
- Message records shall include: `patient_phone`, `direction`, `content`, `intent`, `wa_message_id`, `created_at`.

### FR-3: Contextual AI Response
- System shall fetch recent conversation context (last 6 messages) per patient.
- System shall call Gemini (`gemini-2.0-flash`) with modular prompt components.
- System shall parse and store both intent and final response text.

### FR-4: WhatsApp Delivery
- System shall send responses through WhatsApp Cloud API.
- System shall retry failed sends once with a 2-second delay.
- System shall mark inbound messages as read after processing.

### FR-5: Dashboard
- System shall expose patient and thread APIs:
  - `GET /api/patients`
  - `GET /api/messages/[phone]`
- System shall allow manual booking-message send through:
  - `POST /api/send-booking`
- Dashboard shall update via Supabase Realtime; if unavailable, poll every 5 seconds.

### FR-6: Resilience
- Supabase write failures shall not block reply generation or delivery.
- Failures shall be logged for troubleshooting.

## 9) Non-Functional Requirements
- **Latency:** Webhook acknowledgment should be near-immediate; conversational reply target under 10 seconds in normal conditions.
- **Availability:** Service should maintain operational continuity during transient third-party API issues.
- **Scalability:** Architecture should support increasing concurrent conversations with stateless API routes.
- **Security:** Secrets must be stored in environment variables and never committed.
- **Observability:** Key errors and delivery failures should be traceable in logs.

## 10) Data Model
Core table: `messages`

Columns:
- `id` (uuid, primary key)
- `patient_phone` (text, indexed)
- `direction` (`inbound` | `outbound`)
- `content` (text)
- `intent` (text, default `general`)
- `wa_message_id` (text, indexed)
- `created_at` (timestamptz, indexed)

## 11) External Integrations
- **Meta WhatsApp Cloud API** for inbound/outbound messaging.
- **Supabase** for persistence and real-time subscriptions.
- **Google Gemini API** for response generation and intent detection.
- **Calendly API / Event URL** for booking flow.

## 12) API Surface (Current)
- `POST /api/webhook`
- `GET /api/patients`
- `GET /api/messages/[phone]`
- `POST /api/send-booking`

## 13) Success Metrics
- First response time (P50/P95).
- Message delivery success rate.
- Booking link send rate and click-through proxy (if tracked later).
- Percentage of conversations resolved without manual intervention.
- Dashboard update freshness (real-time success vs polling fallback rate).

## 14) Risks and Mitigations
- **Third-party API downtime** -> retry logic and graceful failure handling.
- **AI misclassification or incorrect responses** -> prompt tuning, constrained intent set, manual dashboard oversight.
- **Realtime subscription instability** -> deterministic 5s polling fallback.
- **Secret leakage risk** -> environment-based secret management and repository hygiene.

## 15) Release and Rollout
- Deploy on Vercel with all required environment variables.
- Configure Meta webhook URL to `/api/webhook` and subscribe to `messages`.
- Enable Supabase Realtime for `messages` table.
- Run controlled pilot with test patient numbers before full production usage.

## 16) Future Enhancements
- Multi-language prompt packs and localized responses.
- Structured analytics dashboard with SLA and conversion trends.
- Automated follow-up reminders for incomplete bookings.
- Staff assignment and tagging for escalated threads.
