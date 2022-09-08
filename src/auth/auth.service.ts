import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDTO, SignUpDTO } from './dto';
import * as bcrypt from 'bcrypt';
import {
  NotFoundError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: SignUpDTO) {
    // hash password
    const hash = await bcrypt.hash(dto.password, 10);

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

      return user;
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
      return user;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof ForbiddenException) {
        throw new ForbiddenException('Email or Password is incorrect');
      }
    }
  }
}
