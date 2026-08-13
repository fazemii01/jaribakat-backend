import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  async onModuleInit() {
    this.bucketName = process.env.MINIO_BUCKET_NAME || 'jaribakat-new';
    const isSecure = process.env.MINIO_SECURE ? process.env.MINIO_SECURE === 'true' : true;
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'storage.alliago.id',
      port: parseInt(process.env.MINIO_PORT || '443', 10),
      useSSL: isSecure,
      accessKey: process.env.MINIO_ACCESS_KEY || 'fazemii',
      secretKey: process.env.MINIO_SECRET_KEY || 'alexandria20',
    });

    await this.ensureBucketAndPublicPolicy();
  }

  async ensureBucketAndPublicPolicy() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName);
        this.logger.log(`Created MinIO bucket: ${this.bucketName}`);
      }

      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };
      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      this.logger.log(`Set MinIO bucket public read policy for: ${this.bucketName}`);
    } catch (err) {
      this.logger.warn(`MinIO bucket policy setup notice: ${err?.message || err}`);
    }
  }

  async uploadBuffer(buffer: Buffer, originalName: string, mimetype = 'image/png', folder = 'uploads'): Promise<string> {
    const fileExtension = originalName.split('.').pop() || 'png';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      buffer,
      buffer.length,
      { 'Content-Type': mimetype },
    );

    const isSecure = process.env.MINIO_SECURE ? process.env.MINIO_SECURE === 'true' : true;
    const protocol = isSecure ? 'https' : 'http';
    const host = process.env.MINIO_ENDPOINT || 'storage.alliago.id';
    return `${protocol}://${host}/${this.bucketName}/${fileName}`;
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    return this.uploadBuffer(file.buffer, file.originalname, file.mimetype, folder);
  }
}
