import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration, RegistrationStatus } from './entities/registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
  ) {}

  async findAll(status?: RegistrationStatus, programType?: string): Promise<Registration[]> {
    const where: any = {};
    if (status) where.status = status;
    if (programType) where.programType = programType;

    return this.registrationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Registration> {
    const item = await this.registrationRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Registration #${id} not found`);
    }
    return item;
  }

  async create(dto: CreateRegistrationDto): Promise<Registration> {
    const item = this.registrationRepository.create(dto);
    return this.registrationRepository.save(item);
  }

  async update(id: string, dto: UpdateRegistrationDto): Promise<Registration> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.registrationRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.registrationRepository.remove(item);
  }
}
