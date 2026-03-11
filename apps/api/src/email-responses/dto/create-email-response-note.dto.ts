import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEmailResponseNoteDto {
  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsString()
  authorId?: string;
}
