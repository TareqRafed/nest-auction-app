import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../common/decorators';
import { RtGuard } from '../common/guards';
import { AtGuard } from '../common/guards/at.guard';
import { AuthService } from './auth.service';
import { SignUpDTO } from './dto';
import { SignInDTO } from './dto/signin.dto';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignUpDTO) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: SignInDTO) {
    return this.authService.signin(dto);
  }

  /**
   * invoke signout service; uses POST instead of GET, because that browsers do prefetching for GET requests
   */
  @Post('signout')
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  signout(@GetUser('id') userId: number) {
    return this.authService.signout(userId);
  }

  @Post('refresh')
  @UseGuards(RtGuard)
  refreshTokens(
    @GetUser('id') userId: number,
    @GetUser('refreshToken') token: string,
  ) {
    return this.authService.refreshToken(userId, token);
  }
}
