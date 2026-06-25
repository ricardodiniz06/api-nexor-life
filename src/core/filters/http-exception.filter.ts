import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type Request, type Response } from 'express';

export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
  requestId?: string;
  details?: unknown;
};

const httpStatusLabelsPt: Record<string, string> = {
  BadRequest: 'Requisição inválida',
  Unauthorized: 'Não autorizado',
  Forbidden: 'Acesso negado',
  NotFound: 'Não encontrado',
  Conflict: 'Conflito',
  UnprocessableEntity: 'Entidade não processável',
  TooManyRequests: 'Muitas requisições',
  BadGateway: 'Erro no serviço externo',
  GatewayTimeout: 'Tempo limite excedido',
  InternalServerError: 'Erro interno do servidor',
};

/**
 * Uniform JSON errors for the Next.js frontend — do not log PHI/PII bodies here.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();
    const status = exception.getStatus();
    const res = exception.getResponse();
    const path = request.url ?? request.path;

    let message: string | string[] = exception.message;
    let details: unknown;
    let errorName = HttpStatus[status] ?? 'Error';

    if (typeof res === 'object' && res !== null) {
      const body = res as Record<string, unknown>;
      if (typeof body.message === 'string' || Array.isArray(body.message)) {
        message = body.message as string | string[];
      }
      if (typeof body.error === 'string') {
        errorName = body.error;
      }
      if (body.details !== undefined) {
        details = body.details;
      }
    }

    if (Number(status) >= 500) {
      this.logger.error(`HTTP ${status} ${path} — ${JSON.stringify(message)}`);
    }

    const payload: ApiErrorBody = {
      statusCode: status,
      message,
      error: httpStatusLabelsPt[errorName] ?? errorName,
      path,
      timestamp: new Date().toISOString(),
      ...(request.requestId ? { requestId: request.requestId } : {}),
      ...(details !== undefined ? { details } : {}),
    };

    response.status(status).json(payload);
  }
}
