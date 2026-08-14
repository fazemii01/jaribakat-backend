import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @ApiOperation({ summary: 'Get all video testimonials (Public)' })
  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    return this.testimonialsService.findAll(activeOnly === 'true');
  }

  @ApiOperation({ summary: 'Get single video testimonial by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create video testimonial (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateTestimonialDto) {
    return this.testimonialsService.create(createDto);
  }

  @ApiOperation({ summary: 'Update video testimonial (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete video testimonial (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}
