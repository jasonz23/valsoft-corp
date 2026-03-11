import type { AiCategory, EmailResponseStatus, IssueStatus } from './enums';

export const AI_CATEGORY_LABELS: Record<AiCategory, string> = {
  BUG_REPORT: 'Bug Report',
  FEATURE_REQUEST: 'Feature Request',
  BILLING_QUESTION: 'Billing Question',
  GENERAL_QUESTION: 'General Question',
};

export const EMAIL_RESPONSE_STATUS_LABELS: Record<EmailResponseStatus, string> = {
  FOR_APPROVAL: 'For Approval',
  APPROVED: 'Approved',
  SENT: 'Sent',
};

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  FOR_APPROVAL: 'For Approval',
  BLOCKED: 'Blocked',
  DONE: 'Done',
};
