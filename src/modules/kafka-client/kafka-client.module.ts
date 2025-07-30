import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { DEFAULT_KAFKA_HOST } from '../../constants/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'auth-client',
            brokers: [process.env.KAFKA_HOST || DEFAULT_KAFKA_HOST],
          },
          consumer: {
            groupId: 'auth-consumer-group',
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaClientModule {}
