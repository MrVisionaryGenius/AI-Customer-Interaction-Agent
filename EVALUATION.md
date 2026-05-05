# AI Customer Interaction Agent (WhatsApp MVP)

## Overview

This project is a production-oriented AI-powered WhatsApp agent designed to handle real-time customer interactions for service-based businesses.

The system simulates a receptionist workflow - answering queries, guiding users, triaging urgency, and facilitating bookings - using LLM-driven decision-making.

This repository represents a simplified MVP version of a broader AI-driven interaction system built to demonstrate AI-first execution and system design capability.

---

## Problem

Businesses handling inbound customer queries often face:

* Delayed responses
* Inconsistent communication
* Poor triaging of urgent vs non-urgent cases
* Missed opportunities due to lack of structured workflows

Traditional chat systems are rule-based and fail in dynamic, multi-turn conversations.

---

## Solution

This system introduces an AI-native interaction layer that:

* Processes incoming WhatsApp messages in real time
* Maintains short-term conversational context
* Dynamically classifies user intent
* Generates structured, human-like responses
* Routes users toward actions (e.g. booking or escalation)

---

## Key Features

* Real-time WhatsApp message handling
* Context-aware response generation
* Intent classification pipeline
* Emergency triage system (critical vs urgent)
* Booking workflow integration
* Conversation logging and analytics dashboard

---

## System Architecture

User -> WhatsApp API -> Webhook -> AI Processing Layer -> Response -> User
                 |
                 -> Supabase (message storage)

---

## Tech Stack

* Next.js 14 (App Router)
* TypeScript (strict mode)
* OpenAI (GPT-4o)
* Supabase (Postgres)
* WhatsApp Cloud API (Meta)
* Calendly API
* Tailwind CSS

---

## Design Decisions

### AI-First Interaction

The system relies on LLMs for flexible, context-aware responses instead of rule-based flows.

### Modular Prompt Design

The system prompt is structured into sections (role, tone, knowledge, rules) to improve maintainability and control.

### Lightweight Context Window

Only the last 6 messages are passed to the model to balance cost and coherence.

### Graceful Error Handling

All external failures (OpenAI, WhatsApp, Calendly) fallback to safe user-facing responses.

---

## Evaluation Approach

### Why This Evaluation Method?

This system operates in a **conversational, real-time environment**, where traditional ML metrics (precision/recall) are insufficient.

Instead, evaluation focuses on **interaction quality and system behavior**, specifically:

* Understanding user intent
* Generating useful responses
* Maintaining conversational context
* Responding within acceptable latency

The evaluation is designed to reflect **real-world usability**, not theoretical performance.

---

## Evaluation Criteria

### 1. Intent Accuracy (40%)

Measures how correctly the system identifies the user's intent.

Formula:  
Intent Accuracy = Correct Intent Predictions / Total Messages

---

### 2. Response Relevance (30%)

Measures how useful and aligned the response is to the user query.

Scored manually (1-5 scale) and averaged.

---

### 3. Context Continuity (20%)

Measures whether the system maintains conversational flow across multiple turns.

Example:  
Follow-up questions referencing previous context.

---

### 4. Response Latency (10%)

Measures how quickly the system responds to user input.

---

## Evaluation Dataset

The system was tested using a structured dataset including:

* Greetings
* Pricing queries
* Booking requests
* Emergency scenarios
* Follow-up questions
* Multi-intent queries
* Off-topic inputs
* Edge cases (rude users, unsupported inputs)

---

## Evaluation Results

### Metric Scores

* Intent Accuracy: 80%
* Response Relevance: 76%
* Context Continuity: 70%
* Latency: 85%

---

### Final Score Calculation

Final Score =  
(Intent x 0.4) +  
(Relevance x 0.3) +  
(Continuity x 0.2) +  
(Speed x 0.1)

= (8000 x 0.4 + 7600 x 0.3 + 7000 x 0.2 + 8500 x 0.1)  
= 7730 / 10000

---

## Final Score: **7,730 / 10,000**

---

## Key Strengths

### 1. Emergency Handling

Correctly distinguishes between:

* Life-threatening situations -> directs to emergency services
* Urgent cases -> routes to booking

This demonstrates reliable safety behavior.

---

### 2. Structured Responses

* Clear pricing communication
* Natural conversational tone
* Action-oriented replies

---

### 3. Workflow Alignment

* Efficient booking flow
* Clear next-step guidance

---

## Key Limitations

### 1. Context Drift

* Occasional incorrect carryover between conversations
* Misaligned responses in multi-turn scenarios

---

### 2. Multi-Intent Handling

* Struggles with queries combining:
  * urgency
  * pricing
  * booking

---

### 3. Message Handling Issues

* Missed responses in certain cases
* Possible webhook or queue timing inconsistencies

---

### 4. Off-Topic Handling Inconsistency

* Initial incorrect response before fallback correction

---

## Observations

The system performs strongly in structured workflows such as pricing, booking, and emergency triage.

However, evaluation highlights a key limitation of single-agent LLM systems:

* Context retention does not guarantee correct reasoning
* Sequential prompts can introduce unintended state carryover

This reinforces the need for more advanced orchestration in complex conversational systems.

---

## Future Improvements

* Multi-agent architecture (intent, response, safety separation)
* Improved context filtering and memory handling
* Robust message queue handling
* Better multi-intent decomposition
* Integration with CRM systems

---

## Security Considerations

* No API keys stored in repository
* Environment variables used for all credentials
* No real user data included

---

## Demo

(Loom Video Link)

---

## How to Run

1. Clone repository
2. Add `.env.local` with required variables
3. Run `npm install`
4. Run `npm run dev`
5. Configure WhatsApp webhook

---

## Note

This project is a simplified MVP designed to demonstrate:

* AI-first system design
* Real-time interaction workflows
* Practical use of LLMs in production scenarios

It does not represent a full production deployment.
