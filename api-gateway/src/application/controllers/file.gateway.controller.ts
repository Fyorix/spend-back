import {
  Controller,
  Headers,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileGatewayService } from '../services/file.gateway.service.js';
import 'multer';

@ApiTags('File')
@Controller('files')
export class FileGatewayController {
  constructor(private readonly fileService: FileGatewayService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiTags('File')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        userId: {
          type: 'string',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a file' })
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
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    return this.fileService.sendToGrpc(file, token);
  }
}
