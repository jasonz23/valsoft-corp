import { IsIn, IsOptional, IsString } from 'class-validator';
import { AI_CATEGORIES, EMAIL_RESPONSE_STATUSES } from '@valsoft/shared';

export class ListEmailResponsesQueryDto {
  @IsOptional()
  @IsIn(EMAIL_RESPONSE_STATUSES)
  status?: (typeof EMAIL_RESPONSE_STATUSES)[number];

  @IsOptional()
  @IsIn(AI_CATEGORIES)
  aiCategory?: (typeof AI_CATEGORIES)[number];

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  senderEmail?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
