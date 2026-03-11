import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AiCategory } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailIngestionService } from './email-ingestion.service';
import { EmailsService } from './emails.service';
import { IngestEmailDto } from './dto/ingest-email.dto';
import { IngestEmailResponseDto } from './dto/ingest-email-response.dto';
import { UpdateEmailCategoryDto } from './dto/update-email-category.dto';

@ApiTags('emails')
@Controller('emails')
export class EmailsController {
  constructor(
    private readonly ingestionService: EmailIngestionService,
    private readonly emailsService: EmailsService,
  ) {}

  @Post('ingest')
  @ApiOperation({ summary: 'Ingest a support email from n8n trigger' })
  @ApiResponse({ status: 201, type: IngestEmailResponseDto })
  ingest(@Body() body: IngestEmailDto): Promise<IngestEmailResponseDto> {
    return this.ingestionService.ingestEmail(body);
  }

  @Get()
  @ApiOperation({ summary: 'List incoming emails with linked entities' })
  findAll() {
    return this.emailsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incoming email details' })
  findOne(@Param('id') id: string) {
    return this.emailsService.findOne(id);
  }

  @Patch(':id/category')
  @ApiOperation({ summary: 'Update incoming email AI category' })
  updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateEmailCategoryDto,
  ) {
    return this.emailsService.updateCategory(id, body.aiCategory as AiCategory);
  }
}
