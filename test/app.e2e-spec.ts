import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Nexor Life API (e2e)', () => {
  let app: INestApplication;

  beforeAll(() => {
    process.env.JWT_SECRET ??= 'unit-test-jwt-secret-must-be-at-least-32-chars';
    process.env.DATABASE_URL ??=
      'postgres://postgres:postgres@127.0.0.1:5432/nexor_life';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/v1/health', () => {
    return request(app.getHttpServer() as Server)
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as { status: string; timestamp: string };
        expect(body.status).toBe('ok');
        expect(body.timestamp).toBeDefined();
      });
  });
});
