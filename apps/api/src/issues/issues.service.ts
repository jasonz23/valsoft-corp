import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  type AiCategory,
  type Issue,
  type IssueNote,
  type IssueStatus,
  type Prisma,
} from '@prisma/client';
import { CreateIssueNoteDto } from './dto/create-issue-note.dto';
import { ListIssuesQueryDto } from './dto/list-issues-query.dto';
import { UpdateIssueCategoryDto } from './dto/update-issue-category.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListIssuesQueryDto) {
    const where: Prisma.IssueWhereInput = {
      ...(query.status ? { status: query.status as IssueStatus } : {}),
      ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
      incomingEmail: {
        ...(query.aiCategory
          ? { aiCategory: query.aiCategory as AiCategory }
          : {}),
      },
    };

    return this.prisma.issue.findMany({
      where,
      include: {
        assignee: true,
        incomingEmail: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const issue = await this.prisma.issue.findUnique({
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

    if (!issue) {
      throw new NotFoundException(`Issue ${id} was not found`);
    }

    return issue;
  }

  async update(id: string, payload: UpdateIssueDto): Promise<Issue> {
    await this.ensureExists(id);

    return this.prisma.issue.update({
      where: { id },
      data: {
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.description !== undefined
          ? { description: payload.description }
          : {}),
        ...(payload.status !== undefined
          ? { status: payload.status as IssueStatus }
          : {}),
        ...(payload.assigneeId !== undefined
          ? { assigneeId: payload.assigneeId || null }
          : {}),
      },
    });
  }

  async addNote(id: string, payload: CreateIssueNoteDto): Promise<IssueNote> {
    await this.ensureExists(id);

    return this.prisma.issueNote.create({
      data: {
        issueId: id,
        content: payload.content,
        authorId: payload.authorId,
      },
    });
  }

  async listNotes(id: string) {
    await this.ensureExists(id);

    return this.prisma.issueNote.findMany({
      where: { issueId: id },
      include: {
        author: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCategory(id: string, payload: UpdateIssueCategoryDto) {
    const issue = await this.prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      throw new NotFoundException(`Issue ${id} was not found`);
    }

    return this.prisma.incomingEmail.update({
      where: { id: issue.incomingEmailId },
      data: {
        aiCategory: payload.aiCategory as AiCategory,
      },
    });
  }

  private async ensureExists(id: string): Promise<void> {
    const existing = await this.prisma.issue.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Issue ${id} was not found`);
    }
  }
}
