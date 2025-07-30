import { IsString, MinLength, IsNotEmpty, MaxLength } from 'class-validator';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(30)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
