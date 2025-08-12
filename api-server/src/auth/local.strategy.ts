import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserPayload } from './types/auth.types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<UserPayload> {
    const loginDto: LoginDto = { email, password };
    const user = await this.authService.validateUser(loginDto);
    if (!user)
      throw new UnauthorizedException('잘못된 이메일 또는 비밀번호 입니다.');
    return user;
  }
}
