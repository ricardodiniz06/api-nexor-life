import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConveniosModule } from './convenios/convenios.module';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';
import { BrasilApiModule } from './integrations/brasil-api/brasil-api.module';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CoreModule,
    DatabaseModule,
    IamModule,
    ConveniosModule,
    BrasilApiModule,
  ],
})
export class AppModule {}
