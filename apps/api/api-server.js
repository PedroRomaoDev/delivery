import fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import {
    makeFindAllOrdersController,
    makeCreateOrderController,
    makeAddItemToOrderController,
} from './src/factories/index.js';

const app = fastify();

// Swagger configuration
await app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Delivery API',
            description:
                'API RESTful para gerenciamento de pedidos de delivery seguindo princípios de Domain-Driven Design (DDD) e Clean Architecture. ' +
                'Os pedidos são construídos de forma incremental (como um carrinho de compras): ' +
                '(1) Criar pedido em DRAFT, (2) Adicionar itens, (3) Adicionar pagamentos, (4) Definir endereço de entrega, (5) Confirmar pedido. ' +
                'Oferece endpoints para criação, consulta e gerenciamento completo do ciclo de vida dos pedidos.',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Local server',
            },
        ],
    },
});

await app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
});

// Orders routes
const findAllOrdersController = makeFindAllOrdersController();
const createOrderController = makeCreateOrderController();
const addItemToOrderController = makeAddItemToOrderController();

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
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        store_id: { type: 'string' },
                        order_id: { type: 'string' },
                        order: {
                            type: 'object',
                            properties: {
                                payments: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            prepaid: { type: 'boolean' },
                                            value: { type: 'number' },
                                            origin: { type: 'string' },
                                        },
                                    },
                                },
                                last_status_name: { type: 'string' },
                                store: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        id: { type: 'string' },
                                    },
                                },
                                total_price: { type: 'number' },
                                order_id: { type: 'string' },
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            code: { type: 'number' },
                                            price: { type: 'number' },
                                            observations: {
                                                type: ['string', 'null'],
                                            },
                                            total_price: { type: 'number' },
                                            name: { type: 'string' },
                                            quantity: { type: 'number' },
                                            discount: { type: 'number' },
                                            condiments: {
                                                type: 'array',
                                                items: {},
                                            },
                                        },
                                    },
                                },
                                created_at: { type: 'number' },
                                statuses: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            created_at: { type: 'number' },
                                            name: { type: 'string' },
                                            order_id: { type: 'string' },
                                            origin: { type: 'string' },
                                        },
                                    },
                                },
                                customer: {
                                    type: 'object',
                                    properties: {
                                        temporary_phone: { type: 'string' },
                                        name: { type: 'string' },
                                    },
                                },
                                delivery_address: {
                                    type: 'object',
                                    properties: {
                                        reference: { type: 'string' },
                                        street_name: { type: 'string' },
                                        postal_code: { type: 'string' },
                                        country: { type: 'string' },
                                        city: { type: 'string' },
                                        neighborhood: { type: 'string' },
                                        street_number: { type: 'string' },
                                        state: { type: 'string' },
                                        coordinates: {
                                            type: 'object',
                                            properties: {
                                                longitude: { type: 'number' },
                                                latitude: { type: 'number' },
                                                id: { type: 'number' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            500: {
                description: 'Erro interno do servidor',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
        },
    },
    handler: async (request, reply) => {
        return findAllOrdersController.execute(request, reply);
    },
});
app.route({
    method: 'POST',
    url: '/orders',
    schema: {
        tags: ['Orders'],
        summary: 'Criar novo pedido',
        description:
            'Cria um novo pedido no estado DRAFT. O campo storeId é opcional e usa um valor padrão se não fornecido.',
        body: {
            type: 'object',
            required: ['customer'],
            properties: {
                storeId: {
                    type: 'string',
                    format: 'uuid',
                    description:
                        'ID da loja (opcional, usa valor padrão se não fornecido)',
                },
                customer: {
                    type: 'object',
                    required: ['name', 'phone'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Nome do cliente',
                        },
                        phone: {
                            type: 'string',
                            description: 'Telefone do cliente',
                        },
                    },
                },
            },
        },
        response: {
            201: {
                description: 'Pedido criado com sucesso',
                type: 'object',
                properties: {
                    store_id: { type: 'string' },
                    order_id: { type: 'string' },
                    order: {
                        type: 'object',
                        properties: {
                            customer: {
                                type: 'object',
                                properties: {
                                    temporary_phone: { type: 'string' },
                                    name: { type: 'string' },
                                },
                            },
                            last_status_name: { type: 'string' },
                            items: { type: 'array', items: {} },
                            payments: { type: 'array', items: {} },
                            delivery_address: { type: ['object', 'null'] },
                            created_at: { type: 'number' },
                            total_price: { type: 'number' },
                        },
                    },
                },
            },
            400: {
                description: 'Dados inválidos',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
            500: {
                description: 'Erro interno do servidor',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
        },
    },
    handler: async (request, reply) => {
        return createOrderController.execute(request, reply);
    },
});

app.route({
    method: 'POST',
    url: '/orders/:id/items',
    schema: {
        tags: ['Orders'],
        summary: 'Adicionar item ao pedido',
        description:
            'Adiciona um novo item a um pedido em estado DRAFT. O preço do item é gerado automaticamente.',
        params: {
            type: 'object',
            required: ['id'],
            properties: {
                id: {
                    type: 'string',
                    description: 'ID do pedido',
                },
            },
        },
        body: {
            type: 'object',
            required: ['code', 'quantity'],
            properties: {
                code: {
                    type: 'number',
                    description: 'Código do produto',
                },
                quantity: {
                    type: 'number',
                    description: 'Quantidade do produto',
                    minimum: 1,
                },
                observations: {
                    type: 'string',
                    description: 'Observações sobre o item (opcional)',
                },
                name: {
                    type: 'string',
                    description: 'Nome do produto (opcional)',
                },
            },
        },
        response: {
            200: {
                description: 'Item adicionado com sucesso',
                type: 'object',
                properties: {
                    store_id: { type: 'string' },
                    order_id: { type: 'string' },
                    order: {
                        type: 'object',
                        properties: {
                            customer: {
                                type: 'object',
                                properties: {
                                    temporary_phone: { type: 'string' },
                                    name: { type: 'string' },
                                },
                            },
                            last_status_name: { type: 'string' },
                            items: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        code: { type: 'number' },
                                        price: { type: 'number' },
                                        observations: {
                                            type: ['string', 'null'],
                                        },
                                        total_price: { type: 'number' },
                                        name: { type: 'string' },
                                        quantity: { type: 'number' },
                                        discount: { type: 'number' },
                                        condiments: {
                                            type: 'array',
                                            items: {},
                                        },
                                    },
                                },
                            },
                            payments: { type: 'array', items: {} },
                            delivery_address: { type: ['object', 'null'] },
                            created_at: { type: 'number' },
                            total_price: { type: 'number' },
                        },
                    },
                },
            },
            400: {
                description:
                    'Dados inválidos, pedido não encontrado ou pedido não está em DRAFT',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
            500: {
                description: 'Erro interno do servidor',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
        },
    },
    handler: async (request, reply) => {
        return addItemToOrderController.handle(request, reply);
    },
});

const start = async () => {
    try {
        await app.ready();
        await app.listen({ port: 8080 });
        console.log('Server running at http://localhost:8080');
        console.log('Swagger docs at http://localhost:8080/docs');
    } catch (err) {
        console.error(err);
    }
};

start();
