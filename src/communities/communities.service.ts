import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
  ) {}

  async findAll(activeOnly = false): Promise<Community[]> {
    const where = activeOnly ? { isActive: true } : {};
    return this.communityRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Community> {
    const community = await this.communityRepository.findOne({ where: { id } });
    if (!community) {
      throw new NotFoundException(`Community #${id} not found`);
    }
    return community;
  }

  async create(createDto: CreateCommunityDto): Promise<Community> {
    const community = this.communityRepository.create(createDto);
    return this.communityRepository.save(community);
  }

  async update(id: string, updateDto: UpdateCommunityDto): Promise<Community> {
    const community = await this.findOne(id);
    Object.assign(community, updateDto);
    return this.communityRepository.save(community);
  }

  async remove(id: string): Promise<void> {
    const community = await this.findOne(id);
    await this.communityRepository.remove(community);
  }
}
