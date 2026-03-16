import { IUserRepository, USER_REPOSITORY } from '../../core/port/user.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../core/services/auth.service';
import { UserEntity } from '../../core/entities/user.entity';
import { Test } from '@nestjs/testing';
import { ACCESS_TOKEN_DURATION } from '../../module/user.constants';
import { InvalidCredentialsException, UnexpectedErrorException } from '../../core/errors';

type JwtServiceMock = jest.Mocked<Pick<JwtService, 'signAsync'>>;

describe('AuthService', () => {
    let authService: AuthService;
    let jwtService: JwtServiceMock;
    let userRepository: jest.Mocked<IUserRepository>;
    const accessTokenDuration = 3600;

    const user: UserEntity = {
        id: 'eadbb0a9-9969-4a53-8c24-c03586de2f78',
        email: 'clement.pasteau@epita.fr',
        password: 'Password123#!@',
    };

     beforeEach(async () => {
        const mockUserRepository: jest.Mocked<IUserRepository> = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            deleteById: jest.fn(),
        };

        const mockJwtService: JwtServiceMock = {
            signAsync: jest.fn(),
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: USER_REPOSITORY, useValue: mockUserRepository },
                { provide: ACCESS_TOKEN_DURATION, useValue: accessTokenDuration },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        authService = moduleRef.get<AuthService>(AuthService);
        userRepository = moduleRef.get<jest.Mocked<IUserRepository>>(USER_REPOSITORY);
        jwtService = moduleRef.get<JwtServiceMock>(JwtService);
    });

    describe('login', () => {
        it('should return a token response when credentials are valid', async () => {
            userRepository.findByEmail.mockResolvedValue(user);
            jwtService.signAsync.mockResolvedValue('mocked-jwt-token');

            const result = await authService.login({
                email: user.email,
                password: user.password,
            });

            expect(result).toEqual({
                accessToken: 'mocked-jwt-token',
                expiresIn: accessTokenDuration,
            });
            expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
            expect(jwtService.signAsync).toHaveBeenCalledWith(
                { sub: user.id },
                { expiresIn: accessTokenDuration },
            );
        });

        it('should throw InvalidCredentialsException when user does not exist', async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            await expect(
                authService.login({ email: user.email, password: user.password }),
            ).rejects.toThrow(InvalidCredentialsException);
            expect(jwtService.signAsync).not.toHaveBeenCalled();
        });

        it('should throw InvalidCredentialsException when password is invalid', async () => {
            userRepository.findByEmail.mockResolvedValue({ ...user, password: 'other-password' });

            await expect(
                authService.login({ email: user.email, password: user.password }),
            ).rejects.toThrow(InvalidCredentialsException);
            expect(jwtService.signAsync).not.toHaveBeenCalled();
        });

        it('should throw UnexpectedErrorException when user id is missing', async () => {
            userRepository.findByEmail.mockResolvedValue({ ...user, id: undefined });

            await expect(
                authService.login({ email: user.email, password: user.password }),
            ).rejects.toThrow(UnexpectedErrorException);
            expect(jwtService.signAsync).not.toHaveBeenCalled();
        });
    });
});