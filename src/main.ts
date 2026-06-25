import {
  BadRequestException,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { formatValidationErrors } from './common/validation/validation-messages';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

function parseCorsOrigins(
  raw: string | undefined,
): boolean | string | string[] {
  if (!raw || raw === '*') {
    return true;
  }
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length === 1 ? parts[0] : parts;
}

function shouldExposeSwagger(config: ConfigService): boolean {
  if (config.get<string>('SWAGGER_ENABLED') === 'true') {
    return true;
  }
  return config.get<string>('NODE_ENV') !== 'production';
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('query parser', 'extended');
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException(formatValidationErrors(errors)),
    }),
  );

  const apiBase = (config.get<string>('API_BASE_PATH') ?? 'api/v1').replace(
    /^\/+|\/+$/g,
    '',
  );
  app.setGlobalPrefix(apiBase, {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  app.enableCors({
    origin: parseCorsOrigins(config.get<string>('FRONTEND_ORIGIN')),
    credentials: true,
  });

  if (shouldExposeSwagger(config)) {
    const swagger = new DocumentBuilder()
      .setTitle('Nexor Life API')
      .setDescription(
        'API REST IAM da plataforma Nexor Life. Autenticação, utilizadores e papéis RBAC. ' +
          'Datas em ISO 8601 salvo indicação contrária.',
      )
      .setVersion('1.0.0')
      .addBearerAuth(undefined, 'access-token')
      .addTag('auth', 'Autenticação')
      .addTag('users', 'Utilizadores IAM')
      .addTag('roles', 'Papéis RBAC')
      .addTag('convenios', 'Convênios')
      .addTag('integrations', 'Integrações externas')
      .build();

    const document = SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  const port = Number.parseInt(
    String(config.get<string>('PORT') ?? '3000'),
    10,
  );
  await app.listen(port);
}

void bootstrap();
