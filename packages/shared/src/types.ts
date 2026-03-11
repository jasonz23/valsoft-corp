import type { AiCategory, EmailResponseStatus, IssueStatus, ProcessingStatus } from './enums';

export type Nullable<T> = T | null;

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface IncomingEmailSummary {
  id: string;
  messageId: string;
  senderEmail: string;
  subject: string;
  body: string;
  receivedTimestamp: string;
  aiCategory: Nullable<AiCategory>;
  replyDraft: Nullable<string>;
  processingStatus: ProcessingStatus;
  processedAt: Nullable<string>;
  processingError: Nullable<string>;
  createdAt: string;
  updatedAt: string;
}

export interface EmailResponseRecord {
  id: string;
  incomingEmailId: string;
  status: EmailResponseStatus;
  draft: string;
  approvedAt: Nullable<string>;
  assigneeId: Nullable<string>;
  assignee: Nullable<UserSummary>;
  incomingEmail: IncomingEmailSummary;
  createdAt: string;
  updatedAt: string;
}

export interface IssueRecord {
  id: string;
  incomingEmailId: string;
  title: string;
  description: Nullable<string>;
  status: IssueStatus;
  assigneeId: Nullable<string>;
  assignee: Nullable<UserSummary>;
  incomingEmail: IncomingEmailSummary;
  createdAt: string;
  updatedAt: string;
}
