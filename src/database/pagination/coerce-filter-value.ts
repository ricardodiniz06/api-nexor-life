import { BadRequestException } from '@nestjs/common';
import { type FilterFieldType } from './entity-list-config.type';

export function coerceFilterValue(
  raw: string,
  type: FilterFieldType,
  fieldKey: string,
): string | boolean | number {
  switch (type) {
    case 'boolean': {
      const lower = raw.toLowerCase();
      if (lower === 'true' || lower === '1') {
        return true;
      }
      if (lower === 'false' || lower === '0') {
        return false;
      }
      throw new BadRequestException(`Filtro "${fieldKey}": use true ou false.`);
    }
    case 'uuid': {
      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRe.test(raw)) {
        throw new BadRequestException(`Filtro "${fieldKey}": UUID inválido.`);
      }
      return raw;
    }
    case 'number': {
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        throw new BadRequestException(`Filtro "${fieldKey}": número inválido.`);
      }
      return n;
    }
    default:
      return raw;
  }
}
