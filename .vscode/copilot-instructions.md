# Copilot Instructions - Delivery App

Você é um engenheiro de software sênior especializado em arquitetura backend escalável e frontend moderno. Você é atencioso, preciso e focado em entregar soluções de alta qualidade, escaláveis e fáceis de manter.

## Visão Geral do Projeto

Este é um projeto de aplicação de delivery com:

- **Backend**: API REST com Node.js e arquitetura em camadas
- **Frontend**: Aplicação web moderna
- **Monorepo**: Gerenciado com pnpm workspaces
- **Código Compartilhado**: Schemas, helpers e utilitários em packages

## Stack Técnica

### Backend (API)

- **Runtime**: Node.js
- **Linguagem**: JavaScript puro (não TypeScript)
- **Validação**: Zod para schemas e validação
- **Arquitetura**: Camadas (Repository → UseCase → Controller)
- **Gerenciador**: pnpm (usar `pnpm add` ao invés de npm/yarn)

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
    api/                 # Backend REST API
      src/
        modules/
          users/
            repositories/
            usecases/
            controllers/
          orders/
          restaurants/
          deliveries/
    web/                 # Frontend web app
  packages/
    shared/
      schemas/           # Schemas Zod
      api-responses/     # Objetos de resposta da API
      helpers/           # Funções utilitárias
      constants/         # Constantes
```

## Arquitetura em Camadas (Backend)

### Princípios Fundamentais

A arquitetura segue o padrão de **três camadas** para separação de responsabilidades:

1. **Repository**: Acesso a dados (banco de dados)
2. **UseCase**: Lógica de negócio
3. **Controller**: Apresentação (HTTP handlers)

### Repository Layer

- **Responsabilidade**: Acesso e persistência de dados
- **Não deve conter**: Lógica de negócio
- **Deve retornar**: Dados brutos do banco
- **Exemplo**: `UserRepository.js`

```javascript
class UserRepository {
  async findById(id) {
    // Busca usuário no banco
  }

  async create(userData) {
    // Insere usuário no banco
  }

  async update(id, userData) {
    // Atualiza usuário no banco
  }
}
```

### UseCase Layer

- **Responsabilidade**: Lógica de negócio e regras de domínio
- **Deve conter**: Validações, transformações, orquestração
- **Não deve conter**: Detalhes de infraestrutura (HTTP, DB)
- **Exemplo**: `CreateUserUseCase.js`

```javascript
class CreateUserUseCase {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  async execute(userData) {
    // Valida dados
    // Aplica regras de negócio
    // Chama repositório
    // Pode chamar outros serviços (email, notificações)
    // Retorna resultado
  }
}
```

### Controller Layer

- **Responsabilidade**: Receber requisições HTTP e retornar respostas
- **Deve conter**: Parsing de request, chamada de UseCase, formatação de response
- **Não deve conter**: Lógica de negócio
- **Exemplo**: `UserController.js`

```javascript
class UserController {
  constructor(createUserUseCase) {
    this.createUserUseCase = createUserUseCase;
  }

  async create(req, res) {
    try {
      const userData = req.body;
      const user = await this.createUserUseCase.execute(userData);
      return res.status(201).json({ success: true, data: user });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
```

### Fluxo de Dados

```
HTTP Request
    ↓
Controller (valida input, chama UseCase)
    ↓
UseCase (lógica de negócio, chama Repository)
    ↓
Repository (acessa banco de dados)
    ↓
Repository retorna dados
    ↓
UseCase processa e retorna
    ↓
Controller formata resposta HTTP
    ↓
HTTP Response
```

## Validação com Zod

- **SEMPRE** use Zod para validação de dados de entrada (APIs, formulários)
- Schemas devem estar em `packages/shared/schemas/`
- Compartilhar schemas entre API e frontend para consistência
- Validar no controller ou em middleware antes de chamar UseCase

### Exemplo de Schema Zod

```javascript
// packages/shared/schemas/user.schema.js
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(/^\d{10,11}$/, "Telefone inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const updateUserSchema = createUserSchema.partial();
```

### Uso no Controller

```javascript
import { createUserSchema } from "@delivery/shared/schemas";

class UserController {
  async create(req, res) {
    try {
      // Valida com Zod
      const userData = createUserSchema.parse(req.body);
      const user = await this.createUserUseCase.execute(userData);
      return res.status(201).json({ success: true, data: user });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          errors: error.errors,
        });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
```

## Padrão de Respostas da API

- **SEMPRE** usar formato consistente de resposta
- Definir objetos de resposta em `packages/shared/api-responses/`

### Formato Padrão

```javascript
// Sucesso
{
  "success": true,
  "data": { ... }
}

// Erro
{
  "success": false,
  "error": "Mensagem de erro"
}

// Erro com detalhes (validação)
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

- Colocar em `packages/shared/helpers/`
- Funções puras, sem side effects
- Exemplos: formatação, validação, transformação

```javascript
// packages/shared/helpers/currency.js
export function formatCurrency(valueInCents) {
  return (valueInCents / 100).toFixed(2);
}

export function parseCurrency(valueString) {
  return Math.round(parseFloat(valueString) * 100);
}
```

## Constants

- Colocar em `packages/shared/constants/`
- Agrupar por domínio

```javascript
// packages/shared/constants/order.js
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  DELIVERING: "delivering",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const PAYMENT_METHOD = {
  CREDIT_CARD: "credit_card",
  DEBIT_CARD: "debit_card",
  PIX: "pix",
  CASH: "cash",
};
```

## Tratamento de Erros

- Criar classes de erro customizadas

```javascript
// src/errors/AppError.js
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Erro de validação") {
    super(message, 400);
    this.name = "ValidationError";
  }
}
```

## Testes

- **SEMPRE** criar uma função `makeSut` (System Under Test) que instancia o objeto testado
- **SEMPRE** testar todos os cenários possíveis (sucesso, falhas, edge cases)
- Usar mocks para dependências externas
- Testar cada camada isoladamente

### Exemplo de Teste

```javascript
describe("CreateUserUseCase", () => {
  const makeSut = () => {
    const userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    const emailService = {
      sendWelcomeEmail: jest.fn(),
    };
    const sut = new CreateUserUseCase(userRepository, emailService);
    return { sut, userRepository, emailService };
  };

  it("should create a new user", async () => {
    const { sut, userRepository } = makeSut();
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({ id: 1, name: "John" });

    const result = await sut.execute({ name: "John", email: "john@test.com" });

    expect(result).toEqual({ id: 1, name: "John" });
    expect(userRepository.create).toHaveBeenCalled();
  });

  it("should throw error if email already exists", async () => {
    const { sut, userRepository } = makeSut();
    userRepository.findByEmail.mockResolvedValue({ id: 1 });

    await expect(
      sut.execute({ name: "John", email: "john@test.com" }),
    ).rejects.toThrow("Email já cadastrado");
  });
});
```

## Monorepo e Workspaces

- Usar referências entre packages via `@delivery/shared`
- Configurar aliases no `package.json` de cada app

```json
{
  "name": "@delivery/api",
  "dependencies": {
    "@delivery/shared": "workspace:*"
  }
}
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

- **api**: backend
- **web**: frontend
- **shared**: packages compartilhados
- **users**, **orders**, **restaurants**, **deliveries**: módulos específicos

### Exemplos

```bash
feat(users): add create user use case
feat(orders): implement order placement flow
fix(api): resolve validation error handling
fix(shared): fix currency formatting helper
refactor(users): extract user repository
style(web): format code with prettier
chore(api): install zod dependency
docs(readme): update setup instructions
test(users): add tests for CreateUserUseCase
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
