import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @ApiOperation({ summary: 'Get all pages (Public)' })
  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    return this.pagesService.findAll(activeOnly === 'true');
  }

  @ApiOperation({ summary: 'Get page by slug (Public)' })
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @ApiOperation({ summary: 'Get single page by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create page (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreatePageDto) {
    return this.pagesService.create(createDto);
  }

  @ApiOperation({ summary: 'Update page (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdatePageDto) {
    return this.pagesService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete page (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}
