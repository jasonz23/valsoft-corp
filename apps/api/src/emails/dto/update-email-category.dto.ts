import { AI_CATEGORIES } from '@valsoft/shared';
import { IsIn } from 'class-validator';

export class UpdateEmailCategoryDto {
  @IsIn(AI_CATEGORIES)
  aiCategory!: (typeof AI_CATEGORIES)[number];
}
