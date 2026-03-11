import {
  AiCategory,
  EmailResponseStatus,
  IncomingEmail,
  IssueStatus,
  ProcessingStatus,
} from '@prisma/client';
import { AI_CATEGORY_LABELS } from '@valsoft/shared';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAiService } from '../openai/openai.service';
import { IngestEmailResponseDto } from './dto/ingest-email-response.dto';

export class EmailProcessingError extends Error {}

@Injectable()
export class EmailProcessingService {
  private readonly logger = new Logger(EmailProcessingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openAiService: OpenAiService,
  ) {}

  async processIncomingEmail(
    incomingEmailId: string,
  ): Promise<IngestEmailResponseDto> {
    await this.prisma.incomingEmail.update({
      where: { id: incomingEmailId },
      data: {
        processingStatus: ProcessingStatus.PROCESSING,
        processingError: null,
      },
    });

    const incomingEmail = await this.prisma.incomingEmail.findUnique({
      where: { id: incomingEmailId },
    });

    if (!incomingEmail) {
      throw new EmailProcessingError(
        `Incoming email ${incomingEmailId} does not exist`,
      );
    }

    try {
      this.logger.log(`Processing incoming email ${incomingEmail.messageId}`);

      const aiResult = await this.openAiService.classifyEmail({
        subject: incomingEmail.subject,
        senderEmail: incomingEmail.senderEmail,
        body: incomingEmail.body,
      });

      const processedAt = new Date();

      await this.prisma.$transaction(async (tx) => {
        await tx.incomingEmail.update({
          where: { id: incomingEmail.id },
          data: {
            aiCategory: aiResult.category,
            replyDraft: aiResult.replyDraft,
            aiModel: this.openAiService.getModel(),
            promptVersion: this.openAiService.getPromptVersion(),
            processedAt,
            processingStatus: ProcessingStatus.PROCESSED,
            processingError: null,
          },
        });

        await tx.emailResponse.upsert({
          where: { incomingEmailId: incomingEmail.id },
          create: {
            incomingEmailId: incomingEmail.id,
            status: EmailResponseStatus.FOR_APPROVAL,
            draft: aiResult.replyDraft,
          },
          update: {
            draft: aiResult.replyDraft,
          },
        });

        await tx.issue.upsert({
          where: { incomingEmailId: incomingEmail.id },
          create: {
            incomingEmailId: incomingEmail.id,
            title: this.buildIssueTitle(
              incomingEmail.subject,
              aiResult.category,
            ),
            description: this.buildIssueDescription(incomingEmail),
            status: IssueStatus.NOT_STARTED,
          },
          update: {
            title: this.buildIssueTitle(
              incomingEmail.subject,
              aiResult.category,
            ),
            description: this.buildIssueDescription(incomingEmail),
          },
        });
      });

      return {
        category: aiResult.category,
        replyDraft: aiResult.replyDraft,
        originalEmailMetadata: {
          messageId: incomingEmail.messageId,
          subject: incomingEmail.subject,
          senderEmail: incomingEmail.senderEmail,
          receivedTimestamp: incomingEmail.receivedTimestamp.toISOString(),
        },
        processedAt: processedAt.toISOString(),
        status: ProcessingStatus.PROCESSED,
      };
    } catch (error) {
      const normalizedErrorMessage =
        error instanceof Error ? error.message : 'Unknown processing error';

      this.logger.error(
        `Failed processing incoming email ${incomingEmail.messageId}: ${normalizedErrorMessage}`,
      );

      await this.prisma.incomingEmail.update({
        where: { id: incomingEmail.id },
        data: {
          processingStatus: ProcessingStatus.FAILED,
          processingError: normalizedErrorMessage,
        },
      });

      throw new InternalServerErrorException(
        'Failed to process incoming email',
      );
    }
  }

  private buildIssueTitle(subject: string, category: AiCategory): string {
    return `[${AI_CATEGORY_LABELS[category]}] ${subject}`;
  }

  private buildIssueDescription(incomingEmail: IncomingEmail): string {
    return `Sender: ${incomingEmail.senderEmail}\n\n${incomingEmail.body}`;
  }
}
