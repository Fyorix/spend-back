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

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary', example: 'file.jpg', required: true })
  file!: Express.Multer.File;
}

@ApiTags('File')
@Controller('files')
export class FileGatewayController {
  constructor(private readonly fileService: FileGatewayService) {}

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
}
