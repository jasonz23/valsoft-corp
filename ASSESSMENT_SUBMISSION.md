# AI Engineer Assessment — Submission

Candidate: Jason Zhao  
Date: March 11, 2026

## 1) What I Built

I built an AI workflow that reads incoming support emails, classifies each email into one of four categories, and drafts a short customer response.

I intentionally extended the workflow beyond classification/drafting so each email also becomes an actionable internal task. This makes the output operationally useful: support can acknowledge the customer quickly, while engineering/support ops can independently track resolution work.

High-level flow:
- n8n trigger receives a new email event
- n8n sends normalized payload to `POST /api/emails/ingest`
- NestJS validates the request and upserts by `messageId`
- OpenAI returns structured fields (`category`, `replyDraft`)
- Prisma persists incoming email + response workflow + linked issue workflow
- Next.js dashboards allow triage, editing, assignment, and status updates

## 2) Output for the 3 Sample Emails

| # | Subject | Category | Reply Draft |
|---|---|---|---|
| 1 | Can't log in | **Bug Report** | I see you’ve been locked out since yesterday and the password reset email isn’t arriving, with a meeting coming up in two hours. We’re going to check your account’s email delivery and reset flow right away, and can help you regain access as quickly as possible. Please confirm the email address on the account and check spam/junk (and any corporate quarantine) while we investigate on our side. |
| 2 | Would love a dark mode | **Feature Request** | A dark mode option for the dashboard makes a lot of sense, especially for late-night use. I’m going to share this request with our product team and check whether it’s already on the roadmap. If you can tell me whether you’d want it to follow your system theme or be a manual toggle, that’ll help us scope it. |
| 3 | Charged twice this month | **Billing Question** | I see two $49 charges this month tied to invoice INV-3847, and I’m going to pull up the billing record to confirm whether a duplicate payment was captured. Once I verify what happened, I’ll let you know the next steps for reversing the extra charge. If you can share the date(s) of the two charges (or the last 4 digits of the card), that will help me match them quickly. |

## 3) Prompt Sent to the LLM

### System Prompt (Exact)

```text
You are a customer support assistant drafting replies on behalf of a real human support team member.

Your task is to analyze an incoming customer support email and produce two things:
1. A category
2. A reply draft

--------------------------------------------------
CATEGORIZATION
--------------------------------------------------

The category MUST be exactly one of the following enums:

BUG_REPORT
FEATURE_REQUEST
BILLING_QUESTION
GENERAL_QUESTION

Use these definitions:

BUG_REPORT
The user reports something broken, not working, or behaving unexpectedly — including login failures, missing system-triggered emails, errors, or degraded functionality.

FEATURE_REQUEST
The user asks for a new capability, improvement, or product change that does not currently exist.

BILLING_QUESTION
The user asks about charges, invoices, refunds, payments, or subscriptions.

GENERAL_QUESTION
Anything that does not fit the above three categories, such as how-to questions, onboarding help, or general product inquiries.

If uncertain, choose the closest category.

Examples (for calibration only — do not copy phrasing):

"App crashes every time I export a PDF" → BUG_REPORT
"It would be great if you supported SSO" → FEATURE_REQUEST
"I was charged twice on my last invoice" → BILLING_QUESTION
"How do I add a new team member?" → GENERAL_QUESTION

--------------------------------------------------
REPLY DRAFT STYLE
--------------------------------------------------

Write 2–3 sentences.

Tone:
Warm, calm, and human — like a knowledgeable colleague responding thoughtfully. No exclamation marks.

Rules:
- Reference the user's specific situation. Show you understood the issue.
- Show understanding of the issue through your actions and next steps, not by restating what the user already told you.
- Avoid generic openers like "Thank you for reaching out" or "We appreciate your patience."
- If the customer signals time pressure, reflect that urgency in pacing and next-step language.
- Briefly explain what will happen next (investigating, checking with the team, following up, etc.).
- Do NOT invent fixes, refunds, timelines, or promises that were not stated.
- Keep the message concise and practical.

Do NOT include:
- Greeting lines (e.g., "Hi John")
- Sign-offs (e.g., "Best regards")
These are added by the system later.

--------------------------------------------------
COMPANY VALUES
--------------------------------------------------

People-first — Prioritize empathy, clarity, and respect for the customer's situation.
Honest and direct — Avoid overpromising. Clearly state when something needs investigation.
Ownership and urgency — Acknowledge the issue and state a clear next step.

--------------------------------------------------
OUTPUT FORMAT
--------------------------------------------------

Return ONLY a single raw JSON object in this exact format. No markdown fences, no commentary, no text before or after.

{
  "category": "BUG_REPORT | FEATURE_REQUEST | BILLING_QUESTION | GENERAL_QUESTION",
  "replyDraft": "2-3 sentence human response"
}
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

I designed the prompt to balance consistency and quality. The category space is tightly constrained to prevent drift, while the style rules push for concrete, empathetic, and actionable communication. I explicitly require machine-parseable JSON so downstream systems can safely consume the output, and I include values-based guidance so responses stay aligned with support tone and ownership standards.

## 4) What I’d Improve With More Time

For this project, I wanted to create something that not only classifies support emails and drafts responses, but also converts each one into an actionable task that can be worked by the team.

The next improvement I would prioritize is prompting and context quality. I would gather deeper company context (business model, mission, product policies, and support playbooks) and build a RAG-backed documentation layer so the model can ground replies in real company knowledge instead of generic language. With that context, I could context-engineer prompts to produce higher-quality, more personalized responses.

## 5) Demo Artifacts

- Screen recording of workflow run for all three sample emails
- n8n workflow screenshots (trigger, AI/classification step, output)
- Output verification screenshots from API/dashboard

## 6) Questions
Output Format
- What output format from the LLM would be most actionable for the team? For example, should responses be structured (e.g., JSON or bullet points) or written as short paragraphs? I want to ensure the output is easy for the support team to quickly understand and act on.

Tone of Customer Responses
- Is there a preferred tone for the reply drafts (e.g., formal support tone vs. friendly conversational tone)?

Category Strictness
- Should the model strictly return only the four categories provided (Bug Report, Feature Request, Billing Question, General Question), or should the workflow handle situations where an email does not clearly fit into one of those categories? Since LLMs tend to return the most plausible answer rather than the most correct one, I want to make sure misclassification is handled appropriately.

Potential Integrations
- In a real-world scenario, would this workflow typically integrate with other internal tools (e.g., Slack, Notion, Asana, ticketing systems)? Understanding this would influence how I structure the architecture and output of the workflow.