import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FAQ } from './entities/faq.entity';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';

@Injectable()
export class FAQsService {
  constructor(
    @InjectRepository(FAQ)
    private readonly faqRepository: Repository<FAQ>,
  ) {}

  async findAll(category?: string, activeOnly = false): Promise<FAQ[]> {
    const where: any = {};
    if (category) where.category = category;
    if (activeOnly) where.isActive = true;

    return this.faqRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FAQ> {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException(`FAQ #${id} not found`);
    }
    return faq;
  }

  async create(createDto: CreateFAQDto): Promise<FAQ> {
    const faq = this.faqRepository.create(createDto);
    return this.faqRepository.save(faq);
  }

  async update(id: string, updateDto: UpdateFAQDto): Promise<FAQ> {
    const faq = await this.findOne(id);
    Object.assign(faq, updateDto);
    return this.faqRepository.save(faq);
  }

  async remove(id: string): Promise<void> {
    const faq = await this.findOne(id);
    await this.faqRepository.remove(faq);
  }
}
