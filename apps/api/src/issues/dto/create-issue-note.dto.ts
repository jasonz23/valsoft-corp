import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateIssueNoteDto {
  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsString()
  authorId?: string;
}
