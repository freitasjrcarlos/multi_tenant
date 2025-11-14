# Multi-tenant Platform Backend

Backend Node.js + Express + TypeScript + Prisma para plataforma multi-tenant.

## 🚀 Tecnologias

- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (autenticação via cookie httpOnly)
- Swagger (documentação da API)
- Jest (testes unitários)
- Docker Compose

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie o banco de dados:
```bash
docker-compose up -d
```

5. Execute as migrações:
```bash
npm run prisma:migrate
```

6. (Opcional) Popule o banco com dados fake:
```bash
npm run prisma:seed
```

7. Inicie o servidor:
```bash
npm run dev
```

## 📚 Endpoints da API

### Autenticação
- `POST /auth/signup` - Criar conta
- `POST /auth/accept-invite` - Aceitar convite

### Empresas
- `POST /companies` - Criar empresa (autenticado)
- `GET /companies` - Listar empresas do usuário (autenticado)
- `POST /companies/:id/select` - Selecionar empresa ativa (autenticado)
- `GET /companies/:id` - Obter empresa por ID (autenticado)

### Convites
- `POST /companies/:id/invite` - Criar convite (OWNER/ADMIN)

## 📖 Documentação Swagger

Acesse `http://localhost:3000/api-docs` para ver a documentação completa da API.

## 🧪 Testes

```bash
# Executar testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 🔍 Lint

```bash
# Verificar erros
npm run lint

# Corrigir erros automaticamente
npm run lint:fix
```

## 🗄️ Banco de Dados

### Comandos Prisma

```bash
# Gerar Prisma Client
npm run prisma:generate

# Criar migração
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio

# Executar seed
npm run prisma:seed
```

## 🏗️ Arquitetura

O projeto segue arquitetura em camadas (SOLID):

- **Domain**: Entidades, interfaces e enums
- **Application**: Use cases (lógica de negócio)
- **Infrastructure**: Implementações (Prisma, JWT, middleware)
- **Presentation**: Controllers, rotas e validações

## 🔐 Segurança

- Autenticação via JWT em cookie httpOnly
- Row-level isolation por companyId
- Validação de permissões por role (OWNER, ADMIN, MEMBER)
- Validação de entrada com Zod

## 📝 Variáveis de Ambiente

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/multi_tenant?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

## 🚢 CI/CD

O projeto inclui GitHub Actions para:
- Lint automático
- Testes automáticos
- Validação em PRs

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript
- `npm run start` - Inicia servidor em produção
- `npm run test` - Executa testes
- `npm run lint` - Verifica código com ESLint

