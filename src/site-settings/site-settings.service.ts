import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from './entities/site-setting.entity';

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectRepository(SiteSetting)
    private readonly settingRepository: Repository<SiteSetting>,
  ) {}

  async getAll(): Promise<Record<string, string>> {
    const settings = await this.settingRepository.find();
    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  }

  async getByGroup(group: string): Promise<Record<string, string>> {
    const settings = await this.settingRepository.find({ where: { group } });
    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  }

  async updateSettings(settings: Record<string, string>, group = 'general'): Promise<Record<string, string>> {
    for (const [key, value] of Object.entries(settings)) {
      await this.settingRepository.save({
        key,
        value: String(value),
        group,
      });
    }
    return this.getAll();
  }
}
