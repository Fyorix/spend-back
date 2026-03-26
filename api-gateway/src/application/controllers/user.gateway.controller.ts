import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Delete,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  USER_SERVICE_NAME,
  type UserServiceClient,
  type RegisterRequest,
  type LoginRequest,
  type TokenResponse,
  type UserResponse,
} from '@clement.pasteau/contracts';
import { firstValueFrom } from 'rxjs';
import { Public } from '../decorators/public.decorator.js';

class RegisterDto implements RegisterRequest {
  @ApiProperty({ example: 'johndoe@example.com' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  password!: string;
}

class LoginDto implements LoginRequest {
  @ApiProperty({ example: 'johndoe@example.com' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  password!: string;
}

@ApiTags('User')
@Controller('users')
export class UserGatewayController implements OnModuleInit {
  private userService!: UserServiceClient;

  constructor(
    @Inject('USER_PACKAGE') private readonly client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully, returns access token',
  })
  async register(@Body() request: RegisterDto): Promise<TokenResponse> {
    return firstValueFrom(this.userService.register(request));
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login and get access token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() request: LoginDto): Promise<TokenResponse> {
    return firstValueFrom(this.userService.login(request));
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'User profile found' })
  async getMe(@Req() req: any): Promise<UserResponse> {
    return firstValueFrom(this.userService.getMe({ id: req.user.id }));
  }

  @ApiBearerAuth()
  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'User account deleted' })
  async deleteMe(@Req() req: any): Promise<any> {
    return firstValueFrom(this.userService.deleteUser({ id: req.user.id }));
  }
}
