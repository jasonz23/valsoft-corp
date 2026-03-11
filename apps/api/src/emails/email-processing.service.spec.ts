import {
  EmailResponseStatus,
  IssueStatus,
  ProcessingStatus,
} from '@prisma/client';
import { InternalServerErrorException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import type { OpenAiService } from '../openai/openai.service';
import { EmailProcessingService } from './email-processing.service';

describe('EmailProcessingService', () => {
  const mockTx = {
    incomingEmail: { update: jest.fn() },
    emailResponse: { upsert: jest.fn() },
    issue: { upsert: jest.fn() },
  };

  const mockPrisma = {
    incomingEmail: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: typeof mockTx) => unknown) =>
      callback(mockTx),
    ),
  } as unknown as PrismaService;

  const mockOpenAi = {
    classifyEmail: jest.fn(),
    getModel: jest.fn(() => 'gpt-4.1-mini'),
    getPromptVersion: jest.fn(() => 'v1'),
  } as unknown as OpenAiService;

  const service = new EmailProcessingService(mockPrisma, mockOpenAi);

  beforeEach(() => {
    jest.clearAllMocks();
    (mockPrisma.incomingEmail.findUnique as jest.Mock).mockResolvedValue({
      id: 'incoming-1',
      messageId: 'msg-1',
      senderEmail: 'customer@example.com',
      subject: 'Bug in dashboard',
      body: 'The board does not load',
      receivedTimestamp: new Date('2026-03-10T20:00:00.000Z'),
    });
  });

  it('marks lifecycle as PROCESSED and upserts linked records', async () => {
    (mockOpenAi.classifyEmail as jest.Mock).mockResolvedValue({
      category: 'BUG_REPORT',
      replyDraft: 'Thanks for reporting this. We are looking into it now.',
    });

    const result = await service.processIncomingEmail('incoming-1');

    expect(mockPrisma.incomingEmail.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          processingStatus: ProcessingStatus.PROCESSING,
        }),
      }),
    );
    expect(mockTx.emailResponse.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          status: EmailResponseStatus.FOR_APPROVAL,
        }),
      }),
    );
    expect(mockTx.issue.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: IssueStatus.NOT_STARTED }),
      }),
    );
    expect(result.status).toBe(ProcessingStatus.PROCESSED);
  });

  it('marks lifecycle as FAILED when AI processing errors', async () => {
    (mockOpenAi.classifyEmail as jest.Mock).mockRejectedValue(
      new Error('openai timeout'),
    );

    await expect(service.processIncomingEmail('incoming-1')).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(mockPrisma.incomingEmail.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          processingStatus: ProcessingStatus.FAILED,
          processingError: 'openai timeout',
        }),
      }),
    );
  });
});
