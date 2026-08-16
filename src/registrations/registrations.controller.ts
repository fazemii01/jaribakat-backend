import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { RegistrationStatus } from './entities/registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Registrations')
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @ApiOperation({ summary: 'Submit registration form (Public)' })
  @Post()
  async create(@Body() createDto: CreateRegistrationDto) {
    return this.registrationsService.create(createDto);
  }

  @ApiOperation({ summary: 'Get all registrations (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('status') status?: RegistrationStatus,
    @Query('programType') programType?: string,
  ) {
    return this.registrationsService.findAll(status, programType);
  }

  @ApiOperation({ summary: 'Get single registration by ID (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update registration status or notes (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateRegistrationDto) {
    return this.registrationsService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete registration (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.registrationsService.remove(id);
  }
}
