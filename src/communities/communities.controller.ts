import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Communities')
@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @ApiOperation({ summary: 'Get all communities (Public)' })
  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    return this.communitiesService.findAll(activeOnly === 'true');
  }

  @ApiOperation({ summary: 'Get single community by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.communitiesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create community (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateCommunityDto) {
    return this.communitiesService.create(createDto);
  }

  @ApiOperation({ summary: 'Update community (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateCommunityDto) {
    return this.communitiesService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete community (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.communitiesService.remove(id);
  }
}
