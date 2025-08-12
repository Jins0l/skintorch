import { Body, Controller, Get, Post, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/common/decorator/user.decorator';
import type { LoginResponse, UserPayload } from './types/auth.types';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '로그인', description: '이메일/비밀번호로 로그인하여 JWT 발급' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('잘못된 이메일 또는 비밀번호 입니다.');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '프로필 조회', description: '로그인 테스트 (JWT 토큰으로 내 정보 조회)' })
  @Get('profile')
  getProfile(@User() user: UserPayload) {
    return user;
  }
}
