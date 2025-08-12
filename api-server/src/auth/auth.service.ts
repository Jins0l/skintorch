import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { LoginResponse, UserPayload } from './types/auth.types';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<UserPayload | null> {
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (isMatch) {
      return {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: 'user',
      };
    }
    return null;
  }

  login(user: UserPayload): LoginResponse {
    const payload = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: 'user',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
