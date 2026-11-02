# MedClinic API

API REST de gestão de clínica médica: autenticação, perfis de acesso, pacientes, médicos, escala de trabalho, agendamento de consultas e prontuário.

## Tecnologias

Node.js 22, TypeScript, Express, TypeORM, PostgreSQL, JWT, bcrypt, Vitest, ESLint, Prettier, Docker e GitHub Actions.

## Arquitetura

Camadas: **rotas → middlewares → controllers → services → repositories → banco**. Todas as classes recebem suas dependências pelo construtor; a montagem acontece em um único lugar, o composition root (`src/container.ts`).

```
src/
  config/        variáveis de ambiente
  controllers/   camada HTTP
  services/      regras de negócio (cobertas por testes)
  repositories/  acesso a dados (TypeORM)
  entities/      tabelas
  dtos/          contratos de entrada e saída
  middlewares/   autenticação, autorização, erros, validação
  routes/        rotas sob /api/v1
  database/      data-source e migrations
  utils/         hash, jwt, paginação, datas
  container.ts   composition root
```

## Pré-requisitos

Node.js 22+, npm e Docker.

## Instalação e execução local

```bash
git clone <URL_DO_REPOSITORIO>
cd medclinic-api
npm install
cp .env.example .env        # ajuste os valores
docker compose up -d        # PostgreSQL local na porta 5434
npm run migration:run       # cria as tabelas e o administrador inicial
npm run dev                 # http://localhost:3000/api/v1/health
```

### Variáveis de ambiente

| Variável                                                          | Descrição                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------- |
| `PORT`                                                            | Porta da API (padrão 3000)                                    |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Conexão com o PostgreSQL                                      |
| `DB_SSL`                                                          | `true` em bancos gerenciados                                  |
| `JWT_SECRET`                                                      | Chave de assinatura do token (use um valor longo e aleatório) |
| `JWT_EXPIRES_IN`                                                  | Validade do token (ex.: `1h`)                                 |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`                         | Credenciais do primeiro administrador, criado pela migration  |

## Scripts

| Comando                                                      | O que faz                             |
| ------------------------------------------------------------ | ------------------------------------- |
| `npm run dev`                                                | Desenvolvimento com recarga           |
| `npm run build` / `npm start`                                | Compila e executa em produção         |
| `npm run migration:generate -- src/database/migrations/Nome` | Gera migration a partir das entidades |
| `npm run migration:run`                                      | Aplica as migrations                  |
| `npm test` / `npm run test:cov`                              | Testes e cobertura                    |
| `npm run lint` / `npm run format`                            | ESLint e Prettier                     |

## Docker

```bash
docker build -t medclinic-api .
docker run --env-file .env -p 3000:3000 medclinic-api
```

A imagem é multi-stage e roda as migrations ao iniciar (`npm run start:prod`).
