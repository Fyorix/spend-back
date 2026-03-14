import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_DURATION } from 'src/module/user.constants';
import { TokenResponseDto } from 'src/dtos/token-response.dto';
import { type IUserRepository, USER_REPOSITORY } from '../port/user.repository';
import { UserEntity } from '../entities/user.entity';
import {
  InvalidPasswordException,
  UnexpectedErrorException,
  UserNotFoundException,
} from '../errors';
import { UserConnectDto } from 'src/dtos/user-connect.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(ACCESS_TOKEN_DURATION) private readonly accessTokenDuration: number,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async generateAccessToken(
    userConnectDto: UserConnectDto,
  ): Promise<TokenResponseDto> {
    const user: UserEntity | null = await this.userRepository.findByEmail(
      userConnectDto.email,
    );
    if (!user) {
      throw new UserNotFoundException(userConnectDto.email);
    }
    if (user.password !== userConnectDto.password) {
      throw new InvalidPasswordException(userConnectDto.email);
    }
    if (!user.id) {
      throw new UnexpectedErrorException(
        `Access token generation: user Id is missing`,
      );
    }
    const payload = { sub: user.id };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.accessTokenDuration,
    });
    return { accessToken: token, expiresIn: this.accessTokenDuration };
  }

  /**
   * This method is intended to generate an internal token for service-to-service communication.
   * not implemented yet, as it requires a more complex setup with service identities and permissions.
   */
  async generateInternalToken(_serviceId: string): Promise<void> {
    throw new NotImplementedException(
      'Internal token generation not implemented yet',
    );
  }
}
