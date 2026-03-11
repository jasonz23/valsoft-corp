import type {
  AiCategory,
  EmailResponseRecord,
  EmailResponseStatus,
  IssueRecord,
  IssueStatus,
  UserSummary,
} from '@valsoft/shared';

export interface ApiUser extends UserSummary {
  createdAt: string;
  updatedAt: string;
}

export interface EmailResponseNote {
  id: string;
  emailResponseId: string;
  content: string;
  authorId: string | null;
  author: ApiUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface IssueNote {
  id: string;
  issueId: string;
  content: string;
  authorId: string | null;
  author: ApiUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailResponseDetail extends EmailResponseRecord {
  notes: EmailResponseNote[];
}

export interface IssueDetail extends IssueRecord {
  notes: IssueNote[];
}

export type EmailResponseListItem = Omit<EmailResponseDetail, 'notes'>;
export type IssueListItem = Omit<IssueDetail, 'notes'>;

export interface IncomingEmailDetail {
  id: string;
  messageId: string;
  senderEmail: string;
  subject: string;
  body: string;
  receivedTimestamp: string;
  aiCategory: AiCategory | null;
  replyDraft: string | null;
  processingStatus: string;
  processedAt: string | null;
  processingError: string | null;
  emailResponse: EmailResponseDetail | null;
  issue: IssueDetail | null;
}

export interface EmailResponseListFilters {
  status?: EmailResponseStatus;
  aiCategory?: AiCategory;
  assigneeId?: string;
  senderEmail?: string;
  search?: string;
}

export interface IssueListFilters {
  status?: IssueStatus;
  aiCategory?: AiCategory;
  assigneeId?: string;
}
