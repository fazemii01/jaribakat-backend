import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VideoCoursesService } from './video-courses.service';
import { CreateVideoCourseDto } from './dto/create-video-course.dto';
import { UpdateVideoCourseDto } from './dto/update-video-course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Video Courses')
@Controller('video-courses')
export class VideoCoursesController {
  constructor(private readonly videoCoursesService: VideoCoursesService) {}

  @ApiOperation({ summary: 'Get all video courses (Public)' })
  @Get()
  async findAll(@Query('category') category?: string, @Query('activeOnly') activeOnly?: string) {
    return this.videoCoursesService.findAll(category, activeOnly === 'true');
  }

  @ApiOperation({ summary: 'Get single video course by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.videoCoursesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create video course (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateVideoCourseDto) {
    return this.videoCoursesService.create(createDto);
  }

  @ApiOperation({ summary: 'Update video course (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateVideoCourseDto) {
    return this.videoCoursesService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete video course (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.videoCoursesService.remove(id);
  }
}
