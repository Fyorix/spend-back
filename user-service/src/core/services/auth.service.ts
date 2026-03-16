import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_DURATION } from '../../module/user.constants.js';
import { TokenResponseDto } from '../../dtos/token-response.dto.js';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../port/user.repository.js';
import { UserEntity } from '../entities/user.entity.js';
import {
  InvalidCredentialsException,
  UnexpectedErrorException,
} from '../errors/index.js';
import { UserConnectDto } from '../../dtos/user-connect.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(ACCESS_TOKEN_DURATION) private readonly accessTokenDuration: number,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async login(userConnectDto: UserConnectDto): Promise<TokenResponseDto> {
    const user: UserEntity | null = await this.userRepository.findByEmail(
      userConnectDto.email,
    );
    if (!user || user.password !== userConnectDto.password) {
      throw new InvalidCredentialsException(userConnectDto.email);
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
