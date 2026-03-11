import { ISSUE_STATUSES } from '@valsoft/shared';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateIssueDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(ISSUE_STATUSES)
  status?: (typeof ISSUE_STATUSES)[number];

  @IsOptional()
  @IsString()
  assigneeId?: string | null;
}
