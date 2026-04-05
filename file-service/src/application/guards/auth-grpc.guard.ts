import { CanActivate, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';

interface JwtPayload {
  sub: string;
  [key: string]: any;
}

@Injectable()
export class AuthGrpcGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rpcContext = context.switchToRpc();
    const request = rpcContext.getContext<Metadata>();
    const authHeader = request.get('authorization')[0]?.toString();
    if (!authHeader) {
      throw new UnauthorizedException('Token is missing');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const metadata = context.switchToRpc().getContext<Metadata>();
      metadata.set('userId', payload.sub);
      return true;
    } catch {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
