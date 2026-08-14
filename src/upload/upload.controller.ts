import { Controller, Post, Get, Req, Res, UseInterceptors, UploadedFile, BadRequestException, NotFoundException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { UploadService } from './upload.service';
import { AdminAuthGuard } from '../auth/admin-auth.guard';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: 'Upload file to MinIO storage' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const url = await this.uploadService.uploadFile(file);
    return { url, filename: file.originalname, size: file.size };
  }

  @ApiOperation({ summary: 'Stream/view file from MinIO storage' })
  @Get('file/*')
  async getFile(@Req() req: Request, @Res() res: Response) {
    const objectName = req.params[0];
    try {
      const stream = await this.uploadService.getFileStream(objectName);
      stream.pipe(res);
    } catch {
      throw new NotFoundException('File not found');
    }
  }
}
