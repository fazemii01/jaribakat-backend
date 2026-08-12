import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { USP } from './entities/usp.entity';
import { CreateUSPDto } from './dto/create-usp.dto';
import { UpdateUSPDto } from './dto/update-usp.dto';

@Injectable()
export class USPsService {
  constructor(
    @InjectRepository(USP)
    private readonly uspRepository: Repository<USP>,
  ) {}

  async findAll(activeOnly = false): Promise<USP[]> {
    const where = activeOnly ? { isActive: true } : {};
    return this.uspRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<USP> {
    const usp = await this.uspRepository.findOne({ where: { id } });
    if (!usp) {
      throw new NotFoundException(`USP #${id} not found`);
    }
    return usp;
  }

  async create(createUspDto: CreateUSPDto): Promise<USP> {
    const usp = this.uspRepository.create(createUspDto);
    return this.uspRepository.save(usp);
  }

  async update(id: string, updateUspDto: UpdateUSPDto): Promise<USP> {
    const usp = await this.findOne(id);
    Object.assign(usp, updateUspDto);
    return this.uspRepository.save(usp);
  }

  async remove(id: string): Promise<void> {
    const usp = await this.findOne(id);
    await this.uspRepository.remove(usp);
  }
}
