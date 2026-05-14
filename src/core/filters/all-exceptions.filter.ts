import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { type ApiErrorBody } from './http-exception.filter';

/**
 * Last-resort handler so unknown errors still match the public error contract.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
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
