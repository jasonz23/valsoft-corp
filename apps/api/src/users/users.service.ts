import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(payload: CreateUserDto) {
    return this.prisma.user.create({
      data: payload,
    });
  }

  async update(id: string, payload: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User ${id} was not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: payload,
    });
  }
}
