import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ClientKafka, RpcException } from '@nestjs/microservices';

import { UserRegisterDto, UserLoginDto } from './dto';
import { TokensService } from '../tokens/tokens.service';
import { firstValueFrom } from 'rxjs';
import { BCRYPT_SALT_ROUNDS } from '../../constants/bcrypt';
import { GetUserResponse } from '../../types/user';

const PATTERNS_TO_SUBSCRIBE = ['find-user-by', 'create-user'];

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private tokensService: TokensService,
    @Inject('AUTH_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    PATTERNS_TO_SUBSCRIBE.forEach((pattern) =>
      this.kafkaClient.subscribeToResponseOf(pattern),
    );
    await this.kafkaClient.connect();
  }

  async registerUser(userRegisterDto: UserRegisterDto) {
    const { name, email, password } = userRegisterDto;

    const { data: foundedUser }: GetUserResponse = await firstValueFrom(
      this.kafkaClient.send('find-user-by', {
        value: JSON.stringify({
          key: 'email',
          value: email,
        }),
      }),
    );

    if (foundedUser) {
      throw new RpcException(
        new BadRequestException('User with this email already exists'),
      );
    }

    const hashPass = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const { data: newUser }: GetUserResponse = await firstValueFrom(
      this.kafkaClient.send('create-user', {
        value: JSON.stringify({
          name,
          email,
          password: hashPass,
        }),
      }),
    );

    const tokens = await this.tokensService.generateAndSaveTokens({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      ...tokens,
      user: newUser,
    };
  }

  async loginUser(userLoginDto: UserLoginDto) {
    const { email, password } = userLoginDto;

    const { data: user }: GetUserResponse = await firstValueFrom(
      this.kafkaClient.send('find-user-by', {
        value: {
          key: 'email',
          value: email,
        },
      }),
    );

    if (!user) {
      throw new RpcException(
        new NotFoundException('User with this email not found'),
      );
    }

    const isPassMatches = await bcrypt.compare(password, user.password);
    if (!isPassMatches) {
      throw new RpcException(new UnauthorizedException('Invalid credentials'));
    }

    const tokens = await this.tokensService.generateAndSaveTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      ...tokens,
      user,
    };
  }

  async logoutUser(refreshToken: string) {
    await this.tokensService.removeToken(refreshToken);
  }

  async refresh(refreshToken: string) {
    const { userId, email, role } =
      await this.tokensService.validateRefreshToken(refreshToken);

    await this.tokensService.removeToken(refreshToken);
    const newTokens = this.tokensService.generateTokens({
      userId,
      email,
      role,
    });

    await this.tokensService.saveToken({
      userId,
      refreshToken: newTokens.refreshToken,
    });

    return newTokens;
  }
}
