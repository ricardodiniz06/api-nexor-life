import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { HttpExceptionFilter, type ApiErrorBody } from './http-exception.filter';

/**
 * Last-resort handler so unknown errors still match the public error contract.
 * HttpException is delegated to HttpExceptionFilter — @Catch() would otherwise
 * swallow 4xx/409 before the specific filter runs (Nest runs global filters
 * in reverse registration order).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly httpExceptionFilter = new HttpExceptionFilter();

  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof HttpException) {
      this.httpExceptionFilter.catch(exception, host);
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();
    const path = request.url ?? request.path;

    const err = exception as {
      message?: string;
      stack?: string;
      name?: string;
    };
    const message =
      typeof err?.message === 'string' ? err.message : 'Internal server error';

    this.logger.error(`${err?.name ?? 'Error'}: ${message}`, err?.stack);

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const payload: ApiErrorBody = {
      statusCode: status,
      message: 'Internal server error',
      error: 'Internal Server Error',
      path,
      timestamp: new Date().toISOString(),
      ...(request.requestId ? { requestId: request.requestId } : {}),
    };

    response.status(status).json(payload);
  }
}
