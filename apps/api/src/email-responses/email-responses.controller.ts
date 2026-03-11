import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEmailResponseNoteDto } from './dto/create-email-response-note.dto';
import { ListEmailResponsesQueryDto } from './dto/list-email-responses-query.dto';
import { UpdateEmailResponseDto } from './dto/update-email-response.dto';
import { EmailResponsesService } from './email-responses.service';

@ApiTags('email-responses')
@Controller('email-responses')
export class EmailResponsesController {
  constructor(private readonly service: EmailResponsesService) {}

  @Get()
  @ApiOperation({ summary: 'List email response workflow records' })
  findAll(@Query() query: ListEmailResponsesQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email response detail' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update draft, status, assignee' })
  update(@Param('id') id: string, @Body() body: UpdateEmailResponseDto) {
    return this.service.update(id, body);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Create email response note' })
  addNote(@Param('id') id: string, @Body() body: CreateEmailResponseNoteDto) {
    return this.service.addNote(id, body);
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'List email response notes' })
  listNotes(@Param('id') id: string) {
    return this.service.listNotes(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Mark response as approved' })
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Placeholder send action' })
  send(@Param('id') id: string) {
    return this.service.sendPlaceholder(id);
  }
}
