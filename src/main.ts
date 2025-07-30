import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DEFAULT_KAFKA_HOST } from './constants/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_HOST || DEFAULT_KAFKA_HOST],
        },
        consumer: {
          groupId: 'auth-consumer-group',
        },
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe());

  await app.listen();
}
bootstrap();
