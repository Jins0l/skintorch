import { ApiProperty, PickType } from "@nestjs/swagger";
import { UserDto } from "src/users/dto/user.dto";

export class LoginDto extends PickType(UserDto, ['email', 'password']) {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Abcd1234!@' })
  password: string;
}