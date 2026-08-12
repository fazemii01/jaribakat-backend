import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FooterService } from './footer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Footer')
@Controller('footer')
export class FooterController {
  constructor(private readonly footerService: FooterService) {}

  @ApiOperation({ summary: 'Get all footer sections & links (Public)' })
  @Get()
  async findAll() {
    return this.footerService.findAll();
  }

  @ApiOperation({ summary: 'Create footer section (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sections')
  async createSection(@Body() body: { title: string; sortOrder?: number }) {
    return this.footerService.createSection(body.title, body.sortOrder);
  }

  @ApiOperation({ summary: 'Update footer section (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('sections/:id')
  async updateSection(@Param('id') id: string, @Body() body: { title: string; sortOrder?: number }) {
    return this.footerService.updateSection(id, body.title, body.sortOrder);
  }

  @ApiOperation({ summary: 'Delete footer section (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('sections/:id')
  async removeSection(@Param('id') id: string) {
    return this.footerService.removeSection(id);
  }

  @ApiOperation({ summary: 'Add link to footer section (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sections/:id/links')
  async addLink(@Param('id') id: string, @Body() body: { label: string; href: string; external?: boolean; sortOrder?: number }) {
    return this.footerService.addLink(id, body.label, body.href, body.external, body.sortOrder);
  }

  @ApiOperation({ summary: 'Delete footer link (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('links/:linkId')
  async removeLink(@Param('linkId') linkId: string) {
    return this.footerService.removeLink(linkId);
  }
}
