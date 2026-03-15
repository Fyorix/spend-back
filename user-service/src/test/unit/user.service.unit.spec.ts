import { Test } from '@nestjs/testing';
import { UserService } from '../../core/services/user.service';
import { IUserRepository, USER_REPOSITORY } from '../../core/port/user.repository';
import {
    InvalidCredentialsException,
    UserAlreadyExistsException,
    UserNotFoundException,
} from '../../core/errors';
import { UserEntity } from '../../core/entities/user.entity';

describe('UserService', () => {
    let service: UserService;
    let userRepository: jest.Mocked<IUserRepository>;

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

        const moduleRef = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: USER_REPOSITORY, useValue: mockUserRepository },
            ],
        }).compile();

        service = moduleRef.get<UserService>(UserService);
        userRepository = moduleRef.get<jest.Mocked<IUserRepository>>(USER_REPOSITORY);
    });

    describe('getUserById', () => {
        it('should return a user when found', async () => {
            userRepository.findById.mockResolvedValue(user);

            const result = await service.getUserById(user.id!);

            expect(result).toEqual(user);
            expect(userRepository.findById).toHaveBeenCalledWith(user.id);
        });

        it('should throw UserNotFoundException when not found', async () => {
            userRepository.findById.mockResolvedValue(null);

            await expect(service.getUserById(user.id!)).rejects.toThrow(UserNotFoundException);
            expect(userRepository.findById).toHaveBeenCalledWith(user.id);
        });
    });

    describe('register', () => {
        it('should save user when email is available', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            userRepository.save.mockResolvedValue();

            await service.register(user);

            expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
            expect(userRepository.save).toHaveBeenCalledWith(user);
        });

        it('should throw UserAlreadyExistsException when email exists', async () => {
            userRepository.findByEmail.mockResolvedValue(user);

            await expect(service.register(user)).rejects.toThrow(UserAlreadyExistsException);
            expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
            expect(userRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('should resolve when credentials are valid', async () => {
            userRepository.findByEmail.mockResolvedValue(user);

            await expect(service.login(user)).resolves.toBeUndefined();
            expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
        });

        it('should throw UserNotFoundException when user does not exist', async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            await expect(service.login(user)).rejects.toThrow(UserNotFoundException);
            expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
        });

        it('should throw InvalidCredentialsException when password is invalid', async () => {
            userRepository.findByEmail.mockResolvedValue({ ...user, password: 'different' });

            await expect(service.login(user)).rejects.toThrow(InvalidCredentialsException);
            expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
        });
    });

    describe('deleteUserById', () => {
        it('should delete user when found', async () => {
            userRepository.findById.mockResolvedValue(user);
            userRepository.deleteById.mockResolvedValue();

            await service.deleteUserById(user.id!);

            expect(userRepository.findById).toHaveBeenCalledWith(user.id);
            expect(userRepository.deleteById).toHaveBeenCalledWith(user.id);
        });

        it('should throw UserNotFoundException when user is missing', async () => {
            userRepository.findById.mockResolvedValue(null);

            await expect(service.deleteUserById(user.id!)).rejects.toThrow(UserNotFoundException);
            expect(userRepository.findById).toHaveBeenCalledWith(user.id);
            expect(userRepository.deleteById).not.toHaveBeenCalled();
        });
    });
});