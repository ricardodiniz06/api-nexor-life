# Nexor Life API

Backend NestJS para o **Nexor Life**, alinhado ao app Next.js (rotas em inglês como `/medical-records`, `/reports`, `/users`). Contratos JSON, prefixo `/api/v1`, datas em ISO 8601 e paginação por offset (`page`, `limit`) nas listagens.

## Onde corre o quê

| Ambiente | Base de dados | API NestJS |
|----------|----------------|------------|
| **Local (desenvolvimento)** | Postgres no Docker (`docker compose up postgres`) ou instância local | `npm run start:dev` na tua máquina (hot reload) |
| **Nuvem (produção / staging)** | Postgres gerido pelo PaaS ou serviço dedicado (Neon, RDS, etc.) | Imagem Docker (neste repositório) com deploy por Git ou pipeline |

O **Docker Compose** deste projeto serve sobretudo para **reproduzir Postgres (e opcionalmente a API) na tua máquina** — não é o modelo obrigatório para produção. Em produção o objetivo é: **push para o Git → a plataforma faz build e deploy**; a URL da API e `DATABASE_URL` vêm do painel da nuvem.

### Grátis ou “quase grátis” (pouco uso / MVP)

Não precisas de cartão para **começar** em vários sítios; o trade-off é **limits**, **cold start** (primeiro pedido lento) ou **DB e API em sítios diferentes**:

| Abordagem | Ideia |
|-----------|--------|
| **[Neon](https://neon.tech)** (Postgres grátis) + **[Render](https://render.com)** Web grátis | Crias o projeto na Neon, copias o `DATABASE_URL` para o serviço da API no Render (Dockerfile). Boa para testes e poucos utilizadores. |
| **[Supabase](https://supabase.com)** (Postgres grátis) + API no **Render** / **Railway** | Mesmo padrão: só usas o Postgres do Supabase; a API é outro serviço (variável `DATABASE_URL`). |
| **Só Render** (`render.yaml` deste repo) | Web Service pode ser grátis (adormece); confirma no site deles se o **Postgres** na tua conta ainda entra em plano gratuito — as regras mudam. |
| **[Fly.io](https://fly.io)** | Há **crédito grátis** mensal; dá para API + Postgres pequeno dentro do limite. |

Para **poucas chamadas e poucos dados**, o mais simples costuma ser **Neon (DB grátis) + Render (API grátis)** com `DATABASE_URL` colada no painel — sem depender do `render.yaml` para criar dois recursos na Render se quiseres evitar pagar Postgres lá.

### Supabase (Postgres) + Render (API)

**Sim — é uma combinação muito usada.** O Supabase expõe **Postgres**; a API Nest corre na **Render** e liga-se só com variáveis de ambiente.

1. **Supabase** — Cria o projeto → **Project Settings → Database**. Copia a **connection string** (URI), em modo adequado a serviços persistentes costuma ser **Direct** (`porta 5432`). Cola na variável **`DATABASE_URL`** do serviço na Render (a string já inclui `?sslmode=require` ou equivalente — o driver `pg` aceita).
2. **Render** — **New → Web Service** → liga o repo → escolhe **Docker** e o `Dockerfile` na raiz. **Não** precisas do Postgres da Render neste cenário (não uses o `render.yaml` com dupla base, ou remove o bloco `databases` / o `fromDatabase` e define só a Web Service com `DATABASE_URL` manual).
3. **Variáveis na Render** (Environment do serviço `nexor-api` ou nome que deres):  
   `DATABASE_URL` (secret do Supabase), `JWT_SECRET`, `FRONTEND_ORIGIN`, `API_BASE_PATH=api/v1`, `NODE_ENV=production`, `SWAGGER_ENABLED=false` (ou `true` se quiseres `/docs`).
4. **Deploy** — O container corre migrations no arranque e inicia a app. Testa `GET /api/v1/health` na URL `*.onrender.com`.

**Nota:** Reserva o **Auth / Row Level Security** do Supabase para o que fizeres no cliente Supabase; a **API Nest** usa o Postgres como qualquer servidor (`DATABASE_URL`). Se no futuro usares o Auth do Supabase no Next.js, isso é independente da API Nest — combinam por JWT ou por utilizadores na tua própria tabela `users`.

## Deploy na nuvem (PostgreSQL + API)

Fluxo típico em qualquer PaaS:

1. Criar ou ligar o **repositório Git** (GitHub/GitLab/Bitbucket).
2. Criar um **PostgreSQL gerido** na mesma região que a API (ou Neon/Supabase só em DB + API noutro serviço).
3. Definir variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN`, etc. — ver `.env.example`).
4. **Deploy** usando o **`Dockerfile`** na raiz: no arranque corre **migrations** e depois a app (`docker/entrypoint.sh`).

Plataformas onde isto encaixa bem (deploy contínuo ao fazer push):

| Plataforma | Notas |
|------------|--------|
| **[Render](https://render.com)** | Blueprint em `render.yaml` (Postgres + Web Docker). Dashboard: **New → Blueprint**. |
| **[Railway](https://railway.app)** | Adicionar Postgres + serviço a partir do Dockerfile ou repo; variáveis no painel. |
| **[Fly.io](https://fly.io)** | `fly launch` + Postgres (`fly postgres create`); secrets para `JWT_SECRET` e `DATABASE_URL`. |
| **AWS / GCP / Azure** | ECS, Cloud Run, App Service: mesma imagem; RDS/Cloud SQL para Postgres. |

Ficheiro de exemplo para **Render Blueprint**: [`render.yaml`](./render.yaml) — liga o `DATABASE_URL` ao Postgres gerido da Render e expõe health check em `/api/v1/health`.

### Render — passo a passo

1. **Conta e Git** — Cria conta em [render.com](https://render.com) e liga o **GitHub** ou **GitLab** ao Render (para o Render ler o teu repositório).
2. **Push do código** — Garante que `render.yaml`, `Dockerfile` e `docker/entrypoint.sh` estão na **raiz** do repo e faz push da branch que vais usar (ex.: `main`).
3. **New → Blueprint** — No dashboard, **New +** → **Blueprint** → escolhe o repositório e a branch. O Render deve detetar `render.yaml` na raiz.
4. **Rever o preview** — Deves ver dois recursos: base **Postgres** (`nexor-postgres`) e **Web Service** Docker (`nexor-api`).
5. **Secretos e CORS** — O blueprint pede manualmente (primeira vez): **`JWT_SECRET`** (≥32 caracteres, aleatório) e **`FRONTEND_ORIGIN`** (URL do Next em produção, ex.: `https://teu-dominio.com`). Se não aparecerem no assistente, defines depois em **Environment** do serviço `nexor-api`.
6. **Aplicar** — Confirma o deploy. O Render faz **build** do Docker; ao arrancar, o script corre **migrations** e inicia a API.
7. **Testar** — URL tipo `https://nexor-api.onrender.com`: abre `GET .../api/v1/health` no browser ou curl.
8. **Deploys automáticos** — Em **Settings** do serviço web, ativa **Auto-Deploy** na branch escolhida para cada **push** gerar novo deploy.

**Atenção:** no plano gratuito o Web Service pode **adormecer** após inatividade (primeiro pedido demora mais). Postgres na Render em plano free tem limitações; para produção estável avalia planos pagos.

## Stack

- NestJS 11, TypeScript strict, `class-validator` / `class-transformer`, `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`).
- TypeORM + PostgreSQL — **alterações de schema apenas via migrations** (`TYPEORM_SYNCHRONIZE` opcional só em ambiente dev descartável; padrão desligado).
- OpenAPI com `@nestjs/swagger` — UI em `/docs` quando habilitado (fora de produção por padrão, ou `SWAGGER_ENABLED=true`).

## Início rápido

**Desenvolvimento (Postgres no Docker, API na máquina com watch):**

```bash
npm install
cp .env.example .env
docker compose up postgres -d
npm run typeorm:migration:run
npm run db:seed   # opcional — cria admin@nexor.life
npm run start:dev
```

**Opcional — simular “stack completa” só no teu PC** (Postgres + API em contentores; para testar imagem antes da nuvem, não substitui deploy):

```bash
npm install
JWT_SECRET=defina-um-segredo-longo npm run docker:up
```

- Saúde: `GET http://localhost:3000/api/v1/health`
- Swagger: `http://localhost:3000/docs` (se habilitado)
- Login: `POST /api/v1/auth/login` → use `Authorization: Bearer <token>` nas rotas protegidas.

## Docker (apenas ambiente local)

Estes comandos ajudam a ter **Postgres (e opcionalmente a API) na tua máquina**. Para **nuvem**, usa o [`render.yaml`](./render.yaml) ou outro PaaS conforme a secção **Deploy na nuvem**.

### Só PostgreSQL

```bash
docker compose up postgres -d
cp .env.example .env
# Ajuste DATABASE_URL se a porta for diferente
npm run typeorm:migration:run
npm run start:dev
```

### PostgreSQL + API em Docker

Com o **Docker Desktop** (ou outro motor Docker) a correr:

```bash
npm run docker:up
```

Isto faz build da imagem, sobe Postgres e a API. No arranque do contentor da API são executadas as **migrations** e depois o `node dist/main`.

- API: `http://localhost:3000` — use `API_PORT` para mudar a porta publicada (ex.: `API_PORT=3001 npm run docker:up`).
- Postgres: `localhost:5432` — use `POSTGRES_PORT` se precisares de mapear outra porta no host.

Parar e ver logs:

```bash
npm run docker:down
npm run docker:logs
```

Para testar o contentor da API localmente com o Compose, define `JWT_SECRET` antes de `npm run docker:up` (não comites segredos).

## CI (GitHub Actions)

O ficheiro `.github/workflows/ci.yml` corre em **push** e **pull request**: `npm ci` → `lint:ci` → `build` → migrations em Postgres de serviço → testes unitários → testes e2e.

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
| `npm run lint` | ESLint com `--fix` |
| `npm run lint:ci` | ESLint sem alterar ficheiros (para CI) |
| `npm run ci` | `lint:ci` + `build` + `test` (atalho local) |
| `npm run typeorm:migration:generate` | Gera migration (ver fluxo acima) |
| `npm run typeorm:migration:run` | Aplica migrations pendentes |
| `npm run typeorm:migration:revert` | Reverte a última migration |
| `npm run db:seed` | Seed opcional do usuário admin |
| `npm run docker:up` | `docker compose up -d --build` (Postgres + API) |
| `npm run docker:down` | `docker compose down` |
| `npm run docker:logs` | Logs em tempo real do serviço `api` |
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
