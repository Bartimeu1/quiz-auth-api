import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { Token } from './entities/token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaClientModule } from '../kafka-client/kafka-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([Token]), KafkaClientModule],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
