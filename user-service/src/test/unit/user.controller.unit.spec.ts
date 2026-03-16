import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { UserController } from '../../controllers/user.controller.js';
import { AuthService } from '../../core/services/auth.service.js';
import { UserEntity } from '../../core/entities/user.entity.js';
import { UserService } from '../../core/services/user.service.js';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
  UserNotFoundException,
} from '../../core/errors/index.js';
import { TokenResponseDto } from '../../dtos/token-response.dto.js';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  let authService: AuthService;

  let basicEntity: UserEntity;

  beforeAll(() => {
    basicEntity = {
      id: 'eadbb0a9-9969-4a53-8c24-c03586de2f78',
      email: 'clement.pasteau@epita.fr',
      password: 'Password123#!@',
    };
  });

  beforeEach(async () => {
    const mockUserService = {
      getUserById: jest.fn(),
      register: jest.fn(),
      deleteUserById: jest.fn(),
    };

    const mockAuthService = {
      login: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    userController = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe('getUser', () => {
    it('should return a user entity', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValue(basicEntity);

      const result = await userController.getUser(basicEntity.id!);
      expect(result).toEqual(basicEntity);
      expect(userService.getUserById).toHaveBeenCalledWith(basicEntity.id!);
    });

    it('should throw an error if the user is not found', async () => {
      const userId = 'non-existent-id';
      jest
        .spyOn(userService, 'getUserById')
        .mockRejectedValue(new UserNotFoundException('User not found'));

      await expect(userController.getUser(userId)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userConnectDto = {
        email: basicEntity.email,
        password: basicEntity.password,
      };
      jest.spyOn(userService, 'register').mockResolvedValue();

      const result = await userController.register(userConnectDto);
      expect(result).toBeUndefined();
      expect(userService.register).toHaveBeenCalledWith(userConnectDto);
    });

    it('should throw an error if the user already exists', async () => {
      const userConnectDto = {
        email: basicEntity.email,
        password: basicEntity.password,
      };
      jest
        .spyOn(userService, 'register')
        .mockRejectedValue(
          new UserAlreadyExistsException('User already exists'),
        );

      await expect(userController.register(userConnectDto)).rejects.toThrow(
        UserAlreadyExistsException,
      );
      expect(userService.register).toHaveBeenCalledWith(userConnectDto);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      jest.spyOn(userService, 'deleteUserById').mockResolvedValue();

      const result = await userController.deleteUser(basicEntity.id!);
      expect(result).toBeUndefined();
      expect(userService.deleteUserById).toHaveBeenCalledWith(basicEntity.id!);
    });

    it('should throw an error if the user is not found', async () => {
      const userId = 'non-existent-id';
      jest
        .spyOn(userService, 'deleteUserById')
        .mockRejectedValue(new UserNotFoundException('User not found'));

      await expect(userController.deleteUser(userId)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(userService.deleteUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const userConnectDto = {
        email: basicEntity.email,
        password: basicEntity.password,
      };
      const tokenRes: TokenResponseDto = {
        accessToken: 'fake-access-token',
        expiresIn: 3600,
      };

      jest.spyOn(authService, 'login').mockResolvedValue(tokenRes);

      const result = await userController.login(userConnectDto);
      expect(result).toEqual(tokenRes);
      expect(authService.login).toHaveBeenCalledWith(userConnectDto);
    });

    it('should throw an error if the credentials are invalid', async () => {
      const userConnectDto = {
        email: basicEntity.email,
        password: 'wrong-password',
      };
      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(
          new InvalidCredentialsException('Invalid credentials'),
        );

      expect(userController.login(userConnectDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
      expect(authService.login).toHaveBeenCalledWith(userConnectDto);
    });
  });
});
