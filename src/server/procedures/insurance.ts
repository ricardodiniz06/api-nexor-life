import {
  BrasilApiError,
  brasilApiFetch,
  type CnpjResponse,
} from '../lib/brasilApi';
import { cacheGet, cacheSet } from '../lib/cache';
import { logAudit } from '../lib/audit-log';
import {
  getInsurancePersistence,
  type ValidatedCompanyData,
} from '../lib/insurances.repository';

const HEALTH_CNAE_PREFIXES = ['6520', '655', '86', '87', '88'] as const;
const HEALTH_CNAE_WARNING = 'Verifique se este é um convênio de saúde válido.';

export type ValidateCnpjResult = {
  valid: true;
  warning?: string;
  company: ValidatedCompanyData;
};

function normalizeCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

function cacheKey(cnpj: string): string {
  return `cnpj:${cnpj}`;
}

function isHealthCnae(cnaeFiscal: number): boolean {
  const cnaeCode = cnaeFiscal.toString();
  return HEALTH_CNAE_PREFIXES.some((prefix) => cnaeCode.startsWith(prefix));
}

async function finalizeValidation(
  normalized: string,
  apiData: CnpjResponse,
  fromCache: boolean,
): Promise<ValidateCnpjResult> {
  if (apiData.descricao_situacao_cadastral !== 'ATIVA') {
    const message = 'CNPJ inativo na Receita Federal.';
    logAudit({
      resource: 'cnpj',
      query: normalized,
      timestamp: new Date().toISOString(),
      result: 'error',
      message,
    });
    throw new Error(message);
  }

  const persistence = getInsurancePersistence();
  if (persistence) {
    const exists = await persistence.cnpjExists(normalized);
    if (exists) {
      const message = 'Este convênio já está cadastrado no sistema.';
      logAudit({
        resource: 'cnpj',
        query: normalized,
        timestamp: new Date().toISOString(),
        result: 'error',
        message,
      });
      throw new Error(message);
    }
  }

  const warning = isHealthCnae(apiData.cnae_fiscal)
    ? undefined
    : HEALTH_CNAE_WARNING;

  const result: ValidateCnpjResult = {
    valid: true,
    company: toCompanyData(apiData),
    ...(warning ? { warning } : {}),
  };

  if (persistence) {
    await persistence.saveInsurance(normalized, apiData);
  }

  if (!fromCache) {
    cacheSet(cacheKey(normalized), apiData);
  }

  logAudit({
    resource: 'cnpj',
    query: normalized,
    timestamp: new Date().toISOString(),
    result: fromCache ? 'cached' : 'success',
    message: warning,
  });

  return result;
}

function toCompanyData(data: CnpjResponse): ValidatedCompanyData {
  return {
    razao_social: data.razao_social,
    nome_fantasia: data.nome_fantasia,
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento,
    bairro: data.bairro,
    municipio: data.municipio,
    uf: data.uf,
    cep: data.cep,
    email: data.email,
    ddd_telefone_1: data.ddd_telefone_1,
    cnae_fiscal_descricao: data.cnae_fiscal_descricao,
    data_inicio_atividade: data.data_inicio_atividade,
    capital_social: data.capital_social,
    porte: data.porte,
  };
}

export async function validateCnpj(cnpj: string): Promise<ValidateCnpjResult> {
  const normalized = normalizeCnpj(cnpj);

  if (normalized.length !== 14) {
    const message = 'CNPJ inválido. Digite 14 dígitos.';
    logAudit({
      resource: 'cnpj',
      query: normalized,
      timestamp: new Date().toISOString(),
      result: 'error',
      message,
    });
    throw new Error(message);
  }

  const cachedApi = cacheGet<CnpjResponse>(cacheKey(normalized));
  if (cachedApi) {
    return finalizeValidation(normalized, cachedApi, true);
  }

  let apiData: CnpjResponse;

  try {
    const { data } = await brasilApiFetch<CnpjResponse>(
      `/api/cnpj/v1/${normalized}`,
      'cnpj',
    );
    apiData = data;
  } catch (error) {
    const message =
      error instanceof BrasilApiError
        ? error.message
        : 'Erro ao validar CNPJ. Tente novamente mais tarde.';

    logAudit({
      resource: 'cnpj',
      query: normalized,
      timestamp: new Date().toISOString(),
      result: 'error',
      message,
    });

    throw new Error(message);
  }

  return finalizeValidation(normalized, apiData, false);
}
