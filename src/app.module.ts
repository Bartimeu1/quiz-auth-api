import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { KafkaClientModule } from './modules/kafka-client/kafka-client.module';

@Module({
  imports: [
    AuthModule,
    TokensModule,
    ConfigModule.forRoot({ isGlobal: true }),
    KafkaClientModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USERNAME'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_NAME'),
        synchronize: true,
        entities: [__dirname + '/**/*.entity.{ts,js}'],
      }),
    }),
  ],
})
export class AppModule {}
