import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConnectUserDto } from '../dtos/user-connect.dto';
import { UserService } from 'src/core/services/user.service';

@ApiTags('User')
@Controller('user')
export default class UserController {
  constructor(private readonly logger: Logger,
              private readonly userService: UserService) {
  }

  @ApiOperation({summary: 'Register a new user'})
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Post('register')
  @HttpCode(201)
  @ApiBody({ type: ConnectUserDto })
  async register(@Body() userConnectDto: ConnectUserDto) {
    this.logger.log(`Registering user with email ${userConnectDto.email}`);
    await this.userService.register(userConnectDto);
  }

  @ApiOperation({summary: 'Login an existing user'})
  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: ConnectUserDto })
  async login(@Body() userConnectDto: ConnectUserDto) {
    this.logger.log(`Logging in user with email ${userConnectDto.email}`);
    return await this.userService.login(userConnectDto);
  }

  @ApiOperation({summary: 'Fetch a user by ID'})
  @Get('/:id')
  @HttpCode(200)
  async getUser(@Param('id') id: string) {
    this.logger.log(`Fetching user with ID ${id}`);
    return this.userService.getUserById(id);
  }

  @ApiOperation({summary: 'Delete a user by ID'})
  @Delete('/:id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    this.logger.log(`Deleting user with ID ${id}`);
    await this.userService.deleteUserById(id);
  }
}
