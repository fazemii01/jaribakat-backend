import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
  ) {}

  async findAll(activeOnly = false): Promise<Testimonial[]> {
    const where: any = {};
    if (activeOnly) where.isActive = true;

    return this.testimonialRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Testimonial> {
    const item = await this.testimonialRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Testimonial #${id} not found`);
    }
    return item;
  }

  async create(dto: CreateTestimonialDto): Promise<Testimonial> {
    const item = this.testimonialRepository.create(dto);
    return this.testimonialRepository.save(item);
  }

  async update(id: string, dto: UpdateTestimonialDto): Promise<Testimonial> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.testimonialRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.testimonialRepository.remove(item);
  }
}
