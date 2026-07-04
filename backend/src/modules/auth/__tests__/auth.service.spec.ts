import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../../config/prisma/prisma.service';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'user-uuid',
  nome: 'Admin',
  email: 'admin@test.com',
  passwordHash: 'hashed_password',
  role: 'ADMIN' as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  refreshToken: {
    create: jest.fn().mockResolvedValue({ id: 'token-uuid' }),
    findFirst: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
  },
  passwordReset: {
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({ id: 'reset-uuid' }),
    findUnique: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
  },
  user: { findUnique: jest.fn(), update: jest.fn() },
  $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
};

const mockUsersService = {
  findByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('test-secret'),
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── login ──────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('retorna tokens quando credenciais são válidas', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_refresh' as never);

      const result = await service.login({ email: mockUser.email, password: 'correct' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('lança UnauthorizedException quando usuário não existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'x@x.com', password: 'pass' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lança UnauthorizedException quando usuário está inativo', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.login({ email: mockUser.email, password: 'pass' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lança UnauthorizedException quando senha está incorreta', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login({ email: mockUser.email, password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('revoga refresh tokens do usuário', async () => {
      await service.logout(mockUser.id, 'old-refresh-token');

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: mockUser.id, revokedAt: null } }),
      );
    });

    it('retorna mensagem de sucesso', async () => {
      const result = await service.logout(mockUser.id, 'token');
      expect(result).toEqual({ message: 'Logout realizado com sucesso' });
    });
  });

  // ── forgotPassword ─────────────────────────────────────────────────────────

  describe('forgotPassword()', () => {
    it('retorna mensagem genérica quando e-mail não existe (evita enumeração)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('naoexiste@test.com');
      expect(result.message).toContain('Se o e-mail existir');
      expect(mockPrisma.passwordReset.create).not.toHaveBeenCalled();
    });

    it('cria token de reset quando e-mail existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await service.forgotPassword(mockUser.email);

      expect(mockPrisma.passwordReset.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: mockUser.id } }),
      );
      expect(mockPrisma.passwordReset.create).toHaveBeenCalled();
    });
  });

  // ── resetPassword ──────────────────────────────────────────────────────────

  describe('resetPassword()', () => {
    it('lança BadRequestException para token inválido', async () => {
      mockPrisma.passwordReset.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword('invalid-token', 'NewPass@123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lança BadRequestException para token já utilizado', async () => {
      mockPrisma.passwordReset.findUnique.mockResolvedValue({
        id: 'reset-uuid',
        userId: mockUser.id,
        token: 'used-token',
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        user: mockUser,
      });

      await expect(service.resetPassword('used-token', 'NewPass@123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lança BadRequestException para token expirado', async () => {
      mockPrisma.passwordReset.findUnique.mockResolvedValue({
        id: 'reset-uuid',
        userId: mockUser.id,
        token: 'expired-token',
        usedAt: null,
        expiresAt: new Date(Date.now() - 1000),
        user: mockUser,
      });

      await expect(service.resetPassword('expired-token', 'NewPass@123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
