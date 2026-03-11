import { Module } from '@nestjs/common';
import { OpenAiModule } from '../openai/openai.module';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { EmailIngestionService } from './email-ingestion.service';
import { EmailProcessingService } from './email-processing.service';

@Module({
  imports: [OpenAiModule],
  controllers: [EmailsController],
  providers: [EmailsService, EmailIngestionService, EmailProcessingService],
  exports: [EmailProcessingService],
})
export class EmailsModule {}
