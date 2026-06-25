export type AuditResult = 'success' | 'error' | 'cached';

export type AuditEntry = {
  resource: 'cep' | 'cnpj';
  query: string;
  timestamp: string;
  result: AuditResult;
  message?: string;
};

const isProduction = process.env.NODE_ENV === 'production';

function maskInProduction(value: string): string {
  if (!isProduction) {
    return value;
  }
  if (value.length <= 4) {
    return '****';
  }
  return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`;
}

export function logAudit(entry: AuditEntry): void {
  const payload: AuditEntry = {
    ...entry,
    query: maskInProduction(entry.query),
  };
  console.info('[audit:brasil-api]', JSON.stringify(payload));
}
