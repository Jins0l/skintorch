import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: '댓글 내용', example: '좋은 글 감사합니다!' })
  @IsString({ message: '댓글은 문자열 입니다.' })
  @IsNotEmpty({ message: '댓글을 입력해주세요.' })
  @MaxLength(200, { message: '댓글은 200자 이내로 작성해주세요.' })
  content: string;
}


