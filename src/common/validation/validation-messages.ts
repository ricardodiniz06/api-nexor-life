import { type ValidationError } from 'class-validator';

const fieldLabels: Record<string, string> = {
  email: 'E-mail',
  password: 'Senha',
  refreshToken: 'Token de atualização',
  fullName: 'Nome completo',
  cpf: 'CPF',
  councilType: 'Conselho profissional',
  councilNumber: 'Número do conselho',
  specialty: 'Especialidade',
  roleIds: 'Perfis',
};

const constraintLabels: Record<string, string> = {
  isEmail: 'Informe um e-mail válido.',
  isNotEmpty: 'Este campo é obrigatório.',
  isString: 'Deve ser texto.',
  minLength: 'Valor demasiado curto.',
  maxLength: 'Valor demasiado longo.',
  length: 'Tamanho inválido.',
  isEnum: 'Valor não permitido.',
  isUuid: 'Identificador inválido.',
  matches: 'Formato inválido.',
  isInt: 'Deve ser um número inteiro.',
  isDateString: 'Data inválida.',
  whitelistValidation: 'Campo não permitido.',
};

function flattenErrors(
  errors: ValidationError[],
  prefix = '',
): Array<{ field: string; constraint: string; message: string }> {
  const out: Array<{ field: string; constraint: string; message: string }> = [];
  for (const error of errors) {
    const field = prefix ? `${prefix}.${error.property}` : error.property;
    if (error.constraints) {
      for (const [key, raw] of Object.entries(error.constraints)) {
        out.push({
          field,
          constraint: key,
          message: constraintLabels[key] ?? raw,
        });
      }
    }
    if (error.children?.length) {
      out.push(...flattenErrors(error.children, field));
    }
  }
  return out;
}

export function formatValidationErrors(errors: ValidationError[]): string[] {
  const flat = flattenErrors(errors);
  if (flat.length === 0) {
    return ['Dados inválidos. Verifique os campos enviados.'];
  }
  return flat.map(({ field, message }) => {
    const label = fieldLabels[field] ?? field;
    return `${label}: ${message}`;
  });
}
