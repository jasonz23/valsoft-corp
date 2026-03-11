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
import { CreateIssueNoteDto } from './dto/create-issue-note.dto';
import { ListIssuesQueryDto } from './dto/list-issues-query.dto';
import { UpdateIssueCategoryDto } from './dto/update-issue-category.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssuesService } from './issues.service';

@ApiTags('issues')
@Controller('issues')
export class IssuesController {
  constructor(private readonly service: IssuesService) {}

  @Get()
  @ApiOperation({ summary: 'List issue workflow records' })
  findAll(@Query() query: ListIssuesQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get issue detail' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update issue fields' })
  update(@Param('id') id: string, @Body() body: UpdateIssueDto) {
    return this.service.update(id, body);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Create issue note' })
  addNote(@Param('id') id: string, @Body() body: CreateIssueNoteDto) {
    return this.service.addNote(id, body);
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'List issue notes' })
  listNotes(@Param('id') id: string) {
    return this.service.listNotes(id);
  }

  @Patch(':id/category')
  @ApiOperation({ summary: 'Update linked incoming email AI category' })
  updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateIssueCategoryDto,
  ) {
    return this.service.updateCategory(id, body);
  }
}
