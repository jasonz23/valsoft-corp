export const AI_CATEGORIES = [
  'BUG_REPORT',
  'FEATURE_REQUEST',
  'BILLING_QUESTION',
  'GENERAL_QUESTION',
] as const;

export type AiCategory = (typeof AI_CATEGORIES)[number];

export const PROCESSING_STATUSES = [
  'RECEIVED',
  'PROCESSING',
  'PROCESSED',
  'FAILED',
] as const;

export type ProcessingStatus = (typeof PROCESSING_STATUSES)[number];

export const EMAIL_RESPONSE_STATUSES = ['FOR_APPROVAL', 'APPROVED', 'SENT'] as const;
export type EmailResponseStatus = (typeof EMAIL_RESPONSE_STATUSES)[number];

export const ISSUE_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'FOR_APPROVAL',
  'BLOCKED',
  'DONE',
] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];
