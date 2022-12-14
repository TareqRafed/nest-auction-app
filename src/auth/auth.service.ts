import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDTO, SignUpDTO } from './dto';
import * as bcrypt from 'bcrypt';
import {
  NotFoundError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  // Basic services

  /**
   * Hashes the first 72 bytes of a string
   * @param str
   * @returns string
   */
  async hash(str: string) {
    return bcrypt.hash(str, 10);
  }

  async signup(dto: SignUpDTO) {
    // hash password
    const hash = await this.hash(dto.password);

    try {
      // create user
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
      // tokens
      const tokens = await this.generateTokens(user.id, user.email);
      this.updateRtHash(user.id, tokens.rt);
      //
      return { ...tokens, ...user };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Email is already Taken');
        }
      }
      throw new InternalServerErrorException();
    }
  }

  async signin(dto: SignInDTO) {
    try {
      // find user
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          email: dto.email,
        },
      });

      // check password
      const pwMatches = await bcrypt.compare(dto.password, user.hash);

      if (!pwMatches) throw new ForbiddenException('Password incorrect');

      delete user.hash;
      delete user.rt; // because it's going to be regenerated

      const data = await this.generateTokens(user.id, user.email);
      this.updateRtHash(user.id, data.rt);
      return { ...data, ...user };
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof ForbiddenException) {
        throw new ForbiddenException('Email or Password is incorrect');
      }
      throw new InternalServerErrorException();
    }
  }

  async signout(userId: number) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        rt: {
          not: null,
        },
      },
      data: {
        rt: null,
      },
    });
  }

  // Tokens
  // TODO: Refactor Tokens logic into a Feature module
  /**
   * Creates new AT & RT, stores the new hashed RT in Database,
   * then returns the tokens unhahsed
   * @param userId
   * @param rt : Refresh Token
   * @returns Tokens
   */
  async refreshToken(userId: number, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // False data is passed
    if (!user) throw new ForbiddenException('Access Denied');
    const sha256 = createHash('sha256').update(rt).digest('hex');
    const hash = await bcrypt.compare(sha256, user.rt);
    if (!hash) throw new ForbiddenException('Access Denied');
    //console.log(sha256, user.rt, 'new rt', rt);
    // Refresh token
    const tokens = await this.generateTokens(userId, user.email);
    await this.updateRtHash(userId, tokens.rt);

    return tokens;
  }

  /**
   * Store the refresh token has in the database, for a specific user
   * @param userId
   * @param rt : Refresh Token
   */
  async updateRtHash(userId: number, rt: string) {
    // because bcrypt hashes only the first 72 bytes
    const sha256 = createHash('sha256').update(rt).digest('hex');
    const hash = await this.hash(sha256);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        rt: hash,
      },
    });
  }
  /**
   * Generate Refresh Token(RT) & Access Token(AT) for specific user
   * @param userId
   * @param email
   */
  async generateTokens(userId: number, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        {
          secret: process.env.AT_SECRET,
          expiresIn: 15 * 60,
        },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        {
          secret: process.env.RT_SECRET,
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return {
      rt,
      at,
    };
  }
}
