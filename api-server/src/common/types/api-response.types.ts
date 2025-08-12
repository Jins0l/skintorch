import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ description: '응답 데이터', example: {} })
  data: T;
}