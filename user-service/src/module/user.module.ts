import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { UserController } from '../controllers/user.controller.js';
import { UserGrpcController } from '../controllers/user.grpc.controller.js';
import { USER_REPOSITORY } from '../core/port/user.repository.js';
import { AuthService } from '../core/services/auth.service.js';
import { UserService } from '../core/services/user.service.js';
import { loadEnvConfig } from '../config/env.config.js';
import { UserModel } from '../infra/models/user.model.js';
import { TypeormUserRepository } from '../infra/persistence/typeorm-user.repository.js';
import { ACCESS_TOKEN_DURATION } from './user.constants.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    }),
  ],
  controllers: [UserController, UserGrpcController],
  providers: [
    Logger,
    UserService,
    AuthService,
    TypeormUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: TypeormUserRepository,
    },
    {
      provide: ACCESS_TOKEN_DURATION,
      useFactory: () => loadEnvConfig().accessTokenDuration,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [],
})
export class UserModule {}
