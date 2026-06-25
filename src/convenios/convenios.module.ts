import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConveniosController } from './convenios.controller';
import { ConveniosService } from './convenios.service';
import { Convenio } from './entities/convenio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Convenio])],
  controllers: [ConveniosController],
  providers: [ConveniosService],
  exports: [ConveniosService],
})
export class ConveniosModule {}
