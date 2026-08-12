import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Navigation')
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @ApiOperation({ summary: 'Get navigation items (Public)' })
  @Get()
  async findAll(@Query('type') type?: string, @Query('activeOnly') activeOnly?: string) {
    return this.navigationService.findAll(type || 'navbar', activeOnly === 'true');
  }

  @ApiOperation({ summary: 'Create navigation item (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async createItem(@Body() data: any) {
    return this.navigationService.createItem(data);
  }

  @ApiOperation({ summary: 'Update navigation item (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateItem(@Param('id') id: string, @Body() data: any) {
    return this.navigationService.updateItem(id, data);
  }

  @ApiOperation({ summary: 'Delete navigation item (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeItem(@Param('id') id: string) {
    return this.navigationService.removeItem(id);
  }

  @ApiOperation({ summary: 'Add sub-link to navigation item (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/children')
  async addChild(@Param('id') id: string, @Body() data: any) {
    return this.navigationService.addChild(id, data);
  }

  @ApiOperation({ summary: 'Delete sub-link (Protected)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('children/:childId')
  async removeChild(@Param('childId') childId: string) {
    return this.navigationService.removeChild(childId);
  }
}
