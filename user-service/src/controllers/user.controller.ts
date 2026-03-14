import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserConnectDto } from '../dtos/user-connect.dto';
import { UserService } from 'src/core/services/user.service';
import { AuthService } from 'src/core/services/auth.service';
import { Public } from 'src/auth/public.decorator';

@ApiTags('User')
@Controller('user')
export default class UserController {
  constructor(
    private readonly logger: Logger,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })

  @Public()
  @Post('register')
  @HttpCode(201)
  @ApiBody({ type: UserConnectDto })
  async register(@Body() userConnectDto: UserConnectDto) {
    this.logger.log(`Registering user with email ${userConnectDto.email}`);
    await this.userService.register(userConnectDto);
  }

  @ApiOperation({ summary: 'Login an existing user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({status: 400, description: 'Invalid input data' })
  @ApiResponse({status: 401, description: 'Invalid credentials' })

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: UserConnectDto })
  async login(@Body() userConnectDto: UserConnectDto) {
    this.logger.log(`Logging in user with email ${userConnectDto.email}`);
    return await this.authService.generateAccessToken(userConnectDto);
  }

  @ApiOperation({ summary: 'Fetch a user by ID' })
  @Get('/:id')
  @HttpCode(200)
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Fetching user with ID ${id}`);
    return this.userService.getUserById(id);
  }

  @ApiOperation({ summary: 'Delete a user by ID' })
  @Delete('/:id')
  @HttpCode(204)
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Deleting user with ID ${id}`);
    await this.userService.deleteUserById(id);
  }
}
