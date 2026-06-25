import {
  BrasilApiError,
  brasilApiFetch,
  type CepResponse,
} from '../lib/brasilApi';
import { cacheGet, cacheSet } from '../lib/cache';
import { logAudit } from '../lib/audit-log';
import { checkRateLimit } from '../lib/rate-limiter';

export type AddressResult = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type GetAddressByCepOptions = {
  userId?: string;
};

function normalizeCep(cep: string): string {
  return cep.replace(/\D/g, '');
}

function toAddressResult(data: CepResponse): AddressResult {
  return {
    cep: data.cep.replace(/\D/g, ''),
    street: data.street,
    neighborhood: data.neighborhood,
    city: data.city,
    state: data.state,
  };
}

function cacheKey(cep: string): string {
  return `cep:${cep}`;
}

export async function getAddressByCep(
  cep: string,
  options: GetAddressByCepOptions = {},
): Promise<AddressResult> {
  const normalized = normalizeCep(cep);

  if (normalized.length !== 8) {
    const message = 'CEP inválido. Digite 8 dígitos.';
    logAudit({
      resource: 'cep',
      query: normalized,
      timestamp: new Date().toISOString(),
      result: 'error',
      message,
    });
    throw new Error(message);
  }

  if (options.userId) {
    checkRateLimit(options.userId);
  }

  const cached = cacheGet<AddressResult>(cacheKey(normalized));
  if (cached) {
    logAudit({
      resource: 'cep',
      query: normalized,
      timestamp: new Date().toISOString(),
      result: 'cached',
    });
    return cached;
  }

  try {
    const { data } = await brasilApiFetch<CepResponse>(
      `/api/cep/v2/${normalized}`,
      'cep',
    );

    const result = toAddressResult(data);
    cacheSet(cacheKey(normalized), result);

    logAudit({
      resource: 'cep',
      query: normalized,
      timestamp: new Date().toISOString(),
      result: 'success',
    });

    return result;
  } catch (error) {
    const message =
      error instanceof BrasilApiError
        ? error.message
        : 'Erro ao consultar CEP. Tente novamente mais tarde.';

    logAudit({
      resource: 'cep',
      query: normalized,
      timestamp: new Date().toISOString(),
      result: 'error',
      message,
    });

    throw new Error(message);
  }
}
