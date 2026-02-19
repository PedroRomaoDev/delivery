# Desafio CBLab

Sistema completo de gerenciamento de pedidos para serviços de delivery, composto por **API REST** (Fastify) e **Dashboard Web** (React). A API foi desenvolvida com **Domain-Driven Design (DDD)** e **Clean Architecture**, incluindo **geocoding automático** de endereços (cálculo de coordenadas via OpenStreetMap Nominatim), validação com Zod e 335 testes automatizados. O frontend oferece visualização interativa com estatísticas, gráficos de status e tabela de pedidos recentes, utilizando **TanStack Query** para gerenciamento de estado do servidor. Containerização Docker completa com Nginx (frontend) e Node.js (backend), execução não-root para segurança. Arquitetura modular em monorepo com workspaces pnpm.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Gerenciamento de Monorepo](#gerenciamento-de-monorepo)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Execução](#execução)
- [Docker](#docker)
- [Frontend - Dashboard](#frontend---dashboard)
- [Testes](#testes)
- [Documentação da API](#documentação-da-api)
- [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
    - [Qualidade de Código](#qualidade-de-código)
    - [Convenções de Código](#convenções-de-código)
    - [Commits](#commits)

## Sobre o Projeto

Este projeto implementa um sistema de gerenciamento de pedidos (orders) para aplicações de delivery. A aplicação foi projetada com foco em:

- **Separação de responsabilidades**: Arquitetura em camadas bem definidas
- **Regras de negócio isoladas**: Toda lógica de domínio reside no Aggregate Root
- **Máquina de estados**: Controle rigoroso de transições de estado do pedido
- **Testabilidade**: Cobertura de testes com 335 testes automatizados
- **Qualidade de código**: ESLint, Prettier, EditorConfig e Git hooks automatizados
- **Monorepo modular**: Workspaces isolados com pnpm para máxima reutilização
- **Extensibilidade**: Estrutura preparada para evolução e manutenção

## Arquitetura

O sistema segue uma abordagem **DDD (Domain-Driven Design)** com arquitetura em camadas:

```
┌─────────────────────────────────────────┐
│           REST API (HTTP)               │
│         Fastify + Swagger UI            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│            Controllers                  │
│  • Validação de entrada (Zod)          │
│  • Mapeamento HTTP                      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│             Use Cases                   │
│  • Orquestração de fluxo                │
│  • Coordenação de repositórios          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          Aggregate Root (Order)         │
│  • Regras de negócio                    │
│  • Invariantes de domínio               │
│  • Transições de estado                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           Repositories                  │
│  • Persistência de dados                │
│  • Acesso a fontes externas             │
└─────────────────────────────────────────┘
```

### Princípios Arquiteturais

1. **Aggregate Root**: `Order` é o único ponto de entrada para modificações
2. **Imutabilidade Estrutural**: Pedidos fora do estado `DRAFT` não podem ser modificados estruturalmente
3. **Máquina de Estados**: Transições controladas entre estados
4. **Repository Pattern**: Abstração de persistência
5. **Dependency Injection**: Uso de factories para injeção de dependências
6. **Single Responsibility**: Cada camada possui uma responsabilidade bem definida

### Estados do Pedido

O sistema implementa uma máquina de estados rigorosa:

```
DRAFT → RECEIVED → CONFIRMED → DISPATCHED → DELIVERED
  ↓         ↓          ↓
  └─────────┴──────────┴─→ CANCELED
```

- **DRAFT**: Estado inicial, permite modificações estruturais
- **RECEIVED**: Pedido recebido, estrutura imutável
- **CONFIRMED**: Pedido confirmado pela loja
- **DISPATCHED**: Pedido em rota de entrega
- **DELIVERED**: Pedido entregue (estado final)
- **CANCELED**: Pedido cancelado (estado final)

## Tecnologias

### Backend (API)

- **Node.js 20**: Runtime JavaScript
- **Fastify**: Framework web de alta performance
- **Zod**: Validação de esquemas e tipos

### Frontend (Dashboard)

- **React 18.2**: Library UI com componentes funcionais
- **Vite**: Build tool e dev server de alta performance
- **TailwindCSS 3.4**: Framework CSS utility-first com cores customizadas (Coco Bambu)
- **React Router DOM 6.25**: Roteamento client-side
- **TanStack Query 5.90**: Gerenciamento de estado do servidor (cache, loading, refetch)
- **Axios 1.13**: Cliente HTTP
- **Recharts 3.7**: Biblioteca de gráficos (pie chart, bar chart)
- **tailwind-variants**: Variantes de componentes com TypeScript support

### Monorepo

- **pnpm**: Gerenciador de pacotes eficiente com deduplicação inteligente
- **pnpm workspaces**: Gerenciamento de monorepo com workspaces isolados
    - Compartilhamento de dependências entre packages
    - Versionamento independente de packages
    - Linking automático entre workspaces

### Documentação

- **Swagger UI**: Documentação interativa da API
- **@fastify/swagger**: Integração Swagger/OpenAPI

### Testes

- **Jest**: Framework de testes
- **Babel**: Transpilação para testes

### Qualidade de Código

- **ESLint**: Linting de código JavaScript
    - Configuração: `eslint.config.js` (flat config)
- **Prettier**: Formatação automática de código
    - Configuração: `.prettierrc.json`
    - Integrado com ESLint via lint-staged
- **EditorConfig**: Padronização de editores
    - Configuração: `.editorconfig`
    - Indentação, encoding, line endings
- **Husky**: Git hooks automatizados
    - Pre-commit: lint-staged
- **lint-staged**: Linting incremental
    - ESLint --fix em arquivos .js
    - Prettier --write em todos os arquivos

### Containerização

- **Docker**: Containerização da aplicação com build multi-stage
    - Node.js 20 Alpine (imagem base segura e atualizada)
    - Execução como usuário não-root
    - Health checks integrados
- **Docker Compose**: Orquestração de containers
    - Health monitoring
    - Restart automático

## Gerenciamento de Monorepo

### pnpm Workspaces

O projeto utiliza **pnpm workspaces** para gerenciar múltiplos packages e aplicações em um único repositório:

### Benefícios

1. **Compartilhamento de Código**: Packages compartilhados entre aplicações
2. **Dependências Isoladas**: Cada workspace possui suas próprias dependências
3. **Linking Automático**: Referências entre workspaces resolvidas automaticamente
4. **Performance**: pnpm usa hard links, economizando espaço em disco

### Workspaces Disponíveis

- **@delivery/api** (`apps/api`): API REST principal (Fastify + DDD)
- **@delivery/web** (`apps/web`): Dashboard Web (React + Vite + TanStack Query)
- **@delivery/helpers** (`packages/helpers`): Utilitários compartilhados
- **@delivery/shared** (`packages/shared`): Schemas Zod e código compartilhado

## Estrutura do Projeto

Este é um **monorepo** gerenciado com pnpm workspaces:

```
delivery/
├── apps/
│   ├── api/                    # API Backend (Fastify)
│   │   ├── src/
│   │   │   ├── aggregates/     # Domain Models (Order)
│   │   │   ├── controllers/    # HTTP Controllers
│   │   │   ├── usecases/       # Application Use Cases
│   │   │   ├── repositories/   # Data Access Layer
│   │   │   ├── services/       # External Services (Geocoding)
│   │   │   ├── factories/      # Dependency Injection
│   │   │   ├── config/         # Configurações
│   │   │   └── data/           # Dados (orders)
│   │   ├── api-server.js       # Entry point
│   │   ├── Dockerfile          # Container API
│   │   └── package.json
│   │
│   └── web/                    # Frontend Dashboard (React + Vite)
│       ├── src/
│       │   ├── components/     # Componentes React
│       │   │   ├── SideBar.jsx           # Navegação principal
│       │   │   ├── DashboardCards.jsx    # Cards de estatísticas
│       │   │   ├── RecentOrdersTable.jsx # Tabela de pedidos
│       │   │   └── OrderStatusChart.jsx  # Gráfico de status
│       │   ├── pages/          # Páginas/Rotas
│       │   │   ├── HomePage.jsx          # Dashboard principal
│       │   │   ├── OrdersPage.jsx        # Lista todos os pedidos
│       │   │   ├── NewOrderPage.jsx      # Criar novo pedido
│       │   │   ├── ActiveOrdersPage.jsx  # Pedidos ativos
│       │   │   └── OrderHistoryPage.jsx  # Histórico
│       │   ├── hooks/          # Custom Hooks
│       │   │   └── data/
│       │   │       ├── use-get-orders.js
│       │   │       └── use-get-order.js
│       │   ├── lib/            # Configurações
│       │   │   └── axios.js    # Cliente HTTP
│       │   ├── keys/           # Query Keys (TanStack Query)
│       │   │   └── queries.js
│       │   ├── assets/         # Ícones e imagens
│       │   └── main.jsx        # Entry point
│       ├── Dockerfile          # Container Nginx
│       ├── nginx.conf          # Config Nginx
│       └── package.json
│
├── packages/
│   ├── helpers/                # Utilitários compartilhados
│   │   ├── http.js            # Helpers HTTP
│   │   ├── validate.js        # Validadores
│   │   └── generateRandomPrice.js
│   │
│   └── shared/                 # Schemas compartilhados
│       └── schemas/            # Schemas Zod
│
├── docs/
│   └── order-api-specification.md  # Especificação completa da API
│
├── .husky/                     # Git hooks
├── eslint.config.js
├── .prettierrc.json
├── pnpm-workspace.yaml
└── package.json
```

## Pré-requisitos

- **Node.js**: v18.x ou superior
- **pnpm**: v8.x ou superior

```bash
# Instalar pnpm globalmente
npm install -g pnpm
```

## Instalação

Clone o repositório e instale as dependências:

```bash
# Clone o repositório
git clone https://github.com/PedroRomaoDev/delivery.git
cd delivery

# Instale as dependências (para todos os workspaces)
pnpm install
```

## Execução

### Desenvolvimento Local

#### API Backend

```bash
# Na raiz do projeto ou em apps/api
cd apps/api
pnpm dev
```

A API estará disponível em:

- **API**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/docs`

#### Frontend Dashboard

```bash
# Na raiz do projeto ou em apps/web
cd apps/web
pnpm dev
```

O Dashboard estará disponível em:

- **Frontend**: `http://localhost:5173`

> **Nota**: O frontend precisa que a API esteja rodando para funcionar corretamente.

## Docker

A aplicação está containerizada e pronta para ser executada em containers Docker.

**Para guia completo, consulte [DOCKER.md](DOCKER.md)**

### Início Rápido

```bash
# Na raiz do projeto
docker-compose build
docker-compose up -d

# Ou usando npm scripts
pnpm run docker:build
pnpm run docker:up
```

Os serviços estarão disponíveis em:

- **Frontend**: `http://localhost:3000`
- **API**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/docs`

### Scripts Disponíveis

```bash
pnpm run docker:build      # Build das imagens (api + web)
pnpm run docker:up         # Iniciar containers
pnpm run docker:down       # Parar containers
pnpm run docker:logs       # Ver logs de ambos os serviços
pnpm run docker:rebuild    # Rebuild completo (--no-cache)
```

### Arquitetura Docker

- **delivery-api**: Container Node.js 20 Alpine (execução não-root)
- **delivery-web**: Container Nginx Alpine com build multi-stage
    - Stage 1: Build com Vite (Node 20 Alpine)
    - Stage 2: Nginx servindo arquivos estáticos + reverse proxy para API
    - Configuração de SPA routing (React Router)
    - Proxy `/api` → `http://api:8080` (sem CORS)

````

## Testes

O projeto possui **cobertura completa de testes no backend** com 335 testes automatizados distribuídos em 37 suítes:

```bash
# Executar todos os testes da API
cd apps/api
pnpm test

# Executar testes com cobertura
pnpm test -- --coverage
````

### Estrutura de Testes

Cada camada possui seus próprios testes:

- **Aggregates**: 78 testes (Order.test.js)
    - Validações de regras de negócio
    - Transições de estado
    - Invariantes de domínio

- **Use Cases**: ~150 testes
    - Fluxos de aplicação
    - Integração com repositories
    - Tratamento de erros

- **Controllers**: ~100 testes
    - Validação de entrada
    - Mapeamento HTTP
    - Tratamento de erros

## Documentação da API

A documentação completa da API está disponível em:

- **Swagger UI**: `http://localhost:8080/docs` (quando a API estiver rodando)
- **Especificação**: [docs/order-api-specification.md](docs/order-api-specification.md)

### Principais Endpoints

#### Criação de pedido de forma incremental (DRAFT)

- `POST /orders` - Criar pedido
- `POST /orders/:id/items` - Adicionar item
- `PATCH /orders/:id/items/:code` - Atualizar item
- `DELETE /orders/:id/items/:code` - Remover item
- `PATCH /orders/:id/customer` - Atualizar cliente
- `POST /orders/:id/payments` - Adicionar/atualizar pagamento
- `POST /orders/:id/delivery-address` - Adicionar/atualizar endereço

#### Consulta de pedidos

- `GET /orders` - Listar pedidos
- `GET /orders/:id` - Buscar pedido por ID

#### Mudar informações do pedido (apenas em DRAFT)

- `PATCH /orders/:id/customer` - Atualizar cliente
- `PATCH /orders/:id/items/:code` - Atualizar item
- `DELETE /orders/:id/items/:code` - Remover item

#### Transições de Estado

- `POST /orders/:id/receive` - Receber pedido (DRAFT → RECEIVED)
- `POST /orders/:id/confirm` - Confirmar pedido (RECEIVED → CONFIRMED)
- `POST /orders/:id/dispatch` - Despachar pedido (CONFIRMED → DISPATCHED)
- `POST /orders/:id/deliver` - Entregar pedido (DISPATCHED → DELIVERED)
- `POST /orders/:id/cancel` - Cancelar pedido (DRAFT/RECEIVED/CONFIRMED → CANCELED)

### Regras de Negócio Importantes

1. **Modificações Estruturais**: Apenas em estado `DRAFT`
2. **Imutabilidade**: Após sair de `DRAFT`, a estrutura do pedido é imutável
3. **Payment Override**: POST em `/payments` sobrescreve pagamento existente
4. **Address Override**: POST em `/delivery-address` sobrescreve endereço existente
5. **Geocoding Automático**: Coordenadas calculadas via OpenStreetMap Nominatim
6. **Cálculo de Preços**: Preços dos items e pagamento calculados automaticamente

### Convenções de Código

Além das ferramentas automatizadas, o projeto segue convenções:

- **Nomenclatura**: PascalCase para classes, camelCase para variáveis/funções
- **Imports**: ES Modules (type: "module")
- **Exports**: Named exports preferidos
- **Async/Await**: Preferido sobre Promises com .then()
- **Testes**: Colocados ao lado do código fonte com sufixo `.test.js`

### Commits

O projeto utiliza **Husky** e **lint-staged** para garantir qualidade:

```bash
# Pre-commit: executa lint-staged
# - ESLint em arquivos .js
# - Prettier em todos os arquivos
```

## Contato

Para dúvidas relacionadas ao projeto, consulte a [especificação completa](docs/order-api-specification.md).

---

## Quadro Kanban com Backlog do Desafio

Acompanhe o progresso do desenvolvimento e as tarefas finalizadas neste link:

**[Quadro Kanban](https://github.com/users/PedroRomaoDev/projects/2)**
