import { Module } from '@nestjs/common';
import { EmailResponsesController } from './email-responses.controller';
import { EmailResponsesService } from './email-responses.service';

@Module({
  controllers: [EmailResponsesController],
  providers: [EmailResponsesService],
  exports: [EmailResponsesService],
})
export class EmailResponsesModule {}
