import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EmailResponseStatus,
  Prisma,
  type AiCategory,
  type EmailResponse,
  type EmailResponseNote,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmailResponseNoteDto } from './dto/create-email-response-note.dto';
import { ListEmailResponsesQueryDto } from './dto/list-email-responses-query.dto';
import { UpdateEmailResponseDto } from './dto/update-email-response.dto';

@Injectable()
export class EmailResponsesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListEmailResponsesQueryDto) {
    const where: Prisma.EmailResponseWhereInput = {
      ...(query.status ? { status: query.status as EmailResponseStatus } : {}),
      ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
      incomingEmail: {
        ...(query.aiCategory
          ? { aiCategory: query.aiCategory as AiCategory }
          : {}),
        ...(query.senderEmail
          ? {
              senderEmail: {
                contains: query.senderEmail,
                mode: 'insensitive',
              },
            }
          : {}),
        ...(query.search
          ? {
              OR: [
                {
                  subject: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
                {
                  senderEmail: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
      },
    };

    return this.prisma.emailResponse.findMany({
      where,
      include: {
        assignee: true,
        incomingEmail: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const response = await this.prisma.emailResponse.findUnique({
      where: { id },
      include: {
        assignee: true,
        incomingEmail: true,
        notes: {
          include: {
            author: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!response) {
      throw new NotFoundException(`EmailResponse ${id} was not found`);
    }

    return response;
  }

  async update(
    id: string,
    payload: UpdateEmailResponseDto,
  ): Promise<EmailResponse> {
    await this.ensureExists(id);

    return this.prisma.emailResponse.update({
      where: { id },
      data: {
        ...(payload.draft !== undefined ? { draft: payload.draft } : {}),
        ...(payload.status
          ? { status: payload.status as EmailResponseStatus }
          : {}),
        ...(payload.assigneeId !== undefined
          ? { assigneeId: payload.assigneeId || null }
          : {}),
      },
    });
  }

  async addNote(
    id: string,
    payload: CreateEmailResponseNoteDto,
  ): Promise<EmailResponseNote> {
    await this.ensureExists(id);

    return this.prisma.emailResponseNote.create({
      data: {
        emailResponseId: id,
        content: payload.content,
        authorId: payload.authorId,
      },
    });
  }

  async listNotes(id: string) {
    await this.ensureExists(id);

    return this.prisma.emailResponseNote.findMany({
      where: { emailResponseId: id },
      include: {
        author: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string): Promise<EmailResponse> {
    await this.ensureExists(id);

    return this.prisma.emailResponse.update({
      where: { id },
      data: {
        status: EmailResponseStatus.APPROVED,
        approvedAt: new Date(),
      },
    });
  }

  async sendPlaceholder(id: string): Promise<{ message: string; id: string }> {
    await this.ensureExists(id);

    return {
      id,
      message: 'Placeholder send action completed. No outbound email was sent.',
    };
  }

  private async ensureExists(id: string): Promise<void> {
    const existing = await this.prisma.emailResponse.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`EmailResponse ${id} was not found`);
    }
  }
}
