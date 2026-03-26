import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { loadS3Config } from 'src/config/env.config.js';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(S3Service.name);

  constructor() {
    const s3Config = loadS3Config();
    this.s3Client = new S3Client({
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
      forcePathStyle: true,
    });
    this.bucketName = s3Config.bucketName;
  }

  async putObject(
    minioKey: string,
    body: Buffer,
    mimeType: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: minioKey,
      Body: body,
      ContentType: mimeType,
    });
    try {
      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully: ${minioKey}`);
    } catch (error) {
      this.logger.error(
        `Error uploading file ${minioKey} in MinIO: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
