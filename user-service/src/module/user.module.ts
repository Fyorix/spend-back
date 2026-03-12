import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserController from 'src/controllers/user.controller';
import { USER_REPOSITORY } from 'src/core/port/user.repository';
import { UserService } from 'src/core/services/user.service';
import { UserModel } from 'src/infra/models/user.model';
import { TypeormUserRepository } from 'src/infra/persistence/typeorm-user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel])],
  controllers: [UserController],
  providers: [
    Logger,
    UserService,
    TypeormUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: TypeormUserRepository,
    },
  ],
  exports: []
})
export class UserModule {}
