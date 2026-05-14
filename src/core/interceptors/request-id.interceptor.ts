import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { type Observable } from 'rxjs';
import { type Request, type Response } from 'express';

const HEADER = 'x-request-id';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { requestId?: string }>();
    const res = http.getResponse<Response>();

    const id =
      (typeof req.headers[HEADER] === 'string' && req.headers[HEADER]) ||
      randomUUID();
    req.requestId = id;
    res.setHeader(HEADER, id);

    return next.handle();
  }
}
