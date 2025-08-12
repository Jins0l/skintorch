import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePostDto {
  @ApiProperty({ description: '게시글 제목', example: '첫 게시글', minLength: 2, maxLength: 50 })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  @Length(2, 50, { message: '제목은 2자 이상 50자 이하입니다.' })
  title: string;

  @ApiProperty({ description: '게시글 본문', example: '안녕하세요. 첫 글입니다.' })
  @IsString({ message: '본문은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  content: string;

  @ApiPropertyOptional({ description: '이미지 URL 배열(최소 0개, 최대 5개)', example: ['https://example.com/a.jpg'] })
  @IsOptional()
  @IsArray({ message: '이미지는 배열이어야 합니다.' })
  @ArrayMaxSize(5, { message: '이미지는 최대 5개까지 업로드 가능합니다.'})
  @ArrayMinSize(0)
  images?: string[];
}