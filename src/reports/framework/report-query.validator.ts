import { BadRequestException, Injectable } from '@nestjs/common';
import { type ReportDefinition } from './types/report-definition.type';
import { type IReportQuery } from './types/report-query.type';

function isIsoDate(value: string): boolean {
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}

/** Valida filtros e intervalo de datas contra a definição declarativa do relatório. */
@Injectable()
export class ReportQueryValidator {
  validate(definition: ReportDefinition, query: IReportQuery): IReportQuery {
    const filter = this.validateFilters(definition, query.filter);
    const { from, to } = this.validateDateRange(
      definition,
      query.from,
      query.to,
    );

    return {
      ...query,
      filter,
      from,
      to,
    };
  }

  private validateFilters(
    definition: ReportDefinition,
    filter: Record<string, string> | undefined,
  ): Record<string, string> | undefined {
    if (!filter) {
      return undefined;
    }

    const allowed = definition.filterFields ?? {};
    const normalized: Record<string, string> = {};

    for (const [key, rawValue] of Object.entries(filter)) {
      const field = allowed[key];
      if (!field) {
        throw new BadRequestException(`Filtro não permitido: ${key}`);
      }
      const value = rawValue.trim();
      if (!value) {
        continue;
      }

      if (field.type === 'boolean') {
        if (value !== 'true' && value !== 'false') {
          throw new BadRequestException(
            `Filtro "${key}" deve ser true ou false`,
          );
        }
      }

      if (field.type === 'date' && !isIsoDate(value)) {
        throw new BadRequestException(
          `Filtro "${key}" deve ser uma data ISO 8601 válida`,
        );
      }

      normalized[key] = value;
    }

    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  private validateDateRange(
    definition: ReportDefinition,
    from?: string,
    to?: string,
  ): { from?: string; to?: string } {
    if (!definition.supportsDateRange) {
      if (from || to) {
        throw new BadRequestException(
          `O relatório "${definition.key}" não suporta intervalo de datas`,
        );
      }
      return {};
    }

    if (from && !isIsoDate(from)) {
      throw new BadRequestException(
        'Parâmetro "from" deve ser ISO 8601 válido',
      );
    }
    if (to && !isIsoDate(to)) {
      throw new BadRequestException('Parâmetro "to" deve ser ISO 8601 válido');
    }
    if (from && to && Date.parse(from) > Date.parse(to)) {
      throw new BadRequestException(
        'Parâmetro "from" não pode ser posterior a "to"',
      );
    }

    return { from, to };
  }
}
