# Validação com Zod

Este projeto usa [Zod](https://zod.dev/) para validação de schemas tipesafe.

## Estrutura

### Schemas (`packages/shared/schemas/`)

Os schemas de validação ficam em `packages/shared/schemas` para serem compartilhados entre API e frontend.

**Exemplo: `packages/shared/schemas/orders.js`**

```javascript
import { z } from 'zod';

export const createOrderSchema = z.object({
    storeId: z
        .string({
            required_error: 'storeId is required',
            invalid_type_error: 'storeId must be a string',
        })
        .uuid('storeId must be a valid UUID'),
    customer: z.object({
        name: z.string().min(1, 'customer.name cannot be empty'),
        phone: z.string().min(1, 'customer.phone cannot be empty'),
        email: z.string().email().optional(),
    }),
});
```

### Helper de Validação (`packages/helpers/validate.js`)

Função utilitária que encapsula a validação Zod e retorna um formato consistente:

```javascript
import { validate } from '@delivery/helpers/validate.js';
import { createOrderSchema } from '@delivery/shared/schemas';

const result = validate(createOrderSchema, request.body);

if (!result.success) {
    // result.errors = [{ field: 'storeId', message: 'storeId is required' }]
    return reply
        .status(400)
        .send({ message: 'Validation error', errors: result.errors });
}

// result.data contém os dados validados
const { storeId, customer } = result.data;
```

### HTTP Response Helper

Novo helper `validationError` para respostas de erro de validação:

```javascript
import { validationError } from '@delivery/helpers/http.js';

const response = validationError([
    { field: 'email', message: 'Invalid email format' },
    { field: 'age', message: 'Must be  at least 18' },
]);

return reply.status(response.statusCode).send(response.body);
// { message: 'Validation error', errors: [...] }
```

## Uso nos Controllers

**Antes (validação manual):**

```javascript
class CreateOrderController {
    async execute(request, reply) {
        const { storeId, customer } = request.body;

        if (!storeId || !customer) {
            return reply
                .status(400)
                .send({ message: 'storeId and customer are required' });
        }

        if (!customer.name || !customer.phone) {
            return reply
                .status(400)
                .send({ message: 'customer.name and phone are required' });
        }

        // ... resto do código
    }
}
```

**Depois (com Zod):**

```javascript
import { validate } from '@delivery/helpers/validate.js';
import { validationError } from '@delivery/helpers/http.js';
import { createOrderSchema } from '@delivery/shared/schemas';

class CreateOrderController {
    async execute(request, reply) {
        // Validação com Zod
        const validation = validate(createOrderSchema, request.body);

        if (!validation.success) {
            const response = validationError(validation.errors);
            return reply.status(response.statusCode).send(response.body);
        }

        const { storeId, customer } = validation.data;

        // ... resto do código
    }
}
```

## Formato de Resposta de Erro

```json
{
    "message": "Validation error",
    "errors": [
        {
            "field": "storeId",
            "message": "storeId is required"
        },
        {
            "field": "customer.email",
            "message": "Invalid email format"
        }
    ]
}
```

## Schemas Disponíveis

- `createOrderSchema` - Validação para criação de pedido
- `addItemToOrderSchema` - Validação para adicionar item ao pedido
- `orderIdParamSchema` - Validação para parâmetro orderId (UUID)
- `customerSchema` - Validação de dados do cliente

## Testando

Adicione mocks apropriados nos testes:

```javascript
// Mock Zod imports
jest.mock('@delivery/shared/schemas', () => ({
    createOrderSchema: {
        parse: jest.fn(),
    },
}));

// Ou use os schemas reais
import { createOrderSchema } from '@delivery/shared/schemas';

test('validates correct data', () => {
    const data = {
        storeId: crypto.randomUUID(),
        customer: { name: 'João', phone: '11987654321' },
    };
    const result = createOrderSchema.parse(data); // Throws if invalid
    expect(result).toEqual(data);
});
```

## Adicionando Novos Schemas

1. Crie o schema em `packages/shared/schemas/[entity].js`
2. Exporte no `packages/shared/schemas/index.js`
3. Use nos controllers com o helper `validate()`

**Exemplo:**

```javascript
// packages/shared/schemas/products.js
import { z } from 'zod';

export const createProductSchema = z.object({
    name: z.string().min(3),
    price: z.number().positive(),
    description: z.string().optional(),
});

// packages/shared/schemas/index.js
export { createProductSchema } from './products.js';
```
