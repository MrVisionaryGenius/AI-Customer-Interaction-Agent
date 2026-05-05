# AI Customer Interaction Agent (WhatsApp MVP)

## Overview

This project is a production-oriented AI-powered WhatsApp agent designed to handle real-time customer interactions for service-based businesses.

The system simulates a receptionist workflow — handling queries, guiding users, triaging urgency, and facilitating bookings — using LLM-driven decision-making.

This repository represents a simplified MVP version of a broader AI-driven interaction system.

---

## Problem

Businesses handling high volumes of inbound queries face:

- Delayed responses
- Inconsistent communication
- Lost opportunities due to poor triaging

Traditional chat systems lack contextual understanding and structured decision-making.

---

## Solution

This system introduces an AI-native interaction layer that:

- Processes incoming WhatsApp messages
- Maintains short-term conversational context
- Classifies user intent dynamically
- Generates structured, human-like responses
- Routes users toward actions (e.g., booking)

---

## Key Features

- Real-time WhatsApp message handling
- Context-aware AI responses
- Intent classification pipeline
- Emergency triage logic
- Booking flow integration
- Conversation logging & analytics dashboard

---

## System Architecture

User → WhatsApp API → Webhook → AI Processing Layer → Response → User  
             ↓  
          Supabase (message storage)

---

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict mode)
- OpenAI (GPT-4o)
- Supabase (Postgres DB)
- WhatsApp Cloud API (Meta)
- Calendly API
- Tailwind CSS

---

## Design Decisions

### AI-first Interaction

Instead of rule-based chatbots, the system uses LLMs for flexible, context-aware conversations.

### Modular Prompt System

System prompt is broken into sections (role, behaviour, clinic data) for maintainability.

### Lightweight Context Window

Only last 6 messages passed to model → balances cost vs coherence.

### Graceful Degradation

All external API failures fallback to safe responses (no user-facing errors).

---

## Performance Metrics

See: `/evaluation/metrics.md`

---

## Benchmark Comparison

See: `/evaluation/benchmark.md`

---

## Limitations

- No long-term memory beyond session history
- Simplified intent classification
- Not optimized for large-scale concurrency

---

## Future Improvements

- Multi-agent orchestration
- CRM integrations
- Advanced personalization
- Long-term memory via vector DB

---

## Security

- No API keys stored in repo
- Environment-based configuration
- No sensitive user data included

---

## Demo

(Loom Video Link)

---

## How to Run

1. Clone repo
2. Add `.env.local`
3. Run `npm install`
4. Run `npm run dev`
5. Configure webhook in Meta dashboard

---

## Note

This is a simplified MVP built to demonstrate AI-first interaction workflows and system design capability.
