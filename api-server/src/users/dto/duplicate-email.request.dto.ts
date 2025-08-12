import { ApiProperty, PickType } from "@nestjs/swagger";
import { UserDto } from "./user.dto";

export class DuplicateEmailRequestDto extends PickType(UserDto, ['email']) {
  @ApiProperty({ example: 'user@example.com' })
  email: string;
}