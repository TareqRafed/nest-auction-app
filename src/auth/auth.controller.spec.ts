import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDTO, signInDtoStub, signUpDtoStub } from './dto';

describe('AuthController', () => {
  let controller: AuthController;
  let spyService: AuthService;

  beforeEach(async () => {
    const serviceProvider = {
      provide: AuthService,
      useFactory: () => ({
        signin: jest.fn(() => ({})),
        signup: jest.fn(() => ({})),
        signout: jest.fn(() => ({})),
        refreshToken: jest.fn(() => ({})),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, PrismaService, JwtService, serviceProvider],
    }).compile();

    spyService = module.get<AuthService>(AuthService);
    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/signin', () => {
    const signInStub = signInDtoStub();

    it('should call signin ', async () => {
      await controller.signin(signInStub);
      expect(spyService.signin).toHaveBeenCalled();
      expect(spyService.signin).toReturn();
    });

    //         const signOutMockUp = jest.spyOn(service, 'signout');
  });

  describe('POST /auth/signup', () => {
    const signUpStub = signUpDtoStub();

    it('should call signup', async () => {
      await controller.signup(signUpStub);
      expect(spyService.signup).toHaveBeenCalled();
      expect(spyService.signup).toReturn();
    });
  });

  describe('POST /auth/signout', () => {
    it('should call signout', async () => {
      await controller.signout(312);
      expect(spyService.signout).toHaveBeenCalledWith(312);
      expect(spyService.signout).toReturn();
    });
  });

  describe('POST /auth/refresh', () => {
    const refreshStub = {
      userId: 1,
      token: 'secret',
    };

    it('should call refreshToken', async () => {
      await controller.refreshTokens(refreshStub.userId, refreshStub.token);
      expect(spyService.refreshToken).toHaveBeenCalled();
      expect(spyService.refreshToken).toReturn();
    });
  });
});
