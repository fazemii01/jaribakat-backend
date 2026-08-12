import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { USPsService } from './usps.service';
import { CreateUSPDto } from './dto/create-usp.dto';
import { UpdateUSPDto } from './dto/update-usp.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('USPs')
@Controller('usps')
export class USPsController {
  constructor(private readonly uspsService: USPsService) {}

  @ApiOperation({ summary: 'Get all USPs (Public)' })
  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    return this.uspsService.findAll(activeOnly === 'true');
  }

  @ApiOperation({ summary: 'Get single USP by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.uspsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create USP (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createUspDto: CreateUSPDto) {
    return this.uspsService.create(createUspDto);
  }

  @ApiOperation({ summary: 'Update USP (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUspDto: UpdateUSPDto) {
    return this.uspsService.update(id, updateUspDto);
  }

  @ApiOperation({ summary: 'Delete USP (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.uspsService.remove(id);
  }
}
