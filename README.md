# Nexor Life API

Backend NestJS para o **Nexor Life**, alinhado ao app Next.js (rotas em inglês como `/medical-records`, `/reports`, `/users`). Contratos JSON, prefixo `/api/v1`, datas em ISO 8601 e paginação por offset (`page`, `limit`) nas listagens.

## Stack

- NestJS 11, TypeScript strict, `class-validator` / `class-transformer`, `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`).
- TypeORM + PostgreSQL — **alterações de schema apenas via migrations** (`TYPEORM_SYNCHRONIZE` opcional só em ambiente dev descartável; padrão desligado).
- OpenAPI com `@nestjs/swagger` — UI em `/docs` quando habilitado (fora de produção por padrão, ou `SWAGGER_ENABLED=true`).

## Início rápido

```bash
npm install
cp .env.example .env
# Subir Postgres (opcional, banco local)
docker compose up -d
npm run typeorm:migration:run
# Opcional: criar admin@nexor.life (defina SEED_ADMIN_PASSWORD ou use o padrão uma vez)
npm run db:seed
npm run start:dev
```

- Saúde: `GET http://localhost:3000/api/v1/health`
- Swagger: `http://localhost:3000/docs` (se habilitado)
- Login: `POST /api/v1/auth/login` → use `Authorization: Bearer <token>` nas rotas protegidas.

## Variáveis de ambiente

Ver `.env.example`. Principais chaves:

| Variável | Uso |
|----------|-----|
| `PORT` | Porta HTTP |
| `API_BASE_PATH` | Padrão `api/v1` (sem barra inicial/final) |
| `DATABASE_URL` ou `DB_*` | Conexão PostgreSQL |
| `JWT_SECRET` | Chave de assinatura (valor longo e aleatório em produção) |
| `FRONTEND_ORIGIN` | CORS — origens separadas por vírgula ou `*` (só dev) |
| `SWAGGER_ENABLED` | `true` força OpenAPI mesmo com `NODE_ENV=production` |

## Migrations (TypeORM CLI)

Usa `src/database/data-source.ts` e `tsconfig.typeorm.json` (CommonJS adequado ao CLI).

1. **Altere** a entidade em `src/**/entities/*.entity.ts`.
2. **Gere** a migration (nome/caminho depois de `--`):

   ```bash
   npm run typeorm:migration:generate -- src/database/migrations/DescribeSuaAlteracao
   ```

3. **Revise** o SQL gerado em `src/database/migrations/`.
4. **Aplique** em dev:

   ```bash
   npm run typeorm:migration:run
   ```

5. **Reverta** a última migration se necessário:

   ```bash
   npm run typeorm:migration:revert
   ```

6. **Commite** o arquivo de migration junto com a entidade.

Exemplo de entidade + migration: `User` em `src/users/entities/user.entity.ts` e `src/database/migrations/1736889600000-CreateUsersTable.ts`.

**Produção:** rode migrations sobre o build (`npm run build`), apontando o CLI para `dist/database/data-source.js` (mesmas variáveis da app).

Seeds **não** são migrations — use `npm run db:seed` só para dados iniciais opcionais.

## Organização (bounded contexts)

| Caminho | Papel |
|---------|-------|
| `src/core/` | Filtros globais, interceptor de request id, guards JWT/RBAC, `Public` / `Roles`, health |
| `src/database/` | Config TypeORM, `data-source` do CLI, `migrations/`, `seed.ts` opcional |
| `src/auth/` | Login, estratégia JWT |
| `src/users/` | Perfis e listagem + `/users/me` |
| `src/patients/` | Diretório clínico (placeholder; RBAC em mutações depois) |
| `src/dashboard/` | **Agregações somente leitura**: `/dashboard/summary`, `/dashboard/charts`, `/dashboard/activity` |
| `src/reports/`, `src/indicators/`, `src/alerts/`, `src/integrations/`, `src/settings/` | Primeiro corte de contrato + stubs |

Regra: agregações pesadas da home ficam no **`dashboard`**; módulos de domínio expõem CRUD/detalhe quando substituírem os mocks.

## Segurança e compliance

- Colunas de auditoria em `users`: `createdAt`, `updatedAt`, `createdBy`.
- **Não** registrar PHI/PII em texto claro (ex.: CPF, diagnóstico) — os filtros logam só metadados HTTP seguros.
- RBAC: `UserRole` (`admin`, `clinician`, `viewer`) — expandir guards nas rotas clínicas conforme os domínios crescerem.

## Scripts npm

| Script | Ação |
|--------|------|
| `npm run start:dev` | Servidor de desenvolvimento com watch |
| `npm run build` | Compila para `dist/` |
| `npm run start:prod` | Executa `node dist/main` |
| `npm run typeorm:migration:generate` | Gera migration (ver fluxo acima) |
| `npm run typeorm:migration:run` | Aplica migrations pendentes |
| `npm run typeorm:migration:revert` | Reverte a última migration |
| `npm run db:seed` | Seed opcional do usuário admin |
| `npm run test` | Testes unitários |
| `npm run test:e2e` | E2E (espera Postgres conforme `.env`) |

## Formato de erro

```json
{
  "statusCode": 400,
  "message": "falha de validação",
  "error": "Bad Request",
  "path": "/api/v1/...",
  "timestamp": "2026-05-14T12:00:00.000Z",
  "requestId": "uuid",
  "details": null
}
```
