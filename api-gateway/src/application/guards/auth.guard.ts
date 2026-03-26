import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import * as nestCore from '@nestjs/core';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import {
  USER_SERVICE_NAME,
  type UserServiceClient,
} from '@clement.pasteau/contracts';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private userService!: UserServiceClient;

  constructor(
    @Inject('USER_PACKAGE') private readonly client: ClientGrpc,
    private readonly reflector: nestCore.Reflector,
  ) { }

  onModuleInit() {
    this.userService =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const response = await firstValueFrom(
        this.userService.verifyToken({ token }),
      );

      if (!response.isValid || !response.userId) {
        throw new UnauthorizedException('Token is invalid');
      }

      (request as any)['user'] = { id: response.userId };
      return true;
    } catch {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
