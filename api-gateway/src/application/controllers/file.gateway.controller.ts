import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UnauthorizedException,
  Req,
  Get,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileGatewayService } from '../services/file.gateway.service.js';
import 'multer';
import type { ClientGrpc } from '@nestjs/microservices';
import { FileServiceClient } from '@clement.pasteau/contracts';
import { lastValueFrom } from 'rxjs';

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary', example: 'file.jpg', required: true })
  file!: Express.Multer.File;
}

@ApiTags('File')
@Controller('files')
export class FileGatewayController {
  private fileServiceClient!: FileServiceClient;
  constructor(
    private readonly fileService: FileGatewayService,
    @Inject('FILE_PACKAGE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.fileServiceClient = this.client.getService<FileServiceClient>('FileService');
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiTags('File')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiBody({
    description: 'File to upload',
    type: UploadFileDto,
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiBearerAuth()
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png)$' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() request: any,
  ) {
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    return this.fileService.sendToGrpc(file, token);
  }

  @Get('my-files')
  @ApiOperation({ summary: 'Get user files' })
  @ApiResponse({ status: 200, description: 'List of user files' })
  @ApiBearerAuth()
  async getUserFiles(@Req() request: any) {
    const userId = request.user?.id;

    return await lastValueFrom(this.fileServiceClient.getUserFiles({ userId }));
  }
}
