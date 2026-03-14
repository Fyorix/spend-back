import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import UserController from 'src/controllers/user.controller';
import { USER_REPOSITORY } from 'src/core/port/user.repository';
import { AuthService } from 'src/core/services/auth.service';
import { UserService } from 'src/core/services/user.service';
import { loadEnvConfig } from 'src/config/env.config';
import { UserModel } from 'src/infra/models/user.model';
import { TypeormUserRepository } from 'src/infra/persistence/typeorm-user.repository';
import { ACCESS_TOKEN_DURATION } from './user.constants';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    }),
  ],
  controllers: [UserController],
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
    }
  ],
  exports: [],
})
export class UserModule {}
