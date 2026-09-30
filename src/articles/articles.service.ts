import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async findAll(options?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<Article[]> {
    const where: FindOptionsWhere<Article> = {};

    if (options?.status && options.status !== 'all') {
      where.status = options.status as 'draft' | 'published';
    }

    if (options?.category && options.category !== 'Semua') {
      where.category = options.category;
    }

    if (options?.search) {
      where.title = Like(`%${options.search}%`);
    }

    return this.articleRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    if (!article) {
      throw new NotFoundException(`Article with slug '${slug}' not found`);
    }
    return article;
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article #${id} not found`);
    }
    return article;
  }

  async create(createDto: CreateArticleDto): Promise<Article> {
    let finalSlug = createDto.slug ? generateSlug(createDto.slug) : generateSlug(createDto.title);
    if (!finalSlug) {
      finalSlug = `artikel-${Date.now()}`;
    }

    // Ensure unique slug
    const existing = await this.articleRepository.findOne({ where: { slug: finalSlug } });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    let serializedBlocks = '';
    if (typeof createDto.contentBlocks === 'string') {
      serializedBlocks = createDto.contentBlocks;
    } else if (Array.isArray(createDto.contentBlocks) || typeof createDto.contentBlocks === 'object') {
      serializedBlocks = JSON.stringify(createDto.contentBlocks);
    }

    const publishedAt =
      createDto.status === 'published'
        ? createDto.publishedAt
          ? new Date(createDto.publishedAt)
          : new Date()
        : undefined;

    const article = this.articleRepository.create({
      ...createDto,
      slug: finalSlug,
      contentBlocks: serializedBlocks,
      status: createDto.status || 'published',
      publishedAt,
    });

    return this.articleRepository.save(article);
  }

  async update(id: string, updateDto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);

    let serializedBlocks = article.contentBlocks;
    if (updateDto.contentBlocks !== undefined) {
      if (typeof updateDto.contentBlocks === 'string') {
        serializedBlocks = updateDto.contentBlocks;
      } else {
        serializedBlocks = JSON.stringify(updateDto.contentBlocks);
      }
    }

    let finalSlug = article.slug;
    if (updateDto.slug && updateDto.slug !== article.slug) {
      finalSlug = generateSlug(updateDto.slug);
      const existing = await this.articleRepository.findOne({ where: { slug: finalSlug } });
      if (existing && existing.id !== id) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    let publishedAt = article.publishedAt;
    if (updateDto.status === 'published' && (!article.publishedAt || article.status === 'draft')) {
      publishedAt = new Date();
    }

    Object.assign(article, {
      ...updateDto,
      slug: finalSlug,
      contentBlocks: serializedBlocks,
      publishedAt,
    });

    return this.articleRepository.save(article);
  }

  async remove(id: string): Promise<void> {
    const article = await this.findOne(id);
    await this.articleRepository.remove(article);
  }

  async incrementViews(slugOrId: string): Promise<void> {
    try {
      const article = await this.articleRepository.findOne({
        where: [{ slug: slugOrId }, { id: slugOrId }],
      });
      if (article) {
        article.views = (article.views || 0) + 1;
        await this.articleRepository.save(article);
      }
    } catch (err) {
      // Non-critical, ignore
    }
  }
}
