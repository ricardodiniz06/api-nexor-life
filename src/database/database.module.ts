import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { buildTypeOrmOptions } from './typeorm.config';
import { PaginationModule } from './pagination/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => buildTypeOrmOptions(),
    }),
    PaginationModule,
  ],
})
export class DatabaseModule {}
