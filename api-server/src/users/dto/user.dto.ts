import { Transform } from "class-transformer";
import { IsDateString, IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsStrongPassword, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
    @ApiProperty({ description: '이름', example: '홍길동', minLength: 2, maxLength: 20 })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: '이름은 문자열이어야 입니다.' })
    @IsNotEmpty({ message: '이름을 입력해주세요.' })
    @Length(2, 20, { message: '이름은 2자 이상 20자 이하이어야 합니다.' })
    username: string;
  
    @ApiProperty({ description: '비밀번호', example: 'Abcd1234!@', minLength: 8 })
    @IsStrongPassword(
      { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
      { message: '비밀번호는 8자 이상이며, 영문 대소문자, 숫자, 특수문자를 각각 1자 이상 포함해야 합니다.' },
    )
    @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
    password: string;
  
    @ApiProperty({ description: '이메일', example: 'user@example.com' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsEmail({}, { message: '올바른 이메일 주소를 입력해주세요.' })
    @IsNotEmpty({ message: '이메일을 입력해주세요.' })
    email: string;
  
    @ApiProperty({ description: '휴대폰 번호', example: '01012345678' })
    @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value))
    @IsPhoneNumber('KR', { message: '올바른 휴대폰 번호를 입력해주세요.' })
    @IsNotEmpty({ message: '휴대폰 번호를 입력해주세요.' })
    phone: string;
  
    @ApiProperty({ description: '닉네임', example: '길동이', minLength: 2, maxLength: 20 })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: '닉네임은 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
    @Length(2, 20, { message: '닉네임은 2자 이상 20자 이하이어야 입니다.' })
    nickname: string;
  
    @ApiProperty({ description: '생년월일 (YYYY-MM-DD)', example: '2000-01-15' })
    @IsDateString({}, { message: '유효한 날짜 형식(YYYY-MM-DD)이 아닙니다.' })
    @IsNotEmpty({ message: '생년월일을 입력해주세요.' })
    birthdate: string;
}
  