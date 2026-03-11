import { Injectable, NotFoundException } from '@nestjs/common';
import { AiCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.incomingEmail.findMany({
      orderBy: { receivedTimestamp: 'desc' },
      include: {
        emailResponse: {
          include: {
            assignee: true,
            notes: {
              include: {
                author: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        issue: {
          include: {
            assignee: true,
            notes: {
              include: {
                author: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const incomingEmail = await this.prisma.incomingEmail.findUnique({
      where: { id },
      include: {
        emailResponse: {
          include: {
            assignee: true,
            notes: {
              include: { author: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        issue: {
          include: {
            assignee: true,
            notes: {
              include: { author: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!incomingEmail) {
      throw new NotFoundException(`IncomingEmail ${id} was not found`);
    }

    return incomingEmail;
  }

  async updateCategory(id: string, aiCategory: AiCategory) {
    await this.findOne(id);

    return this.prisma.incomingEmail.update({
      where: { id },
      data: { aiCategory },
    });
  }
}
