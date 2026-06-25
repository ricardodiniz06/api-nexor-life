const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

type RateLimitWindow = {
  count: number;
  windowStart: number;
};

const windows = new Map<string, RateLimitWindow>();

export class RateLimitError extends Error {
  constructor() {
    super('Limite de consultas excedido. Aguarde um minuto e tente novamente.');
    this.name = 'RateLimitError';
  }
}

export function checkRateLimit(userId: string): void {
  const now = Date.now();
  const current = windows.get(userId);

  if (!current || now - current.windowStart >= WINDOW_MS) {
    windows.set(userId, { count: 1, windowStart: now });
    return;
  }

  if (current.count >= MAX_REQUESTS) {
    throw new RateLimitError();
  }

  current.count += 1;
}

export function resetRateLimits(): void {
  windows.clear();
}
