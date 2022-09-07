import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDTO, SignUpDTO } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: SignUpDTO) {
    // hash password
    const hash = await bcrypt.hash(dto.password, 10);

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
  }

  signin(dto: SignInDTO) {
    return { msg: 'I have signed up' };
  }
}
