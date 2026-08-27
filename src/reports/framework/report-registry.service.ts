import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { REPORT_PROVIDERS } from './constants';
import { type ReportProvider } from './interfaces/report-provider.interface';
import { type ReportDefinition } from './types/report-definition.type';

/** Catálogo central de relatórios registrados via injeção multi-provider. */
@Injectable()
export class ReportRegistry {
  private readonly byKey: Map<string, ReportProvider>;

  constructor(
    @Inject(REPORT_PROVIDERS)
    providers: ReportProvider[],
  ) {
    this.byKey = new Map();
    for (const provider of providers) {
      const key = provider.definition.key;
      if (this.byKey.has(key)) {
        throw new Error(`Relatório duplicado registrado: ${key}`);
      }
      this.byKey.set(key, provider);
    }
  }

  listDefinitions(): ReportDefinition[] {
    return [...this.byKey.values()].map((p) => p.definition);
  }

  getProvider(key: string): ReportProvider {
    const provider = this.byKey.get(key);
    if (!provider) {
      throw new NotFoundException(`Relatório não encontrado: ${key}`);
    }
    return provider;
  }

  has(key: string): boolean {
    return this.byKey.has(key);
  }
}
