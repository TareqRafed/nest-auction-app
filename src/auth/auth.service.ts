import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDTO, SignUpDTO } from './dto';
import * as bcrypt from 'bcrypt';
import {
  NotFoundError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  // Basic services
  async hash(str: string) {
    return await bcrypt.hash(str, 10);
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
    }
  }

  // Tokens

  /**
   * Store the refresh token has in the database, for a specific user
   * @param userId
   * @param rt : Refresh Token
   */
  async updateRtHash(userId: number, rt: string) {
    const hash = await this.hash(rt);
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
