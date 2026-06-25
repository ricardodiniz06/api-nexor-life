import { Module, type OnModuleInit } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { type Repository } from 'typeorm';
import { Convenio } from '../../convenios/entities/convenio.entity';
import {
  createConvenioPersistence,
  setInsurancePersistence,
} from '../../server/lib/insurances.repository';
import { BrasilApiController } from './brasil-api.controller';
import { BrasilApiService } from './brasil-api.service';

@Module({
  imports: [TypeOrmModule.forFeature([Convenio])],
  controllers: [BrasilApiController],
  providers: [BrasilApiService],
  exports: [BrasilApiService],
})
export class BrasilApiModule implements OnModuleInit {
  constructor(
    @InjectRepository(Convenio)
    private readonly convenios: Repository<Convenio>,
  ) {}

  onModuleInit(): void {
    setInsurancePersistence(createConvenioPersistence(this.convenios));
  }
}
