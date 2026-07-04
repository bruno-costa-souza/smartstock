# Smart Stock

Sistema Full Stack de vitrine e gestão de estoque para papelarias, com autenticação, controle de movimentações e calculadora de precificação. Criado para uso real de uma papelaria e também como portfólio, seguindo boas práticas de arquitetura, documentação e desenvolvimento moderno.

A ideia é começar atendendo papelarias e, a partir dessa base, expandir para outros segmentos de varejo.

---

## Demonstração

🚧 Em desenvolvimento

Em breve:

- Screenshots
- Deploy online
- Vídeo de demonstração

---

## Funcionalidades

### Vitrine pública
- Catálogo de produtos com busca e filtro por categoria
- Página de detalhes do produto
- Carrinho de compras

### Produtos (admin)
- Cadastro, edição e exclusão
- Upload de imagem do produto
- Busca por nome/código e categoria

### Estoque (admin)
- Resumo do estoque
- Histórico de movimentações
- Registro de entrada e saída de produtos

### Calculadora de precificação (admin)
- Cálculo de markup e margem de lucro por produto

### Autenticação
- Login com JWT (access token + refresh token)
- Rotas administrativas protegidas

---

## Tecnologias

### Backend

- NestJS + TypeScript
- Prisma ORM
- PostgreSQL
- JWT (access + refresh token) com Passport
- bcrypt
- class-validator / class-transformer
- Swagger (documentação da API)
- Helmet (segurança de headers)
- Throttler (rate limiting)
- Multer (upload de imagens)

### Frontend

- React + TypeScript + Vite
- TanStack Query
- React Hook Form + Zod
- Tailwind CSS
- Axios
- React Router

### Testes

- Jest (backend)
- Playwright (E2E)

### Infraestrutura

- Docker + Docker Compose
- GitHub Actions (CI: lint, testes, build e E2E)

---

## Arquitetura

```
Browser
     │
     ▼
React + Vite
     │
 REST API
     ▼
NestJS (Swagger em /api)
     │
 Prisma ORM
     ▼
PostgreSQL
```

---

## Estrutura do Projeto

```
SmartStock/

backend/
    src/
        modules/
            auth/
            users/
            produtos/
            estoque/
            vitrine/
    prisma/
        schema.prisma
        migrations/
    uploads/
    package.json

frontend/
    src/
        pages/
            vitrine/
            admin/
            auth/
    package.json

e2e/

.github/workflows/ci.yml

docker-compose.yml

README.md

.env.example
```

---

## Instalação

### Clonar

```bash
git clone https://github.com/bruno-costa-souza/smartstock.git

cd SmartStock
```

### Backend

```bash
cd backend

npm install

# copie .env.example (na raiz) para backend/.env e preencha os valores
npx prisma migrate dev

npm run start:dev
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Variáveis de Ambiente

Backend (`backend/.env`)

```
DATABASE_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:3000
```

---

## Docker

```bash
docker compose up --build
```

Sobe os containers `smartstock-db`, `smartstock-backend` e `smartstock-frontend`.

---

## Testes

```bash
# Backend
cd backend && npm test

# E2E
cd e2e && npx playwright test
```

---

## Roadmap

- [x] Cadastro e edição de produtos
- [x] Upload de imagens de produtos
- [x] Controle de estoque (entrada/saída)
- [x] Vitrine pública com carrinho
- [x] Login JWT com refresh token
- [x] Calculadora de precificação
- [ ] Checkout e integração de pagamento
- [ ] Dashboard com indicadores e gráficos
- [ ] Controle de fornecedores
- [ ] Relatórios exportáveis
- [ ] Backup automático agendado
- [ ] Notificações (estoque baixo, novos pedidos)

---

## Objetivo

O Smart Stock foi desenvolvido para atender, de forma real, uma papelaria — com vitrine pública para o cliente e painel administrativo para gestão de produtos e estoque. A arquitetura foi pensada para permitir expansão futura para outros segmentos de varejo.

O projeto busca demonstrar conhecimentos em:

- Arquitetura Full Stack
- Desenvolvimento Backend (NestJS, autenticação JWT, documentação Swagger)
- Desenvolvimento Frontend (React, gerenciamento de estado assíncrono)
- Banco de Dados e modelagem com Prisma
- Docker e CI/CD
- APIs REST
- Segurança (JWT, rate limiting, headers)
- Boas práticas de engenharia de software

---

## Licença

MIT License — veja [LICENSE](LICENSE).
