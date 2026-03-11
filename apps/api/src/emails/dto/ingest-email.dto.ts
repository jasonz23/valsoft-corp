import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class IngestEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Matches(/^[^\p{Cc}]+$/u, {
    message: 'subject contains unsupported control characters',
  })
  subject!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  body!: string;

  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @MaxLength(320)
  senderEmail!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[^\p{Cc}]+$/u, {
    message: 'messageId contains unsupported control characters',
  })
  messageId!: string;

  @ApiProperty({
    description: 'ISO timestamp or Gmail internalDate milliseconds string',
    example: '2026-03-10T20:00:00.000Z',
  })
  @IsString()
  @IsNotEmpty()
  receivedTimestamp!: string;
}
