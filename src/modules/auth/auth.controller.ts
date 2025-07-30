import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterDto, UserLoginDto } from './dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth-register')
  async authRegister(@Payload() userRegisterDto: UserRegisterDto) {
    return await this.authService.registerUser(userRegisterDto);
  }

  @MessagePattern('auth-login')
  async authLogin(@Payload() userLoginDto: UserLoginDto) {
    return await this.authService.loginUser(userLoginDto);
  }

  @MessagePattern('auth-logout')
  async logout(@Payload() token: string) {
    await this.authService.logoutUser(token);
  }

  @MessagePattern('auth-refresh')
  async refresh(@Payload() token: string) {
    return await this.authService.refresh(token);
  }
}
