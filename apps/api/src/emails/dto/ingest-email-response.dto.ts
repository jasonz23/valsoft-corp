import { ApiProperty } from '@nestjs/swagger';
import { AiCategory, ProcessingStatus } from '@prisma/client';

class OriginalEmailMetadataDto {
  @ApiProperty()
  messageId!: string;

  @ApiProperty()
  subject!: string;

  @ApiProperty()
  senderEmail!: string;

  @ApiProperty()
  receivedTimestamp!: string;
}

export class IngestEmailResponseDto {
  @ApiProperty({ enum: AiCategory })
  category!: AiCategory;

  @ApiProperty()
  replyDraft!: string;

  @ApiProperty({ type: OriginalEmailMetadataDto })
  originalEmailMetadata!: OriginalEmailMetadataDto;

  @ApiProperty()
  processedAt!: string;

  @ApiProperty({ enum: ProcessingStatus })
  status!: ProcessingStatus;
}
