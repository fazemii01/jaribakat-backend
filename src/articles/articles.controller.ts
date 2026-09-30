import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @ApiOperation({ summary: 'Get all articles (Public with filters)' })
  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.articlesService.findAll({ status, category, search });
  }

  @ApiOperation({ summary: 'Get article by slug (Public)' })
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const article = await this.articlesService.findBySlug(slug);
    // Auto increment views asynchronously
    this.articlesService.incrementViews(slug);
    return article;
  }

  @ApiOperation({ summary: 'Get single article by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @ApiOperation({ summary: 'Record article view count' })
  @Post(':id/view')
  async recordView(@Param('id') id: string) {
    await this.articlesService.incrementViews(id);
    return { success: true };
  }

  @ApiOperation({ summary: 'Create new article (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateArticleDto) {
    return this.articlesService.create(createDto);
  }

  @ApiOperation({ summary: 'Update article (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete article (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }
}
