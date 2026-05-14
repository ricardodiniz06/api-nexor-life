import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { RequestIdInterceptor } from './interceptors/request-id.interceptor';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HealthController } from './health.controller';
import { RootController } from './root.controller';

@Global()
@Module({
  controllers: [HealthController, RootController],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestIdInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class CoreModule {}
