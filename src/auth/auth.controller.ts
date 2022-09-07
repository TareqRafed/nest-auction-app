import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDTO } from './dto';
import { SignInDTO } from './dto/signin.dto';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignUpDTO) {
    console.log(dto);
    return this.authService.signup();
  }

  @Post('signin')
  signin(@Body() dto: SignInDTO) {
    console.log(dto);
    return this.authService.signin();
  }
}
