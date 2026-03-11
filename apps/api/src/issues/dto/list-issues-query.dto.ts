import { AI_CATEGORIES, ISSUE_STATUSES } from '@valsoft/shared';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListIssuesQueryDto {
  @IsOptional()
  @IsIn(ISSUE_STATUSES)
  status?: (typeof ISSUE_STATUSES)[number];

  @IsOptional()
  @IsIn(AI_CATEGORIES)
  aiCategory?: (typeof AI_CATEGORIES)[number];

  @IsOptional()
  @IsString()
  assigneeId?: string;
}
