import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { loadS3Config } from '../../config/env.config.js';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(S3Service.name);

  constructor() {
    const s3Config = loadS3Config();
    this.logger.log('Initializing S3 Client with config:');
    this.logger.log(`Endpoint: ${s3Config.endpoint}`);
    this.logger.log(`Region: ${s3Config.region}`);
    this.logger.log(`Bucket Name: ${s3Config.bucketName}`);
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

  async onModuleInit() {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName }),
      );
      this.logger.log(`Bucket "${this.bucketName}" already exists.`);
    } catch (error: unknown) {
      if ((error as any).$metadata?.httpStatusCode === 404) {
        this.logger.warn(
          `Bucket "${this.bucketName}" does not exist. Creating...`,
        );
        try {
          await this.s3Client.send(
            new CreateBucketCommand({ Bucket: this.bucketName }),
          );
          this.logger.log(`Bucket "${this.bucketName}" created successfully.`);
        } catch (createError: unknown) {
          this.logError(createError, `Error creating bucket "${this.bucketName}"`);
          throw createError;
        }
      } else {
        this.logError(error, `Error checking bucket "${this.bucketName}" existence`);
        throw error;
      }
    }
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
    } catch (error: unknown) {
      this.logError(error, `Error uploading file "${minioKey}" to bucket "${this.bucketName}"`);
      throw error;
    }
  }

  private logError(error: unknown, message: string) : void{
  if (error instanceof Error) {
    console.error(`${message}: ${error.message}`);
  } else {
    console.error(`${message}:`, error);
  }
}
}
