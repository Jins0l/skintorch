import { Type } from 'class-transformer';
import { IsOptional, Min, Max, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPostsDto {
  @ApiPropertyOptional({ description: '커서(ID), 첫 번째 페이지는 커서 값 없이 요청 가능', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'cursor는 정수여야 합니다.' })
  cursor?: number;

  @ApiPropertyOptional({ description: '한 페이지 개수', example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit은 정수여야 합니다.' })
  @Min(1, { message: 'limit은 1 이상이어야 합니다.' })
  @Max(100, { message: 'limit은 100 이하여야 합니다.' })
  limit?: number;
} 