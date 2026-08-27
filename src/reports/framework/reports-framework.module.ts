import { DynamicModule, Module, type Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Convenio } from '../../convenios/entities/convenio.entity';
import { User } from '../../iam/entities/user.entity';
import { IngestedEvent, IngestedEventSchema } from '../../analytics/schemas/ingested-event.schema';
import { REPORT_PROVIDERS } from './constants';
import { type ReportProvider } from './interfaces/report-provider.interface';
import { ReportQueryValidator } from './report-query.validator';
import { ReportRegistry } from './report-registry.service';
import { ReportRunner } from './report-runner.service';

@Module({})
export class ReportsFrameworkModule {
  /**
   * Registra relatórios plugáveis no pipeline do framework.
   * Cada classe em `providers` deve ser @Injectable() e implementar ReportProvider.
   */
  static register(providerClasses: Array<Type<ReportProvider>>): DynamicModule {
    const providerBindings = providerClasses.flatMap((ProviderClass) => [
      ProviderClass,
      {
        provide: REPORT_PROVIDERS,
        useExisting: ProviderClass,
        multi: true,
      } as const,
    ]);

    return {
      module: ReportsFrameworkModule,
      imports: [
        TypeOrmModule.forFeature([Convenio, User]),
        MongooseModule.forFeature([
          { name: IngestedEvent.name, schema: IngestedEventSchema },
        ]),
      ],
      providers: [
        ...providerBindings,
        ReportQueryValidator,
        ReportRegistry,
        ReportRunner,
      ],
      exports: [ReportRunner, ReportRegistry, ReportQueryValidator],
    };
  }
}
