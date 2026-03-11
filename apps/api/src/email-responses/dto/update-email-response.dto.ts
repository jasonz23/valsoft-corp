import { EMAIL_RESPONSE_STATUSES } from '@valsoft/shared';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEmailResponseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  draft?: string;

  @IsOptional()
  @IsIn(EMAIL_RESPONSE_STATUSES)
  status?: (typeof EMAIL_RESPONSE_STATUSES)[number];

  @IsOptional()
  @IsString()
  assigneeId?: string | null;
}
