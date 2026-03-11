import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { PrismaModule } from './prisma/prisma.module';
import { EmailsModule } from './emails/emails.module';
import { EmailResponsesModule } from './email-responses/email-responses.module';
import { IssuesModule } from './issues/issues.module';
import { UsersModule } from './users/users.module';
import { OpenAiModule } from './openai/openai.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), '../../.env'),
      ],
    }),
    PrismaModule,
    OpenAiModule,
    IntegrationsModule,
    EmailsModule,
    EmailResponsesModule,
    IssuesModule,
    UsersModule,
  ],
})
export class AppModule {}
