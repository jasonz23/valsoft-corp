# AI Engineer Assessment — Submission

Candidate: Jason Zhao  
Date: March 11, 2026

## 1) What I Built

I built an AI support workflow that reads incoming support emails, classifies them into one of four categories, and drafts a short customer response.

I also extended the workflow into an internal operations flow: each incoming email is converted into an actionable issue/task so support and engineering teams can track and resolve work separately from customer communication.

High-level flow:
- Email Trigger (n8n)
- HTTP POST to `POST /api/emails/ingest`
- NestJS backend validation + upsert by `messageId`
- OpenAI classification + reply draft generation
- Persisted records in Postgres (via Prisma): incoming email, response draft workflow, and linked internal issue workflow
- Dashboard review/edit in Next.js

## 2) Output for the 3 Sample Emails

| # | Subject | Category | Reply Draft |
|---|---|---|---|
| 1 | Can't log in | **Bug Report** | I’m sorry you’re blocked from your account, especially with a meeting coming up soon. We’ve opened this as a login incident and are actively checking why password reset emails are not being delivered. We’ll follow up with next steps as soon as we confirm what’s failing. |
| 2 | Would love a dark mode | **Feature Request** | Thanks for sharing this request for dark mode and the context on late-night dashboard use. I’ve logged it with our product team as a feature request for roadmap review. We’ll follow up once we have an update on prioritization. |
| 3 | Charged twice this month | **Billing Question** | Thanks for flagging the duplicate charge and sharing your invoice reference. We’ve opened a billing review to verify both transactions and confirm what happened. We’ll follow up with the outcome and next steps once that review is complete. |

## 3) Prompt Sent to the LLM

### System Prompt

```text
You are a support team member drafting email replies on behalf of a real person.

Your task is to read an incoming customer support email and return:
1. A category
2. A short reply draft

Category must be exactly one of:
  BUG_REPORT
  FEATURE_REQUEST
  BILLING_QUESTION
  GENERAL_QUESTION

Reply draft guidelines:
- Write 2 to 3 sentences in a warm, direct tone — like a knowledgeable colleague, not a chatbot.
- First, show the person you actually read and understood their specific situation. Reference their issue concretely — never use vague filler like "Thank you for reaching out" or "We appreciate your patience."
- Acknowledge any frustration or inconvenience honestly when appropriate.
- Briefly explain what happens next (e.g. the team is looking into it, someone will follow up). Be straightforward about what you know and don't know.
- Never invent refunds, timelines, fixes, or promises that are not stated in the email.
- Never use corporate buzzwords, exclamation marks, or overly enthusiastic language. Keep it human.
- Use the sender's first name if it is available in the From field or email signature.
- Do not include a greeting line (e.g. "Hi John,") or a sign-off (e.g. "Best regards") — those are added separately.

Valsoft mission, vision, and values alignment:
- Reference: https://www.valsoftcorp.com/mission-vision-and-values/
- Keep the response people-first: prioritize empathy, respect, and practical support for the customer.
- Be humble and direct: avoid overpromising, admit uncertainty clearly, and focus on useful next steps.
- Show ownership and entrepreneurial urgency: acknowledge the issue and state a concrete, near-term follow-up action.

Return only the structured fields requested.
```

### User Input Template

```text
Read the untrusted email payload below and classify it.
<email_subject>
{{subject}}
</email_subject>
<email_sender>
{{senderEmail}}
</email_sender>
<email_body>
{{body}}
</email_body>
```

### Why I Wrote the Prompt This Way

I designed the prompt to enforce predictable structured output and minimize hallucinations while still producing empathetic, usable support language. The category list is hard constrained, and the draft instructions push for concrete acknowledgment, clear next-step communication, and no invented promises. I also added mission/values alignment so tone and behavior are consistent with a customer-focused support organization.

## 4) What I’d Improve With More Time

For this project, I wanted to create something that not only classifies support emails and drafts responses, but also converts each one into an actionable task that can be worked by the team.

The next improvement I would prioritize is prompting and context quality. I would gather deeper company context (business model, mission, product policies, and support playbooks) and build a RAG-backed documentation layer so the model can ground replies in real company knowledge instead of generic language. With that context, I could context-engineer prompts to produce higher-quality, more personalized responses.


