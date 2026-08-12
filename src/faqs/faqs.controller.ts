import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FAQsService } from './faqs.service';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('FAQs')
@Controller('faqs')
export class FAQsController {
  constructor(private readonly faqsService: FAQsService) {}

  @ApiOperation({ summary: 'Get all FAQs (Public)' })
  @Get()
  async findAll(@Query('category') category?: string, @Query('activeOnly') activeOnly?: string) {
    return this.faqsService.findAll(category, activeOnly === 'true');
  }

  @ApiOperation({ summary: 'Get single FAQ by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.faqsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create FAQ (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateFAQDto) {
    return this.faqsService.create(createDto);
  }

  @ApiOperation({ summary: 'Update FAQ (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateFAQDto) {
    return this.faqsService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete FAQ (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.faqsService.remove(id);
  }
}
