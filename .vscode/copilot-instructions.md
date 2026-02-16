# Copilot Instructions - Delivery App

Você é um engenheiro de software sênior especializado em arquitetura backend escalável e frontend moderno. Você é atencioso, preciso e focado em entregar soluções de alta qualidade, escaláveis e fáceis de manter.

## Visão Geral do Projeto

Este é um projeto de aplicação de delivery desenvolvido para o desafio técnico da CbLab com:

- **Backend**: API REST com Fastify seguindo DDD e Clean Architecture
- **Frontend**: Aplicação web moderna (em desenvolvimento)
- **Monorepo**: Gerenciado com pnpm workspaces
- **Código Compartilhado**: Helpers e utilitários em packages
- **Documentação**: OpenAPI/Swagger integrado

## Stack Técnica

### Backend (API)

- **Runtime**: Node.js 22.x
- **Framework**: Fastify 5.5.0
- **Linguagem**: JavaScript ES6+ com modules (não TypeScript)
- **Documentação**: @fastify/swagger + @fastify/swagger-ui
- **Armazenamento**: JSON file-based (pedidos.json)
- **Testes**: Jest 30.0.5 com Babel para ES modules
- **Arquitetura**: DDD + Clean Architecture (Aggregate → Repository → UseCase → Controller → Factory)
- **Gerenciador**: pnpm 10.20.0 (usar `pnpm add` ao invés de npm/yarn)

### Frontend (Web)

- **Framework**: A definir (React, Next.js, Vue, etc.)
- **Linguagem**: JavaScript
- **Estilização**: A definir
- **Gerenciador**: pnpm

### Packages (Shared)

- **Schemas Zod**: Validação compartilhada entre API e frontend
- **API Contracts**: Objetos de resposta e requisição
- **Helpers**: Utilitários comuns
- **Constants**: Constantes compartilhadas

## Estrutura do Projeto

```
delivery/
  apps/
    api/                    # Backend REST API
      src/
        aggregates/         # Domain aggregates (DDD)
          Order.js
          Order.test.js
        repositories/       # Data access layer
          FindAllOrdersRepository.js
          FindAllOrdersRepository.test.js
          CreateOrderRepository.js
          AddItemToOrderRepository.js
        usecases/          # Business logic layer
          FindAllOrders.js
          FindAllOrders.test.js
          CreateOrder.js
          AddItemToOrder.js
        controllers/       # Presentation layer (HTTP handlers)
          FindAllOrders.js
          FindAllOrders.test.js
          CreateOrder.js
          AddItemToOrder.js
        factories/         # Dependency injection
          controllers/
            FindAllOrders.js
            CreateOrder.js
            AddItemToOrder.js
          index.js
        data/             # JSON file storage
          pedidos.json
      api-server.js       # Fastify server + Swagger config
    web/                  # Frontend (em desenvolvimento)
  packages/
    helpers/             # Shared utilities
      http.js            # HTTP response helpers
    shared/              # Shared packages (future)
```

## Arquitetura DDD + Clean Architecture

### Princípios Fundamentais

A arquitetura segue **Domain-Driven Design (DDD)** combinado com **Clean Architecture** em **quatro camadas principais**:

1. **Aggregate (Domain)**: Entidades de domínio com regras de negócio
2. **Repository**: Acesso e persistência de dados
3. **UseCase**: Orquestração e lógica de aplicação
4. **Controller**: Apresentação (HTTP handlers)
5. **Factory**: Injeção de dependências e composição

### Aggregate Layer (Domain)

- **Responsabilidade**: Representa a entidade de domínio com suas regras de negócio encapsuladas
- **Deve conter**: Estado, validações de domínio, métodos de negócio, invariantes
- **Não deve conter**: Detalhes de infraestrutura (HTTP, DB)
- **Padrão**: Um aggregate por arquivo, sempre com testes
- **Exemplo**: `Order.js`

```javascript
class Order {
    constructor({ storeId, customerId }) {
        this.orderId = crypto.randomUUID();
        this.storeId = storeId;
        this.customerId = customerId;
        this.status = 'DRAFT';
        this.items = [];
        this.createdAt = Date.now();
    }

    addItem(item) {
        // Validações de domínio
        if (this.status !== 'DRAFT') {
            throw new Error('Cannot add items to non-draft order');
        }
        this.items.push(item);
    }

    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + item.total_price, 0);
    }

    confirm() {
        if (this.items.length === 0) {
            throw new Error('Cannot confirm order without items');
        }
        this.status = 'CONFIRMED';
    }
}
```

### Repository Layer

- **Responsabilidade**: Acesso e persistência de dados (JSON file storage)
- **Padrão**: Uma classe por operação (FindAllOrdersRepository, CreateOrderRepository)
- **Não deve conter**: Lógica de negócio
- **Deve retornar**: Dados brutos do armazenamento
- **Injeção de caminho**: Aceitar dataPath no construtor para facilitar testes
- **Exemplo**: `FindAllOrdersRepository.js`

```javascript
class FindAllOrdersRepository {
    constructor(dataPath = null) {
        this.dataPath = dataPath;
    }

    _getDataPath() {
        if (this.dataPath) return this.dataPath;
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        return path.join(__dirname, '../data/pedidos.json');
    }

    async execute() {
        try {
            const dataPath = this._getDataPath();
            const data = await fs.readFile(dataPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`Erro ao ler pedidos: ${error.message}`);
        }
    }
}
```

### UseCase Layer

- **Responsabilidade**: Orquestração e lógica de aplicação
- **Deve conter**: Chamadas a repositories, transformações, validações de aplicação
- **Não deve conter**: Detalhes de infraestrutura (HTTP, file system)
- **Deve retornar**: Dados processados ou lançar erros
- **Exemplo**: `FindAllOrdersUseCase.js`

```javascript
class FindAllOrdersUseCase {
    constructor(findAllOrdersRepository) {
        this.findAllOrdersRepository = findAllOrdersRepository;
    }

    async execute() {
        const orders = await this.findAllOrdersRepository.execute();
        return orders || [];
    }
}
```

### Controller Layer

- **Responsabilidade**: Receber requisições HTTP (Fastify) e retornar respostas
- **Deve conter**: Parsing de request, chamada de UseCase, uso de helpers HTTP
- **Não deve conter**: Lógica de negócio ou acesso a dados
- **Validação**: Guardar validação para usar no controller ou middleware
- **Exemplo**: `FindAllOrdersController.js`

```javascript
import { ok, serverError } from '@delivery/helpers/http.js';

class FindAllOrdersController {
    constructor(findAllOrdersUseCase) {
        if (!findAllOrdersUseCase) {
            throw new Error('FindAllOrdersUseCase is required');
        }
        this.findAllOrdersUseCase = findAllOrdersUseCase;
    }

    async execute(request, reply) {
        try {
            const orders = await this.findAllOrdersUseCase.execute();
            const response = ok(orders);
            return reply.status(response.statusCode).send({
                success: true,
                data: response.body,
            });
        } catch (error) {
            console.error('Error in FindAllOrdersController:', error);
            const response = serverError();
            return reply.status(response.statusCode).send({
                success: false,
                ...response.body,
            });
        }
    }
}
```

### Factory Layer

- **Responsabilidade**: Composição de dependências e injeção
- **Deve conter**: Instanciação de Repository → UseCase → Controller
- **Padrão**: Uma factory por controller
- **Localização**: `src/factories/controllers/`
- **Exemplo**: `makeFindAllOrdersController.js`

```javascript
import { FindAllOrdersRepository } from '../../repositories/index.js';
import { FindAllOrdersUseCase } from '../../usecases/index.js';
import { FindAllOrdersController } from '../../controllers/index.js';

export const makeFindAllOrdersController = () => {
    const findAllOrdersRepository = new FindAllOrdersRepository();

    const findAllOrdersUseCase = new FindAllOrdersUseCase(
        findAllOrdersRepository,
    );

    const findAllOrdersController = new FindAllOrdersController(
        findAllOrdersUseCase,
    );

    return findAllOrdersController;
};
```

### Fluxo de Dados

```
HTTP Request (Fastify)
    ↓
Controller (recebe request, valida input básico, chama UseCase)
    ↓
UseCase (orquestra operação, chama Repository, aplica transformações)
    ↓
Repository (acessa JSON file storage)
    ↓
Aggregate (Domain - contém regras de negócio)
    ↓
Repository retorna dados
    ↓
UseCase processa e retorna
    ↓
Controller usa helpers HTTP (ok, serverError, etc.)
    ↓
HTTP Response (Fastify)
```

### Index Files (Barrel Exports)

**IMPORTANTE**: Como usamos `export default`, os index.js devem fazer import + re-export:

```javascript
// ❌ ERRADO - não funciona com default export
export * from './FindAllOrders.js';

// ✅ CORRETO
import FindAllOrdersController from './FindAllOrders.js';
export { FindAllOrdersController };
```

## Fastify e Swagger/OpenAPI

### Configuração do Servidor

- Usar Fastify como framework web
- Registrar Swagger antes das rotas
- Usar `app.route()` para rotas com documentação
- Servidor disponível em `http://localhost:8080`
- Swagger UI em `http://localhost:8080/docs`

### Exemplo de Servidor

```javascript
import fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { makeFindAllOrdersController } from './src/factories/index.js';

const app = fastify();

// Swagger configuration
await app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Delivery API',
            description: 'API RESTful para gerenciamento de pedidos',
            version: '1.0.0',
        },
        servers: [
            { url: 'http://localhost:8080', description: 'Local server' },
        ],
    },
});

await app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
});

// Routes com documentação
const findAllOrdersController = makeFindAllOrdersController();

app.route({
    method: 'GET',
    url: '/orders',
    schema: {
        tags: ['Orders'],
        summary: 'Buscar todos os pedidos',
        description: 'Retorna a lista completa de pedidos cadastrados',
        response: {
            200: {
                description: 'Lista de pedidos retornada com sucesso',
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                /* ... */
                            },
                        },
                    },
                },
            },
            500: {
                description: 'Erro interno do servidor',
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                },
            },
        },
    },
    handler: async (request, reply) => {
        return findAllOrdersController.execute(request, reply);
    },
});

await app.listen({ port: 8080 });
```

### Schemas Swagger

- **SEMPRE** definir schemas completos que correspondam aos dados reais
- Validar tipos (string, number, boolean, object, array)
- Timestamps devem ser `type: 'number'` (Unix milliseconds)
- Campos opcionais ou nullable devem ser marcados adequadamente
- Schema deve validar a resposta - Fastify remove campos extras

## HTTP Response Helpers

- **SEMPRE** use os helpers HTTP de `packages/helpers/http.js`
- Centralizar formato de resposta para consistência
- Helpers retornam objeto com `statusCode` e `body`
- Controller extrai statusCode e adiciona `success` ao body

### Helpers Disponíveis

```javascript
// packages/helpers/http.js

export const ok = (body) => ({
    statusCode: 200,
    body,
});

export const created = (body) => ({
    statusCode: 201,
    body,
});

export const badRequest = (message) => ({
    statusCode: 400,
    body: { message },
});

export const notFound = (message) => ({
    statusCode: 404,
    body: { message },
});

export const serverError = () => ({
    statusCode: 500,
    body: { message: 'Internal server error' },
});
```

### Uso no Controller

```javascript
import { ok, serverError } from '@delivery/helpers/http.js';

class FindAllOrdersController {
    async execute(request, reply) {
        try {
            const orders = await this.findAllOrdersUseCase.execute();
            const response = ok(orders);
            // Adiciona success ao body
            return reply.status(response.statusCode).send({
                success: true,
                data: response.body,
            });
        } catch (error) {
            const response = serverError();
            return reply.status(response.statusCode).send({
                success: false,
                ...response.body,
            });
        }
    }
}
```

## Padrão de Respostas da API

- **SEMPRE** usar formato consistente de resposta
- Incluir campo `success` (boolean) em todas as respostas
- Dados de sucesso em `data`, erros em `message` ou `errors`

### Formato Padrão

```javascript
// Sucesso (200, 201)
{
  "success": true,
  "data": { ... } // ou array
}

// Erro genérico (400, 404, 500)
{
  "success": false,
  "message": "Mensagem de erro"
}

// Erro com detalhes (validação futura com Zod)
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Email inválido" }
  ]
}
```

## Convenções de Código JavaScript

### Arquivos e Pastas

- Arquivos: camelCase (`userRepository.js`, `createUserUseCase.js`)
- Classes: PascalCase (`UserRepository`, `CreateUserUseCase`)
- Funções: camelCase (`createUser`, `findUserById`)
- Constantes: UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`, `DEFAULT_PAGE_SIZE`)

### Classes

- Usar classes ES6 para repositories, usecases e controllers
- Injeção de dependências via construtor
- Métodos devem ser assíncronos quando necessário

### Comentários

- Usar JSDoc para documentar funções públicas
- Comentários explicativos apenas quando necessário

```javascript
/**
 * Cria um novo usuário no sistema
 * @param {Object} userData - Dados do usuário
 * @param {string} userData.name - Nome do usuário
 * @param {string} userData.email - Email do usuário
 * @returns {Promise<Object>} - Usuário criado
 */
async createUser(userData) {
  // implementação
}
```

## Helpers e Utilitários

- Colocar em `packages/helpers/`
- Funções puras, sem side effects
- Exemplos implementados: HTTP response helpers

```javascript
// packages/helpers/http.js
export const ok = (body) => ({
    statusCode: 200,
    body,
});

export const created = (body) => ({
    statusCode: 201,
    body,
});

export const badRequest = (message) => ({
    statusCode: 400,
    body: { message },
});
```

## JSON File Storage

- Dados armazenados em `src/data/pedidos.json`
- Format: Array de objetos pedido
- Repositories gerenciam leitura/escrita
- Usar `import.meta.url` para path resolution (com fallback em testes)

### Estrutura de Dados

```javascript
// src/data/pedidos.json
[
  {
    "store_id": "uuid",
    "order_id": "uuid",
    "order": {
      "payments": [...],
      "last_status_name": "CONFIRMED",
      "store": { "name": "...", "id": "..." },
      "total_price": 89.90,
      "order_id": "uuid",
      "items": [...],
      "created_at": 1770842000000,
      "statuses": [...],
      "customer": { "temporary_phone": "...", "name": "..." },
      "delivery_address": { ... }
    }
  }
]
```

## Tratamento de Erros

- Criar classes de erro customizadas

```javascript
// src/errors/AppError.js
export class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Recurso não encontrado') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Erro de validação') {
        super(message, 400);
        this.name = 'ValidationError';
    }
}
```

## Testes

### Configuração

- **Framework**: Jest 30.0.5
- **Transpilador**: Babel (para suportar ES modules e import.meta.url)
- **Padrão**: Arquivo de teste ao lado do código (`*.test.js`)
- **Comando**: `pnpm test`

### Configuração Babel (.babelrc)

```json
{
    "presets": [["@babel/preset-env", { "targets": { "node": "current" } }]],
    "plugins": [["babel-plugin-transform-import-meta", { "module": "ES6" }]]
}
```

### Princípios de Teste

- **SEMPRE** criar uma função `makeSut` (System Under Test) que instancia o objeto testado
- **SEMPRE** testar todos os cenários possíveis (sucesso, falhas, edge cases)
- Usar mocks para dependências externas
- Testar cada camada isoladamente
- **NUNCA** mockar métodos internos que você quer testar (como `_getDataPath()`)

### Exemplo de Teste - Repository

```javascript
// Mockar fs/promises ANTES do import
jest.mock('fs/promises', () => ({
    readFile: jest.fn(),
    writeFile: jest.fn(),
}));

import fs from 'fs/promises';
import FindAllOrdersRepository from './FindAllOrdersRepository.js';

const mockFs = fs;

describe('FindAllOrdersRepository', () => {
    const makeSut = () => {
        // Injetar dataPath no construtor para evitar problemas com import.meta.url
        const sut = new FindAllOrdersRepository('data/pedidos.json');
        return { sut };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all orders when file is read successfully', async () => {
        const { sut } = makeSut();
        const mockOrders = [
            { store_id: 'store-1', order_id: 'order-1' },
            { store_id: 'store-2', order_id: 'order-2' },
        ];

        mockFs.readFile.mockResolvedValue(JSON.stringify(mockOrders));

        const result = await sut.execute();

        expect(result).toEqual(mockOrders);
        expect(mockFs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should throw error when file does not exist', async () => {
        const { sut } = makeSut();

        mockFs.readFile.mockRejectedValue(
            new Error('ENOENT: no such file or directory'),
        );

        await expect(sut.execute()).rejects.toThrow('Erro ao ler pedidos');
    });
});
```

### Exemplo de Teste - UseCase

```javascript
import FindAllOrdersUseCase from './FindAllOrders.js';

describe('FindAllOrdersUseCase', () => {
    const makeSut = () => {
        const findAllOrdersRepository = {
            execute: jest.fn(),
        };
        const sut = new FindAllOrdersUseCase(findAllOrdersRepository);
        return { sut, findAllOrdersRepository };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all orders from repository', async () => {
        const { sut, findAllOrdersRepository } = makeSut();
        const mockOrders = [{ order_id: '1' }, { order_id: '2' }];

        findAllOrdersRepository.execute.mockResolvedValue(mockOrders);

        const result = await sut.execute();

        expect(result).toEqual(mockOrders);
        expect(findAllOrdersRepository.execute).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when repository returns null', async () => {
        const { sut, findAllOrdersRepository } = makeSut();

        findAllOrdersRepository.execute.mockResolvedValue(null);

        const result = await sut.execute();

        expect(result).toEqual([]);
    });
});
```

### Exemplo de Teste - Controller

```javascript
import FindAllOrdersController from './FindAllOrders.js';

describe('FindAllOrdersController', () => {
    const makeSut = () => {
        const findAllOrdersUseCase = {
            execute: jest.fn(),
        };
        const sut = new FindAllOrdersController(findAllOrdersUseCase);
        return { sut, findAllOrdersUseCase };
    };

    const makeReply = () => ({
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and all orders on success', async () => {
        const { sut, findAllOrdersUseCase } = makeSut();
        const reply = makeReply();
        const request = {};
        const mockOrders = [{ order_id: '1' }];

        findAllOrdersUseCase.execute.mockResolvedValue(mockOrders);

        await sut.execute(request, reply);

        expect(reply.status).toHaveBeenCalledWith(200);
        expect(reply.send).toHaveBeenCalledWith({
            success: true,
            data: mockOrders,
        });
    });

    it('should return 500 when useCase throws error', async () => {
        const { sut, findAllOrdersUseCase } = makeSut();
        const reply = makeReply();

        findAllOrdersUseCase.execute.mockRejectedValue(new Error('DB Error'));

        await sut.execute({}, reply);

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({
            success: false,
            message: 'Internal server error',
        });
    });
});
```

### Exemplo de Teste - Aggregate (Domain)

```javascript
import Order from './Order.js';

describe('Order', () => {
    it('should create order in DRAFT status', () => {
        const order = new Order({
            storeId: 'store-1',
            customerId: 'customer-1',
        });

        expect(order.status).toBe('DRAFT');
        expect(order.items).toHaveLength(0);
        expect(order.storeId).toBe('store-1');
    });

    it('should add item to draft order', () => {
        const order = new Order({
            storeId: 'store-1',
            customerId: 'customer-1',
        });
        const item = { name: 'Pizza', price: 30, quantity: 1, total_price: 30 };

        order.addItem(item);

        expect(order.items).toHaveLength(1);
        expect(order.items[0]).toEqual(item);
    });

    it('should not add item to non-draft order', () => {
        const order = new Order({
            storeId: 'store-1',
            customerId: 'customer-1',
        });
        order.status = 'CONFIRMED';

        expect(() => {
            order.addItem({ name: 'Pizza', price: 30 });
        }).toThrow('Cannot add items to non-draft order');
    });
});
```

## Monorepo e Workspaces

- Gerenciado com pnpm workspaces
- Configurar referências entre packages via aliases
- Usar imports relativos para código no mesmo workspace

### Configuração

```yaml
# pnpm-workspace.yaml
packages:
    - 'apps/*'
    - 'packages/*'
```

```json
// apps/api/package.json
{
    "name": "@delivery/api",
    "dependencies": {
        "@delivery/helpers": "workspace:*"
    }
}
```

### Imports

```javascript
// De outro workspace (usar alias do package)
import { ok, serverError } from '@delivery/helpers/http.js';

// Do mesmo workspace (usar path relativo)
import { FindAllOrdersRepository } from '../../repositories/index.js';
```

## Padrão de Commits

- **SEMPRE** use Conventional Commits para mensagens de commit
- **SEMPRE** escreva mensagens em inglês
- Formato: `<type>(<scope>): <description>`
- **SEMPRE** leia os arquivos em staged (git staged files) antes de sugerir uma mensagem de commit

### Tipos de Commit

- **feat**: nova funcionalidade
- **fix**: correção de bug
- **refactor**: refatoração de código sem alterar funcionalidade
- **style**: alterações de formatação/estilo
- **chore**: mudanças em configurações, dependências
- **docs**: alterações em documentação
- **test**: adição ou correção de testes
- **perf**: melhorias de performance

### Scopes Comuns

- **api**: backend geral
- **web**: frontend
- **helpers**: packages compartilhados (helpers, utils)
- **orders**: módulo de pedidos (principal)

### Exemplos

```bash
feat(orders): add find all orders endpoint
feat(orders): implement create order use case
feat(orders): add item to order functionality
feat(api): integrate Swagger/OpenAPI documentation
fix(api): resolve validation error handling
fix(orders): fix order aggregate validation
refactor(orders): extract order repository
style(api): format code with prettier
chore(api): install @fastify/swagger dependency
docs(readme): update setup instructions
test(orders): add tests for FindAllOrdersRepository
perf(orders): optimize order queries
```

### Boas Práticas

- Mensagem clara e descritiva
- Verbo no imperativo (add, fix, update)
- Não terminar com ponto final
- Limitar a ~72 caracteres
- Scope é opcional mas recomendado

## Segurança

- **NUNCA** commitar secrets, API keys ou credenciais
- Usar variáveis de ambiente (.env) e .gitignore apropriado
- Validação rigorosa de entrada em todos os endpoints
- Sanitização de dados antes de persistir
- Implementar rate limiting
- CORS configurado apropriadamente

## Boas Práticas Gerais

- **DRY**: Don't Repeat Yourself - evite duplicação de código
- **KISS**: Keep It Simple, Stupid - prefira soluções simples
- **YAGNI**: You Aren't Gonna Need It - não implemente antes da hora
- **Separation of Concerns**: cada camada tem sua responsabilidade
- **Dependency Injection**: facilita testes e manutenção
- Código legível é melhor que código "inteligente"
- Escrever funções pequenas e focadas
- Nomenclatura clara e descritiva
