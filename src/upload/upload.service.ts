import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  onModuleInit() {
    this.bucketName = process.env.MINIO_BUCKET_NAME || 'jaribakat-new';
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'storage.alliago.id',
      port: parseInt(process.env.MINIO_PORT || '443', 10),
      useSSL: process.env.MINIO_SECURE === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'fazemii',
      secretKey: process.env.MINIO_SECRET_KEY || 'alexandria20',
    });
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    const protocol = process.env.MINIO_SECURE === 'true' ? 'https' : 'http';
    const host = process.env.MINIO_ENDPOINT || 'storage.alliago.id';
    return `${protocol}://${host}/${this.bucketName}/${fileName}`;
  }
}
