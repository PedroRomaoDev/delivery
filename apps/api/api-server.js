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
            description:
                'API RESTful para gerenciamento de pedidos de delivery. Desenvolvida como parte do desafio técnico da CbLab, oferece endpoints para consulta, criação e atualização de pedidos.',
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
