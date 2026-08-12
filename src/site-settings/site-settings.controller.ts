import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SiteSettingsService } from './site-settings.service';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Site Settings')
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly settingsService: SiteSettingsService) {}

  @ApiOperation({ summary: 'Get all site settings (Public)' })
  @Get()
  async getAll() {
    return this.settingsService.getAll();
  }

  @ApiOperation({ summary: 'Update site settings (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put()
  async update(@Body() dto: UpdateSiteSettingsDto) {
    return this.settingsService.updateSettings(dto.settings);
  }
}
