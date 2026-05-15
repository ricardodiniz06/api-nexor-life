import { type FilterFieldType } from './entity-list-config.type';
import { coerceFilterValue } from './coerce-filter-value';

export type FilterCondition =
  | { kind: 'isNull' }
  | { kind: 'isNotNull' }
  | { kind: 'compare'; operator: '=' | '>=' | '<=' | '>' | '<'; value: unknown };

const OP_REGEX = /^(>=|<=|>|<|=)(.+)$/;

/**
 * Interpreta valor de filtro (estilo CST): `null`, `!null`, `>=10`, `=ativo`.
 */
export function parseFilterCondition(
  raw: string,
  type: FilterFieldType,
  fieldKey: string,
): FilterCondition {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'null') {
    return { kind: 'isNull' };
  }
  if (lower === '!null') {
    return { kind: 'isNotNull' };
  }

  const opMatch = trimmed.match(OP_REGEX);
  if (opMatch) {
    const operator = opMatch[1] as '=' | '>=' | '<=' | '>' | '<';
    const rhs = opMatch[2].trim();
    return {
      kind: 'compare',
      operator,
      value: coerceFilterValue(rhs, type, fieldKey),
    };
  }

  return {
    kind: 'compare',
    operator: '=',
    value: coerceFilterValue(trimmed, type, fieldKey),
  };
}
