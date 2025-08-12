import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { DuplicateEmailRequestDto } from './dto/duplicate-email.request.dto';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
@UseInterceptors(ResponseInterceptor)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('email/check')
  @ApiOperation({ summary: '이메일 중복 확인', description: '이메일 존재 여부를 조회하여 사용 가능 여부 반환' })
  async isDuplicateEmail(@Query() query: DuplicateEmailRequestDto) {
    const exists = await this.usersService.existsByEmail(query.email.trim().toLowerCase());
    return { available: !exists };
  }

  @Post()
  @ApiOperation({ summary: '회원 등록', description: '사용자 회원가입' })
  async registerUser(@Body() body: UserDto) {
    await this.usersService.register(body);
    return { message: '사용자가 성공적으로 등록되었습니다.' };
  }
}
