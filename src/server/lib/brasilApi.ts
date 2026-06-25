const BASE_URL = 'https://brasilapi.com.br';
const TIMEOUT_MS = 5000;
const RETRY_DELAYS_MS = [0, 1000, 3000] as const;
const USER_AGENT = 'NexorLife-API/1.0 (+https://nexor.life)';

export type CepResponse = {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  location: {
    type: string;
    coordinates: number[];
  };
  timezoneName: string;
};

export type CnpjResponse = {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string | null;
  ddd_telefone_1: string;
  situacao_cadastral: number;
  descricao_situacao_cadastral: string;
  data_inicio_atividade: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  porte: string;
  capital_social: number;
};

export type BrasilApiErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'NETWORK';

export class BrasilApiError extends Error {
  readonly code: BrasilApiErrorCode;
  readonly statusCode?: number;
  readonly attempt: number;
  readonly causeDetail?: string;

  constructor(
    message: string,
    code: BrasilApiErrorCode,
    options?: { statusCode?: number; attempt?: number; cause?: string },
  ) {
    super(message);
    this.name = 'BrasilApiError';
    this.code = code;
    this.statusCode = options?.statusCode;
    this.attempt = options?.attempt ?? RETRY_DELAYS_MS.length;
    this.causeDetail = options?.cause;
  }
}

function assertHttps(url: string): void {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') {
    throw new BrasilApiError(
      'Somente requisições HTTPS são permitidas.',
      'NETWORK',
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapHttpStatusToError(
  status: number,
  resource: 'cep' | 'cnpj',
): BrasilApiError {
  if (status === 400) {
    return new BrasilApiError(
      resource === 'cep'
        ? 'CEP inválido. Digite 8 dígitos.'
        : 'CNPJ inválido. Digite 14 dígitos.',
      'BAD_REQUEST',
      { statusCode: status },
    );
  }
  if (status === 404) {
    return new BrasilApiError(
      resource === 'cep'
        ? 'CEP não encontrado. Verifique e tente novamente.'
        : 'CNPJ não encontrado. Verifique e tente novamente.',
      'NOT_FOUND',
      { statusCode: status },
    );
  }
  if (status >= 500) {
    return new BrasilApiError(
      resource === 'cep'
        ? 'Erro ao consultar CEP. Tente novamente mais tarde.'
        : 'Erro ao validar CNPJ. Tente novamente mais tarde.',
      'SERVER_ERROR',
      { statusCode: status },
    );
  }
  return new BrasilApiError(
    resource === 'cep'
      ? 'Erro ao consultar CEP. Tente novamente mais tarde.'
      : 'Erro ao validar CNPJ. Tente novamente mais tarde.',
    'NETWORK',
    { statusCode: status },
  );
}

function isRetryableError(error: BrasilApiError): boolean {
  return (
    error.code === 'TIMEOUT' ||
    error.code === 'NETWORK' ||
    error.code === 'SERVER_ERROR'
  );
}

async function fetchOnce(url: string): Promise<Response> {
  assertHttps(url);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new BrasilApiError(
        'Tempo limite excedido. Tente novamente.',
        'TIMEOUT',
      );
    }
    const cause =
      error instanceof Error && error.cause instanceof Error
        ? error.cause.message
        : error instanceof Error
          ? error.message
          : undefined;
    throw new BrasilApiError(
      'Falha de rede ao consultar a Brasil API.',
      'NETWORK',
      { cause },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export type BrasilApiFetchResult<T> = {
  status: number;
  data: T;
  attempt: number;
};

export async function brasilApiFetch<T>(
  path: string,
  resource: 'cep' | 'cnpj',
): Promise<BrasilApiFetchResult<T>> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  assertHttps(url);

  let lastError: BrasilApiError | null = null;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
    const delay = RETRY_DELAYS_MS[attempt];
    if (delay > 0) {
      await sleep(delay);
    }

    try {
      const response = await fetchOnce(url);

      if (response.status === 400 || response.status === 404) {
        throw mapHttpStatusToError(response.status, resource);
      }

      if (!response.ok) {
        const error = mapHttpStatusToError(response.status, resource);
        if (isRetryableError(error) && attempt < RETRY_DELAYS_MS.length - 1) {
          lastError = new BrasilApiError(error.message, error.code, {
            statusCode: error.statusCode,
            attempt: attempt + 1,
          });
          continue;
        }
        throw error;
      }

      const data = (await response.json()) as T;
      return { status: response.status, data, attempt: attempt + 1 };
    } catch (error) {
      if (error instanceof BrasilApiError) {
        if (isRetryableError(error) && attempt < RETRY_DELAYS_MS.length - 1) {
          lastError = new BrasilApiError(error.message, error.code, {
            statusCode: error.statusCode,
            attempt: attempt + 1,
          });
          continue;
        }
        throw new BrasilApiError(error.message, error.code, {
          statusCode: error.statusCode,
          attempt: attempt + 1,
        });
      }
      const networkError = new BrasilApiError(
        'Falha de rede ao consultar a Brasil API.',
        'NETWORK',
        { attempt: attempt + 1 },
      );
      if (attempt < RETRY_DELAYS_MS.length - 1) {
        lastError = networkError;
        continue;
      }
      throw networkError;
    }
  }

  throw (
    lastError ??
    new BrasilApiError(
      resource === 'cep'
        ? 'Erro ao consultar CEP. Tente novamente mais tarde.'
        : 'Erro ao validar CNPJ. Tente novamente mais tarde.',
      'NETWORK',
      { attempt: RETRY_DELAYS_MS.length },
    )
  );
}

export function getCepUrl(cep: string): string {
  return `${BASE_URL}/api/cep/v2/${cep}`;
}

export function getCnpjUrl(cnpj: string): string {
  return `${BASE_URL}/api/cnpj/v1/${cnpj}`;
}

export const BRASIL_API_RETRY_DELAYS_MS = RETRY_DELAYS_MS;
