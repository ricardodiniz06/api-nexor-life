import { DynamicModule, Module, type Type } from '@nestjs/common';
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
