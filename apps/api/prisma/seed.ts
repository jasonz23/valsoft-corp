import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import {
  AiCategory,
  EmailResponseStatus,
  IssueStatus,
  ProcessingStatus,
  PrismaClient,
} from '@prisma/client';

loadEnv({ path: resolve(process.cwd(), '../../.env'), quiet: true });
loadEnv({ quiet: true });

const prisma = new PrismaClient();

type SeedUser = {
  name: string;
  email: string;
};

type SeedNote = {
  content: string;
  authorEmail?: string;
};

type SeedEmailRecord = {
  messageId: string;
  senderEmail: string;
  subject: string;
  body: string;
  receivedTimestamp: Date;
  category: AiCategory;
  replyDraft: string;
  emailResponse: {
    status: EmailResponseStatus;
    assigneeEmail?: string;
    approvedAt?: Date;
    notes: SeedNote[];
  };
  issue: {
    title: string;
    description: string;
    status: IssueStatus;
    assigneeEmail?: string;
    notes: SeedNote[];
  };
};

const seedUsers: SeedUser[] = [
  { name: 'Alex Support', email: 'alex.support@example.com' },
  { name: 'Taylor Lead', email: 'taylor.lead@example.com' },
  { name: 'Jordan Billing', email: 'jordan.billing@example.com' },
  { name: 'Morgan Engineering', email: 'morgan.engineering@example.com' },
];

const seedEmails: SeedEmailRecord[] = [
  {
    messageId: 'gmail-seed-001',
    senderEmail: 'chris.customer@example.com',
    subject: "Can't log in after password reset",
    body: 'Hi support, after resetting my password this morning, I keep seeing an invalid token message when I try to sign in. I already cleared cache and tried another browser.',
    receivedTimestamp: new Date('2026-03-10T16:02:00.000Z'),
    category: AiCategory.BUG_REPORT,
    replyDraft:
      "Thanks for flagging this login issue and for already trying those troubleshooting steps. We've escalated this to engineering and are actively investigating the token error now. We'll follow up with an update as soon as we confirm a fix path.",
    emailResponse: {
      status: EmailResponseStatus.FOR_APPROVAL,
      assigneeEmail: 'alex.support@example.com',
      notes: [
        {
          content:
            'Initial triage complete. Error pattern matches recent auth deploy report.',
          authorEmail: 'alex.support@example.com',
        },
      ],
    },
    issue: {
      title: '[Bug Report] Login token invalid after reset',
      description:
        'Customer is blocked from sign-in after password reset. Repro attempts made across two browsers.',
      status: IssueStatus.IN_PROGRESS,
      assigneeEmail: 'morgan.engineering@example.com',
      notes: [
        {
          content:
            'Engineering acknowledged and started investigating token validation flow.',
          authorEmail: 'morgan.engineering@example.com',
        },
      ],
    },
  },
  {
    messageId: 'gmail-seed-002',
    senderEmail: 'pat.product@example.com',
    subject: 'Feature request: CSV export for reports',
    body: 'We need a CSV export option in the monthly analytics report screen so finance can process data externally. Is this on your roadmap?',
    receivedTimestamp: new Date('2026-03-10T17:15:00.000Z'),
    category: AiCategory.FEATURE_REQUEST,
    replyDraft:
      "Thanks for the detailed feature request around CSV exports for monthly analytics. We've logged this with our product team for prioritization and internal review. We'll share follow-up details once we confirm planning status.",
    emailResponse: {
      status: EmailResponseStatus.APPROVED,
      approvedAt: new Date('2026-03-10T18:00:00.000Z'),
      assigneeEmail: 'taylor.lead@example.com',
      notes: [
        {
          content:
            'Reply approved by team lead; pending send during next comms pass.',
          authorEmail: 'taylor.lead@example.com',
        },
      ],
    },
    issue: {
      title: '[Feature Request] CSV export in analytics reports',
      description:
        'Requested by product operations for finance workflows. Need effort estimate and UX approach.',
      status: IssueStatus.FOR_APPROVAL,
      assigneeEmail: 'taylor.lead@example.com',
      notes: [
        {
          content: 'Sizing prepared; waiting on PM prioritization sign-off.',
          authorEmail: 'taylor.lead@example.com',
        },
      ],
    },
  },
  {
    messageId: 'gmail-seed-003',
    senderEmail: 'sam.billing@example.com',
    subject: 'Question about duplicate invoice charge',
    body: 'I was charged twice on the same day for the Pro plan. Can you confirm what happened and how this gets resolved?',
    receivedTimestamp: new Date('2026-03-10T18:45:00.000Z'),
    category: AiCategory.BILLING_QUESTION,
    replyDraft:
      "Thanks for contacting us about the duplicate billing charge. We've opened an internal billing review and will verify the transaction records right away. We'll provide a follow-up update once the review is complete.",
    emailResponse: {
      status: EmailResponseStatus.SENT,
      approvedAt: new Date('2026-03-10T19:02:00.000Z'),
      assigneeEmail: 'jordan.billing@example.com',
      notes: [
        {
          content:
            'Customer acknowledgment sent. Awaiting gateway reconciliation details.',
          authorEmail: 'jordan.billing@example.com',
        },
      ],
    },
    issue: {
      title: '[Billing Question] Duplicate Pro plan charge review',
      description:
        'Potential duplicate charge event. Verify payment provider logs and refund path if required.',
      status: IssueStatus.BLOCKED,
      assigneeEmail: 'jordan.billing@example.com',
      notes: [
        {
          content:
            'Blocked on provider settlement data expected tomorrow morning.',
          authorEmail: 'jordan.billing@example.com',
        },
      ],
    },
  },
  {
    messageId: 'gmail-seed-004',
    senderEmail: 'lee.ops@example.com',
    subject: 'How long do you retain uploaded files?',
    body: 'Can you clarify your retention policy for uploaded documents and whether deleted files are immediately removed?',
    receivedTimestamp: new Date('2026-03-10T20:22:00.000Z'),
    category: AiCategory.GENERAL_QUESTION,
    replyDraft:
      "Thanks for reaching out with your question about document retention and deletion behavior. We've routed this to our support team to provide an accurate policy response. We'll send a detailed clarification shortly.",
    emailResponse: {
      status: EmailResponseStatus.FOR_APPROVAL,
      assigneeEmail: 'alex.support@example.com',
      notes: [
        {
          content: 'Need legal-approved wording before final response is sent.',
          authorEmail: 'alex.support@example.com',
        },
      ],
    },
    issue: {
      title: '[General Question] Confirm file retention policy details',
      description:
        'Requesting clear policy language for retention and delete lifecycle. Coordinate with policy owner.',
      status: IssueStatus.NOT_STARTED,
      assigneeEmail: 'taylor.lead@example.com',
      notes: [
        {
          content: 'Backlog item created for policy response template update.',
          authorEmail: 'taylor.lead@example.com',
        },
      ],
    },
  },
  {
    messageId: 'gmail-seed-005',
    senderEmail: 'jamie.mobile@example.com',
    subject: 'Android app crashes on launch',
    body: 'After the latest update, the Android app crashes instantly on startup on Pixel 8. iOS still works fine for our team.',
    receivedTimestamp: new Date('2026-03-10T21:05:00.000Z'),
    category: AiCategory.BUG_REPORT,
    replyDraft:
      "Thanks for reporting the Android startup crash after the recent update. We've created a high-priority internal issue and our team is actively validating the failure on affected devices. We'll provide next-step guidance as soon as we have a confirmed update.",
    emailResponse: {
      status: EmailResponseStatus.APPROVED,
      approvedAt: new Date('2026-03-10T21:26:00.000Z'),
      assigneeEmail: 'alex.support@example.com',
      notes: [
        {
          content: 'Draft approved and queued for final outbound send.',
          authorEmail: 'taylor.lead@example.com',
        },
      ],
    },
    issue: {
      title: '[Bug Report] Android startup crash on Pixel 8',
      description:
        'Regression likely introduced in latest release. Hotfix validation completed and release candidate prepared.',
      status: IssueStatus.DONE,
      assigneeEmail: 'morgan.engineering@example.com',
      notes: [
        {
          content: 'Root cause fixed and patch validated in QA.',
          authorEmail: 'morgan.engineering@example.com',
        },
      ],
    },
  },
];

async function main(): Promise<void> {
  const users = await Promise.all(
    seedUsers.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name },
        create: user,
      }),
    ),
  );

  const userIdByEmail = new Map(users.map((user) => [user.email, user.id]));

  for (const record of seedEmails) {
    const processedAt = new Date(record.receivedTimestamp.getTime() + 90_000);

    const incomingEmail = await prisma.incomingEmail.upsert({
      where: { messageId: record.messageId },
      update: {
        senderEmail: record.senderEmail,
        subject: record.subject,
        body: record.body,
        receivedTimestamp: record.receivedTimestamp,
        aiCategory: record.category,
        replyDraft: record.replyDraft,
        processingStatus: ProcessingStatus.PROCESSED,
        processingError: null,
        processedAt,
        promptVersion: 'v1',
        aiModel: 'gpt-4.1-mini',
      },
      create: {
        messageId: record.messageId,
        senderEmail: record.senderEmail,
        subject: record.subject,
        body: record.body,
        receivedTimestamp: record.receivedTimestamp,
        aiCategory: record.category,
        replyDraft: record.replyDraft,
        processingStatus: ProcessingStatus.PROCESSED,
        processedAt,
        promptVersion: 'v1',
        aiModel: 'gpt-4.1-mini',
      },
    });

    const emailResponse = await prisma.emailResponse.upsert({
      where: { incomingEmailId: incomingEmail.id },
      update: {
        status: record.emailResponse.status,
        draft: record.replyDraft,
        approvedAt: record.emailResponse.approvedAt ?? null,
        assigneeId: record.emailResponse.assigneeEmail
          ? (userIdByEmail.get(record.emailResponse.assigneeEmail) ?? null)
          : null,
      },
      create: {
        incomingEmailId: incomingEmail.id,
        status: record.emailResponse.status,
        draft: record.replyDraft,
        approvedAt: record.emailResponse.approvedAt ?? null,
        assigneeId: record.emailResponse.assigneeEmail
          ? (userIdByEmail.get(record.emailResponse.assigneeEmail) ?? null)
          : null,
      },
    });

    const issue = await prisma.issue.upsert({
      where: { incomingEmailId: incomingEmail.id },
      update: {
        title: record.issue.title,
        description: record.issue.description,
        status: record.issue.status,
        assigneeId: record.issue.assigneeEmail
          ? (userIdByEmail.get(record.issue.assigneeEmail) ?? null)
          : null,
      },
      create: {
        incomingEmailId: incomingEmail.id,
        title: record.issue.title,
        description: record.issue.description,
        status: record.issue.status,
        assigneeId: record.issue.assigneeEmail
          ? (userIdByEmail.get(record.issue.assigneeEmail) ?? null)
          : null,
      },
    });

    await prisma.emailResponseNote.deleteMany({
      where: { emailResponseId: emailResponse.id },
    });

    await prisma.issueNote.deleteMany({
      where: { issueId: issue.id },
    });

    if (record.emailResponse.notes.length > 0) {
      await prisma.emailResponseNote.createMany({
        data: record.emailResponse.notes.map((note) => ({
          emailResponseId: emailResponse.id,
          content: note.content,
          authorId: note.authorEmail
            ? (userIdByEmail.get(note.authorEmail) ?? null)
            : null,
        })),
      });
    }

    if (record.issue.notes.length > 0) {
      await prisma.issueNote.createMany({
        data: record.issue.notes.map((note) => ({
          issueId: issue.id,
          content: note.content,
          authorId: note.authorEmail
            ? (userIdByEmail.get(note.authorEmail) ?? null)
            : null,
        })),
      });
    }
  }

  console.log(
    `Seeded ${users.length} users and ${seedEmails.length} incoming email workflows.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
