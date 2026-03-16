import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  type UserServiceController,
  UserServiceControllerMethods,
  type RegisterRequest,
  type EmptyResponse,
  type LoginRequest,
  type TokenResponse,
  type GetUserRequest,
  type UserResponse,
  type DeleteUserRequest,
  USER_SERVICE_NAME,
} from '@clement.pasteau/contracts';
import { UserService } from '../core/services/user.service.js';
import { AuthService } from '../core/services/auth.service.js';
import { UserEntity } from '../core/entities/user.entity.js';

@Controller()
@UserServiceControllerMethods()
export class UserGrpcController implements UserServiceController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @GrpcMethod(USER_SERVICE_NAME, 'register')
  async register(request: RegisterRequest): Promise<EmptyResponse> {
    const user = new UserEntity();
    user.email = request.email;
    user.password = request.password;
    await this.userService.register(user);
    return {};
  }

  @GrpcMethod(USER_SERVICE_NAME, 'login')
  async login(request: LoginRequest): Promise<TokenResponse> {
    const result = await this.authService.login({
      email: request.email,
      password: request.password,
    });
    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    };
  }

  @GrpcMethod(USER_SERVICE_NAME, 'getUser')
  async getUser(request: GetUserRequest): Promise<UserResponse> {
    const user = await this.userService.getUserById(request.id);
    return {
      user: {
        id: user.id || '',
        email: user.email,
        password: '',
      },
    };
  }

  @GrpcMethod(USER_SERVICE_NAME, 'deleteUser')
  async deleteUser(request: DeleteUserRequest): Promise<EmptyResponse> {
    await this.userService.deleteUserById(request.id);
    return {};
  }
}
