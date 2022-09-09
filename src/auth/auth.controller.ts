import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorators';
import { RtGuard } from 'src/common/guards';
import { AtGuard } from 'src/common/guards/at.guard';
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
