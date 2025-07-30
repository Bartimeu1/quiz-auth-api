import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class UserRegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
