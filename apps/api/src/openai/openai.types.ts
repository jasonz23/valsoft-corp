import { AiCategory } from '@valsoft/shared';

export interface ClassificationInput {
  subject: string;
  senderEmail: string;
  body: string;
}

export interface ClassificationResult {
  category: AiCategory;
  replyDraft: string;
}
