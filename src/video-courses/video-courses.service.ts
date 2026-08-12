import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoCourse } from './entities/video-course.entity';
import { CreateVideoCourseDto } from './dto/create-video-course.dto';
import { UpdateVideoCourseDto } from './dto/update-video-course.dto';

@Injectable()
export class VideoCoursesService {
  constructor(
    @InjectRepository(VideoCourse)
    private readonly videoCourseRepository: Repository<VideoCourse>,
  ) {}

  async findAll(category?: string, activeOnly = false): Promise<VideoCourse[]> {
    const where: any = {};
    if (category) where.category = category;
    if (activeOnly) where.isActive = true;

    return this.videoCourseRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<VideoCourse> {
    const course = await this.videoCourseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Video course #${id} not found`);
    }
    return course;
  }

  async create(createDto: CreateVideoCourseDto): Promise<VideoCourse> {
    const course = this.videoCourseRepository.create(createDto);
    return this.videoCourseRepository.save(course);
  }

  async update(id: string, updateDto: UpdateVideoCourseDto): Promise<VideoCourse> {
    const course = await this.findOne(id);
    Object.assign(course, updateDto);
    return this.videoCourseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.videoCourseRepository.remove(course);
  }
}
