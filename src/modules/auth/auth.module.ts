import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtModule } from '@nestjs/jwt';
import { TokensModule } from '../tokens/tokens.module';
import { KafkaClientModule } from '../kafka-client/kafka-client.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    TokensModule,
    KafkaClientModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AuthModule {}
