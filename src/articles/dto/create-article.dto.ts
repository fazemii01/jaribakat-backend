import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsOptional()
  contentBlocks?: any; // can be string or JSON array from frontend

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  authorRole?: string;

  @IsString()
  @IsOptional()
  readingTime?: string;

  @IsString()
  @IsOptional()
  status?: 'draft' | 'published';

  @IsOptional()
  publishedAt?: Date | string;
}
