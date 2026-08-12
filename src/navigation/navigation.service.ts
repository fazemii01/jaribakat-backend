import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NavItem } from './entities/nav-item.entity';
import { NavChild } from './entities/nav-child.entity';

@Injectable()
export class NavigationService {
  constructor(
    @InjectRepository(NavItem)
    private readonly navItemRepository: Repository<NavItem>,
    @InjectRepository(NavChild)
    private readonly navChildRepository: Repository<NavChild>,
  ) {}

  async findAll(type = 'navbar', activeOnly = false): Promise<NavItem[]> {
    const where: any = { type };
    if (activeOnly) where.isActive = true;

    return this.navItemRepository.find({
      where,
      order: { sortOrder: 'ASC' },
      relations: { children: true },
    });
  }

  async createItem(data: Partial<NavItem>): Promise<NavItem> {
    const item = this.navItemRepository.create(data);
    return this.navItemRepository.save(item);
  }

  async updateItem(id: string, data: Partial<NavItem>): Promise<NavItem> {
    const item = await this.navItemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Nav item #${id} not found`);
    Object.assign(item, data);
    return this.navItemRepository.save(item);
  }

  async removeItem(id: string): Promise<void> {
    const item = await this.navItemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Nav item #${id} not found`);
    await this.navItemRepository.remove(item);
  }

  async addChild(parentId: string, data: Partial<NavChild>): Promise<NavChild> {
    const parent = await this.navItemRepository.findOne({ where: { id: parentId } });
    if (!parent) throw new NotFoundException(`Nav item #${parentId} not found`);
    const child = this.navChildRepository.create({ ...data, parent });
    return this.navChildRepository.save(child);
  }

  async removeChild(childId: string): Promise<void> {
    const child = await this.navChildRepository.findOne({ where: { id: childId } });
    if (!child) throw new NotFoundException(`Nav child #${childId} not found`);
    await this.navChildRepository.remove(child);
  }
}
