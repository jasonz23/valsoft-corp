import { BadRequestException, Injectable } from '@nestjs/common';
import { ProcessingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IngestEmailDto } from './dto/ingest-email.dto';
import { IngestEmailResponseDto } from './dto/ingest-email-response.dto';
import { EmailProcessingService } from './email-processing.service';

const MAX_SUBJECT_LENGTH = 200;
const MAX_BODY_LENGTH = 20_000;
const MAX_SENDER_EMAIL_LENGTH = 320;
const MAX_MESSAGE_ID_LENGTH = 255;
const MESSAGE_ID_ALLOWED_REGEX = /^[A-Za-z0-9._@:+-]+$/;

type SanitizedIngestPayload = {
  subject: string;
  body: string;
  senderEmail: string;
  messageId: string;
  receivedTimestamp: Date;
};

@Injectable()
export class EmailIngestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly processingService: EmailProcessingService,
  ) {}

  async ingestEmail(payload: IngestEmailDto): Promise<IngestEmailResponseDto> {
    const sanitizedPayload = this.sanitizePayload(payload);

    const incomingEmail = await this.prisma.incomingEmail.upsert({
      where: { messageId: sanitizedPayload.messageId },
      create: {
        messageId: sanitizedPayload.messageId,
        senderEmail: sanitizedPayload.senderEmail,
        subject: sanitizedPayload.subject,
        body: sanitizedPayload.body,
        receivedTimestamp: sanitizedPayload.receivedTimestamp,
        processingStatus: ProcessingStatus.RECEIVED,
      },
      update: {
        senderEmail: sanitizedPayload.senderEmail,
        subject: sanitizedPayload.subject,
        body: sanitizedPayload.body,
        receivedTimestamp: sanitizedPayload.receivedTimestamp,
        processingStatus: ProcessingStatus.RECEIVED,
        processingError: null,
        processedAt: null,
      },
    });

    return this.processingService.processIncomingEmail(incomingEmail.id);
  }

  private sanitizePayload(payload: IngestEmailDto): SanitizedIngestPayload {
    const subject = this.sanitizeText(
      payload.subject,
      MAX_SUBJECT_LENGTH,
    ).trim();
    const body = this.sanitizeText(payload.body, MAX_BODY_LENGTH).trim();
    const senderEmail = this.sanitizeText(
      payload.senderEmail,
      MAX_SENDER_EMAIL_LENGTH,
    )
      .trim()
      .toLowerCase();
    const messageId = this.sanitizeText(
      payload.messageId,
      MAX_MESSAGE_ID_LENGTH,
    ).trim();

    if (!subject) {
      throw new BadRequestException('subject cannot be empty');
    }

    if (!body) {
      throw new BadRequestException('body cannot be empty');
    }

    if (!senderEmail) {
      throw new BadRequestException('senderEmail cannot be empty');
    }

    if (!messageId) {
      throw new BadRequestException('messageId cannot be empty');
    }

    if (!MESSAGE_ID_ALLOWED_REGEX.test(messageId)) {
      throw new BadRequestException(
        'messageId contains unsupported characters',
      );
    }

    return {
      subject,
      body,
      senderEmail,
      messageId,
      receivedTimestamp: this.normalizeReceivedTimestamp(
        payload.receivedTimestamp,
      ),
    };
  }

  private sanitizeText(value: string, maxLength: number): string {
    const normalized = this.removeUnsafeControlChars(value).replace(
      /\r\n/g,
      '\n',
    );
    if (normalized.length > maxLength) {
      throw new BadRequestException(
        `payload field exceeds ${maxLength} characters`,
      );
    }

    return normalized;
  }

  private removeUnsafeControlChars(value: string): string {
    return [...value]
      .filter((char) => {
        const code = char.charCodeAt(0);
        return (
          code === 0x09 || // Tab
          code === 0x0a || // LF
          code === 0x0d || // CR
          (code >= 0x20 && code !== 0x7f)
        );
      })
      .join('');
  }

  private normalizeReceivedTimestamp(value: string): Date {
    if (/^\d+$/.test(value)) {
      const dateFromMillis = new Date(Number(value));
      if (Number.isNaN(dateFromMillis.getTime())) {
        throw new BadRequestException('receivedTimestamp is invalid');
      }

      return dateFromMillis;
    }

    const dateFromIso = new Date(value);
    if (Number.isNaN(dateFromIso.getTime())) {
      throw new BadRequestException('receivedTimestamp is invalid');
    }

    return dateFromIso;
  }
}
