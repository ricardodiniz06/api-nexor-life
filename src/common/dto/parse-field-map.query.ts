/**
 * Normaliza mapa campo → valor vindo do query string.
 * Aceita objeto (`search[cpf]=546`) ou string (`search=cpf:546,code:546`).
 */
export function parseFieldMapQuery(
  value: unknown,
): Record<string, string> | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'string') {
    return parseFieldMapString(value);
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const out: Record<string, string> = {};
    for (const [key, raw] of Object.entries(value)) {
      if (raw === undefined || raw === null) {
        continue;
      }
      const str = String(raw).trim();
      if (str.length > 0) {
        out[key] = str;
      }
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }

  return undefined;
}

/**
 * String `campo:valor,campo:valor` (padrão Nexor / CST).
 * Ex.: `cpf:5466607920,email:546` ou `createdAt:2024-01-01T10:00:00.000Z`
 */
export function parseFieldMapString(
  raw: string,
): Record<string, string> | undefined {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  const out: Record<string, string> = {};
  const pairs = splitFieldMapPairs(trimmed);

  for (const { key, value } of pairs) {
    if (key && value) {
      out[key] = value;
    }
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

function splitFieldMapPairs(
  raw: string,
): Array<{ key: string; value: string }> {
  const pairs: Array<{ key: string; value: string }> = [];

  for (const part of raw.split(',')) {
    const segment = part.trim();
    if (!segment) {
      continue;
    }

    const hasIsoDateTime = /\d{4}-\d{2}-\d{2}T\d{2}/.test(segment);
    let key: string;
    let value: string;

    if (hasIsoDateTime) {
      const colonIndex = segment.indexOf(':');
      if (colonIndex <= 0) {
        continue;
      }
      key = segment.slice(0, colonIndex).trim();
      value = segment.slice(colonIndex + 1).trim();
    } else {
      const colonIndex = segment.indexOf(':');
      if (colonIndex <= 0) {
        continue;
      }
      key = segment.slice(0, colonIndex).trim();
      value = segment.slice(colonIndex + 1).trim();
    }

    if (key && value) {
      pairs.push({ key, value });
    }
  }

  return pairs;
}
