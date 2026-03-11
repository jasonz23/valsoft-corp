import { ProcessingStatus } from '@prisma/client';
import { EmailIngestionService } from './email-ingestion.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { EmailProcessingService } from './email-processing.service';

describe('EmailIngestionService', () => {
  const mockPrisma = {
    incomingEmail: {
      upsert: jest.fn(),
    },
  } as unknown as PrismaService;

  const mockProcessing = {
    processIncomingEmail: jest.fn(),
  } as unknown as EmailProcessingService;

  const service = new EmailIngestionService(mockPrisma, mockProcessing);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('upserts by messageId and triggers processing', async () => {
    (mockPrisma.incomingEmail.upsert as jest.Mock).mockResolvedValue({
      id: 'incoming-1',
    });
    (mockProcessing.processIncomingEmail as jest.Mock).mockResolvedValue({
      category: 'BUG_REPORT',
      replyDraft:
        'Thanks for reporting this. We are investigating the login issue now.',
      originalEmailMetadata: {
        messageId: 'msg-1',
        subject: 'Cannot log in',
        senderEmail: 'customer@example.com',
        receivedTimestamp: '2026-03-10T20:00:00.000Z',
      },
      processedAt: '2026-03-10T20:00:03.000Z',
      status: ProcessingStatus.PROCESSED,
    });

    const result = await service.ingestEmail({
      subject: 'Cannot log in',
      body: 'I am locked out',
      senderEmail: 'customer@example.com',
      messageId: 'msg-1',
      receivedTimestamp: '2026-03-10T20:00:00.000Z',
    });

    expect(mockPrisma.incomingEmail.upsert).toHaveBeenCalledTimes(1);
    expect(mockProcessing.processIncomingEmail).toHaveBeenCalledWith(
      'incoming-1',
    );
    expect(result.status).toBe(ProcessingStatus.PROCESSED);
  });

  it('normalizes Gmail internalDate millisecond timestamp', async () => {
    (mockPrisma.incomingEmail.upsert as jest.Mock).mockResolvedValue({
      id: 'incoming-2',
    });
    (mockProcessing.processIncomingEmail as jest.Mock).mockResolvedValue({
      category: 'GENERAL_QUESTION',
      replyDraft: 'Thanks for your question. We will follow up shortly.',
      originalEmailMetadata: {
        messageId: 'msg-2',
        subject: 'Question',
        senderEmail: 'customer@example.com',
        receivedTimestamp: '2026-03-10T20:00:00.000Z',
      },
      processedAt: '2026-03-10T20:00:03.000Z',
      status: ProcessingStatus.PROCESSED,
    });

    await service.ingestEmail({
      subject: 'Question',
      body: 'Can you help?',
      senderEmail: 'customer@example.com',
      messageId: 'msg-2',
      receivedTimestamp: '1710187200000',
    });

    const callArgs = (mockPrisma.incomingEmail.upsert as jest.Mock).mock
      .calls[0][0];
    expect(callArgs.create.receivedTimestamp).toBeInstanceOf(Date);
  });

  it('rejects suspicious messageId values with unsupported characters', async () => {
    await expect(
      service.ingestEmail({
        subject: 'Question',
        body: 'Can you help?',
        senderEmail: 'customer@example.com',
        messageId: 'msg-2; DROP TABLE users',
        receivedTimestamp: '1710187200000',
      }),
    ).rejects.toThrow('messageId contains unsupported characters');
  });
});
