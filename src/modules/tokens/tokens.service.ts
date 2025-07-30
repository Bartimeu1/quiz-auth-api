import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Token } from './entities/token.entity';
import { RpcException } from '@nestjs/microservices';
import { JwtPayload } from '../../types/tokens';
import {
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from '../../constants/tokens';

import { GenerateTokenDto, SaveTokenDto } from './dto';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token) private tokenRepository: Repository<Token>,
    private jwtService: JwtService,
  ) {}

  async findTokenBy<K extends keyof Token>(
    key: K,
    value: Token[K],
  ): Promise<Token | null> {
    return this.tokenRepository.findOneBy({ [key]: value });
  }

  async removeToken(refreshToken: string) {
    await this.tokenRepository.delete({ refreshToken });
  }

  private validateToken(token: string) {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new RpcException(
        new UnauthorizedException(`Invalid or expired token`),
      );
    }
  }

  generateTokens(generateTokenDto: GenerateTokenDto) {
    const accessToken = this.jwtService.sign(generateTokenDto, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
    const refreshToken = this.jwtService.sign(generateTokenDto, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    return { accessToken, refreshToken };
  }

  async saveToken(saveTokenDto: SaveTokenDto) {
    const { userId, refreshToken } = saveTokenDto;

    const tokenData = await this.findTokenBy('userId', userId);
    if (!tokenData) {
      const newToken = new Token(userId, refreshToken);
      return this.tokenRepository.save(newToken);
    }

    tokenData.refreshToken = refreshToken;
    return this.tokenRepository.save(tokenData);
  }

  async generateAndSaveTokens(generateTokenDto: GenerateTokenDto) {
    const tokens = this.generateTokens(generateTokenDto);

    await this.saveToken({
      userId: generateTokenDto.userId,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async validateRefreshToken(refreshToken: string) {
    const tokenData = await this.findTokenBy('refreshToken', refreshToken);

    if (!tokenData) {
      throw new RpcException(
        new UnauthorizedException('Refresh token not found or expired'),
      );
    }

    return this.validateToken(refreshToken);
  }
}
