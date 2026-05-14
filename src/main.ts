import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
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
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
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
        'API REST da plataforma Nexor Life para operação em saúde. Datas em ISO 8601 salvo indicação contrária. ' +
          'Rotas de dashboard são agregações somente leitura (podem ser cacheadas / evoluir para views materializadas).',
      )
      .setVersion('1.0.0')
      .addBearerAuth(undefined, 'access-token')
      .addTag('alerts', 'Alertas operacionais')
      .addTag('auth', 'Autenticação')
      .addTag('dashboard', 'Agregados somente leitura para a UI executiva')
      .addTag('health', 'Disponibilidade do serviço')
      .addTag('indicators', 'Indicadores de qualidade e operação')
      .addTag('integrations', 'Sistemas externos')
      .addTag('patients', 'Pacientes e pontos de entrada do prontuário')
      .addTag('reports', 'Relatórios')
      .addTag('settings', 'Configurações do tenant')
      .addTag('users', 'Perfis e RBAC')
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
