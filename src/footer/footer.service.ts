import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FooterSection } from './entities/footer-section.entity';
import { FooterLink } from './entities/footer-link.entity';

@Injectable()
export class FooterService {
  constructor(
    @InjectRepository(FooterSection)
    private readonly sectionRepository: Repository<FooterSection>,
    @InjectRepository(FooterLink)
    private readonly linkRepository: Repository<FooterLink>,
  ) {}

  async findAll(): Promise<FooterSection[]> {
    return this.sectionRepository.find({
      order: { sortOrder: 'ASC' },
      relations: { links: true },
    });
  }

  async createSection(title: string, sortOrder = 0): Promise<FooterSection> {
    const section = this.sectionRepository.create({ title, sortOrder });
    return this.sectionRepository.save(section);
  }

  async updateSection(id: string, title: string, sortOrder?: number): Promise<FooterSection> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) throw new NotFoundException(`Footer section #${id} not found`);
    section.title = title;
    if (sortOrder !== undefined) section.sortOrder = sortOrder;
    return this.sectionRepository.save(section);
  }

  async removeSection(id: string): Promise<void> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) throw new NotFoundException(`Footer section #${id} not found`);
    await this.sectionRepository.remove(section);
  }

  async addLink(sectionId: string, label: string, href: string, external = false, sortOrder = 0): Promise<FooterLink> {
    const section = await this.sectionRepository.findOne({ where: { id: sectionId } });
    if (!section) throw new NotFoundException(`Footer section #${sectionId} not found`);
    const link = this.linkRepository.create({ label, href, external, sortOrder, section });
    return this.linkRepository.save(link);
  }

  async removeLink(linkId: string): Promise<void> {
    const link = await this.linkRepository.findOne({ where: { id: linkId } });
    if (!link) throw new NotFoundException(`Footer link #${linkId} not found`);
    await this.linkRepository.remove(link);
  }
}
