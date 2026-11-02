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

## Perfis de acesso e administrador inicial

Perfis: `admin`, `secretary` e `doctor` (o campo `roles` de um usuário é uma lista).

**Não existe cadastro público.** O primeiro administrador é criado pela migration de seed com `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`. Defina uma senha forte no ambiente de produção e troque a senha de teste após o primeiro acesso. Somente um administrador autenticado cria outros usuários (`POST /api/v1/users`).

## Endpoints (prefixo `/api/v1`)

| Método e rota                                | Perfis                    | Descrição                                            |
| -------------------------------------------- | ------------------------- | ---------------------------------------------------- |
| `GET /health`                                | público                   | Verificação de saúde                                 |
| `POST /auth/login`                           | público                   | Login; devolve `{ "accessToken": "..." }`            |
| `GET /users/me`                              | autenticado               | Usuário logado                                       |
| `POST /users`                                | admin                     | Cria usuário com `roles`                             |
| `POST /patients`                             | admin, secretary          | Cadastra paciente (CPF único)                        |
| `GET /patients`, `GET /patients/:id`         | autenticado               | Lista (paginada) e detalhe                           |
| `PATCH /patients/:id`                        | admin, secretary          | Atualiza paciente                                    |
| `DELETE /patients/:id`                       | admin                     | Remove paciente (soft delete)                        |
| `POST /doctors`                              | admin                     | Cria médico e usuário na mesma transação (CRM único) |
| `GET /doctors`, `GET /doctors/:id`           | autenticado               | Lista e detalhe                                      |
| `PUT /doctors/:id/work-schedule`             | admin                     | Substitui a escala (turnos por dia da semana)        |
| `GET /doctors/:id/work-schedule`             | autenticado               | Consulta a escala                                    |
| `GET /doctors/:id/calendar?from=&to=`        | autenticado               | Escala e consultas do período (máx. 31 dias)         |
| `POST /appointments`                         | admin, secretary          | Agenda consulta (valida escala, grade e conflitos)   |
| `GET /appointments`, `GET /appointments/:id` | autenticado               | Lista e detalhe (médico vê só as próprias)           |
| `PATCH /appointments/:id/status`             | conforme a transição      | `scheduled → in_progress → done` ou `cancelled`      |
| `POST /patients/:id/medical-records`         | doctor com vínculo        | Registra prontuário                                  |
| `GET /patients/:id/medical-records`          | doctor com vínculo, admin | Lista prontuários                                    |

Listagens usam o envelope `{ "data": [...], "meta": { "total", "page", "pageSize", "totalPages" } }`.

### Formato de erro

```json
{
  "statusCode": 409,
  "error": "HORARIO_INDISPONIVEL",
  "message": "Este horário acabou de ser ocupado."
}
```

Códigos: `DADOS_INVALIDOS`, `NAO_AUTENTICADO`, `CREDENCIAIS_INVALIDAS`, `ACESSO_NEGADO`, `RECURSO_NAO_ENCONTRADO`, `EMAIL_JA_CADASTRADO`, `CPF_JA_CADASTRADO`, `CRM_JA_CADASTRADO`, `HORARIO_INDISPONIVEL`, `PACIENTE_INDISPONIVEL`, `HORARIO_FORA_DA_ESCALA`, `TRANSICAO_INVALIDA`.

### Concorrência

O agendamento usa lock pessimista na linha do médico dentro de uma transação, então dois pedidos simultâneos para o mesmo horário resultam em um `201` e um `409`.
