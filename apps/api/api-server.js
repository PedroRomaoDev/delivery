import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import {
    makeFindAllOrdersController,
    makeCreateOrderController,
    makeAddItemToOrderController,
    makeAddPaymentToOrderController,
    makeAddDeliveryAddressToOrderController,
    makeReceiveOrderController,
    makeConfirmOrderController,
    makeDispatchOrderController,
    makeDeliverOrderController,
    makeCancelOrderController,
    makeGetOrderByIdController,
    makeUpdateItemInOrderController,
    makeUpdateCustomerInOrderController,
    makeRemoveItemFromOrderController,
} from './src/factories/index.js';

const app = fastify();

await app.register(fastifyCors, {
    origin: true,
    credentials: true,
});

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
const addPaymentToOrderController = makeAddPaymentToOrderController();
const addDeliveryAddressToOrderController =
    makeAddDeliveryAddressToOrderController();
const receiveOrderController = makeReceiveOrderController();
const confirmOrderController = makeConfirmOrderController();
const dispatchOrderController = makeDispatchOrderController();
const deliverOrderController = makeDeliverOrderController();
const cancelOrderController = makeCancelOrderController();
const getOrderByIdController = makeGetOrderByIdController();
const updateItemInOrderController = makeUpdateItemInOrderController();
const updateCustomerInOrderController = makeUpdateCustomerInOrderController();
const removeItemFromOrderController = makeRemoveItemFromOrderController();

app.route({
    method: 'POST',
    url: '/orders',
    schema: {
        tags: ['Criação de Pedido'],
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
                            payments: { type: 'array', items: {} },
                            last_status_name: { type: 'string' },
                            store: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    id: { type: 'string' },
                                },
                            },
                            total_price: { type: 'number' },
                            items: { type: 'array', items: {} },
                            created_at: { type: 'number' },
                            statuses: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        created_at: { type: 'number' },
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
                            delivery_address: { type: ['object', 'null'] },
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
        tags: ['Criação de Pedido'],
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
                            payments: { type: 'array', items: {} },
                            last_status_name: { type: 'string' },
                            store: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    id: { type: 'string' },
                                },
                            },
                            total_price: { type: 'number' },
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
                                        name: { type: 'string' },
                                        created_at: { type: 'number' },
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
                            delivery_address: { type: ['object', 'null'] },
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

app.route({
    method: 'PATCH',
    url: '/orders/:id/customer',
    schema: {
        tags: ['Mudar informações do pedido'],
        summary: 'Atualizar cliente do pedido (apenas em DRAFT)',
        description:
            'Atualiza os dados do cliente de um pedido em estado DRAFT. Pelo menos um campo (name ou phone) deve ser fornecido para atualização.',
        params: {
            type: 'object',
            required: ['id'],
            properties: {
                id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID do pedido (UUID)',
                },
            },
        },
        body: {
            type: 'object',
            minProperties: 1,
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
        response: {
            200: {
                description: 'Cliente atualizado com sucesso',
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
                                    name: { type: 'string' },
                                    temporary_phone: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
            400: {
                description: 'Erro de validação ou pedido não está em DRAFT',
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
        return updateCustomerInOrderController.handle(request, reply);
    },
});

app.route({
    method: 'PATCH',
    url: '/orders/:id/items/:code',
    schema: {
        tags: ['Mudar informações do pedido'],
        summary: 'Atualizar item no pedido (apenas em DRAFT)',
        description:
            'Atualiza um item existente no pedido. Permite atualizar quantidade, nome e observações. Apenas disponível para pedidos em estado DRAFT.',
        params: {
            type: 'object',
            required: ['id', 'code'],
            properties: {
                id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID do pedido',
                },
                code: {
                    type: 'integer',
                    description: 'Código do item',
                },
            },
        },
        body: {
            type: 'object',
            minProperties: 1,
            properties: {
                quantity: {
                    type: 'integer',
                    minimum: 1,
                    description: 'Nova quantidade do item',
                },
                name: {
                    type: 'string',
                    description: 'Novo nome do item',
                },
                observations: {
                    type: 'string',
                    description: 'Novas observações sobre o item',
                },
            },
        },
        response: {
            200: {
                description: 'Item atualizado com sucesso',
                type: 'object',
                properties: {
                    store_id: { type: 'string' },
                    order_id: { type: 'string' },
                    order: {
                        type: 'object',
                        properties: {
                            payments: { type: 'array' },
                            last_status_name: { type: 'string' },
                            store: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    id: { type: 'string' },
                                },
                            },
                            total_price: { type: 'number' },
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
                                        name: { type: 'string' },
                                        created_at: { type: 'number' },
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
                            delivery_address: { type: ['object', 'null'] },
                        },
                    },
                },
            },
            400: {
                description:
                    'Dados inválidos, pedido não encontrado, item não encontrado ou pedido não está em DRAFT',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    errors: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                field: { type: 'string' },
                                message: { type: 'string' },
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
        return updateItemInOrderController.handle(request, reply);
    },
});

app.route({
    method: 'POST',
    url: '/orders/:id/payments',
    schema: {
        tags: ['Criação de Pedido'],
        summary: 'Adicionar pagamento ao pedido',
        description:
            'Adiciona um novo pagamento a um pedido em estado DRAFT. O valor do pagamento é calculado automaticamente baseado no total dos items.',
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
            required: ['origin'],
            properties: {
                origin: {
                    type: 'string',
                    description:
                        'Método de pagamento (CREDIT_CARD, PIX, CASH, VR, etc.)',
                },
                prepaid: {
                    type: 'boolean',
                    description: 'Se o pagamento foi pré-pago (padrão: true)',
                    default: true,
                },
            },
        },
        response: {
            200: {
                description: 'Pagamento adicionado com sucesso',
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
                            items: { type: 'array', items: {} },
                            created_at: { type: 'number' },
                            statuses: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        created_at: { type: 'number' },
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
                            delivery_address: { type: ['object', 'null'] },
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
        return addPaymentToOrderController.handle(request, reply);
    },
});

app.route({
    method: 'DELETE',
    url: '/orders/:id/items/:code',
    schema: {
        tags: ['Mudar informações do pedido'],
        summary: 'Remover item do pedido (apenas em DRAFT)',
        description:
            'Remove um item existente do pedido. Apenas disponível para pedidos em estado DRAFT.',
        params: {
            type: 'object',
            required: ['id', 'code'],
            properties: {
                id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID do pedido (UUID)',
                },
                code: {
                    type: 'integer',
                    description: 'Código do item a ser removido',
                },
            },
        },
        response: {
            200: {
                description: 'Item removido com sucesso',
                type: 'object',
                properties: {
                    store_id: { type: 'string' },
                    order_id: { type: 'string' },
                    order: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            status: { type: 'string' },
                            customer: { type: 'object' },
                            items: { type: 'array' },
                            payments: { type: 'array' },
                            delivery_address: { type: ['object', 'null'] },
                        },
                    },
                },
            },
            400: {
                description:
                    'Erro de validação, item não encontrado ou pedido não está em DRAFT',
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
        return removeItemFromOrderController.handle(request, reply);
    },
});

app.route({
    method: 'POST',
    url: '/orders/:id/delivery-address',
    schema: {
        tags: ['Criação de Pedido'],
        summary: 'Adicionar endereço de entrega ao pedido',
        description:
            'Adiciona ou atualiza o endereço de entrega de um pedido em estado DRAFT. As coordenadas geográficas (latitude/longitude) são calculadas automaticamente via geocoding (OpenStreetMap Nominatim) se não forem fornecidas.',
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
            required: [
                'street_name',
                'street_number',
                'city',
                'state',
                'postal_code',
                'country',
            ],
            properties: {
                street_name: {
                    type: 'string',
                    description: 'Nome da rua',
                },
                street_number: {
                    type: 'string',
                    description: 'Número do endereço',
                },
                city: {
                    type: 'string',
                    description: 'Cidade',
                },
                state: {
                    type: 'string',
                    description: 'Estado',
                },
                postal_code: {
                    type: 'string',
                    description: 'CEP',
                },
                country: {
                    type: 'string',
                    description: 'País (código de 2 letras, ex: BR)',
                },
                neighborhood: {
                    type: 'string',
                    description: 'Bairro (opcional)',
                },
                reference: {
                    type: 'string',
                    description: 'Ponto de referência (opcional)',
                },
                coordinates: {
                    type: 'object',
                    description:
                        'Coordenadas geográficas (opcional - será calculado automaticamente se não fornecido)',
                    properties: {
                        latitude: { type: 'number' },
                        longitude: { type: 'number' },
                        id: { type: 'number' },
                    },
                },
            },
        },
        response: {
            200: {
                description: 'Endereço de entrega adicionado com sucesso',
                type: 'object',
                properties: {
                    store_id: { type: 'string' },
                    order_id: { type: 'string' },
                    order: {
                        type: 'object',
                        properties: {
                            payments: { type: 'array', items: {} },
                            last_status_name: { type: 'string' },
                            store: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    id: { type: 'string' },
                                },
                            },
                            total_price: { type: 'number' },
                            items: { type: 'array', items: {} },
                            created_at: { type: 'number' },
                            statuses: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        created_at: { type: 'number' },
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
                                    street_name: { type: 'string' },
                                    street_number: { type: 'string' },
                                    city: { type: 'string' },
                                    state: { type: 'string' },
                                    postal_code: { type: 'string' },
                                    country: { type: 'string' },
                                    neighborhood: {
                                        type: ['string', 'null'],
                                    },
                                    reference: { type: ['string', 'null'] },
                                    coordinates: {
                                        type: ['object', 'null'],
                                        properties: {
                                            latitude: { type: 'number' },
                                            longitude: { type: 'number' },
                                            id: { type: 'number' },
                                        },
                                    },
                                },
                            },
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
        return addDeliveryAddressToOrderController.handle(request, reply);
    },
});

app.route({
    method: 'GET',
    url: '/orders',
    schema: {
        tags: ['Consulta de Pedidos'],
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
    method: 'GET',
    url: '/orders/:id',
    schema: {
        tags: ['Consulta de Pedidos'],
        summary: 'Buscar pedido por ID',
        description: 'Retorna os detalhes completos de um pedido específico',
        params: {
            type: 'object',
            required: ['id'],
            properties: {
                id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID do pedido',
                },
            },
        },
        response: {
            200: {
                description: 'Pedido retornado com sucesso',
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
            400: {
                description: 'Pedido não encontrado ou ID inválido',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    errors: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                field: { type: 'string' },
                                message: { type: 'string' },
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
        return getOrderByIdController.handle(request, reply);
    },
});

app.route({
    method: 'POST',
    url: '/orders/:id/receive',
    schema: {
        tags: ['Transição de Estado'],
        summary: 'Recebe o pedido (transição de status DRAFT → RECEIVED)',
        description:
            'Transiciona um pedido do status DRAFT para RECEIVED. ' +
            'Valida que o pedido está completo (possui itens, pagamento, endereço de entrega e totais correspondem) ' +
            'e está no status DRAFT antes de receber.',
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
        response: {
            200: {
                description: 'Order received successfully',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    order: {
                        type: 'object',
                        properties: {
                            payments: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        payment_type: { type: 'string' },
                                        payment_method: { type: 'string' },
                                        value: { type: 'number' },
                                    },
                                },
                            },
                            last_status_name: { type: 'string' },
                            store: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                },
                            },
                            total_price: { type: 'number' },
                            items: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        description: { type: 'string' },
                                        quantity: { type: 'integer' },
                                        unit_price: { type: 'number' },
                                        total_price: { type: 'number' },
                                    },
                                },
                            },
                            created_at: { type: 'string' },
                            statuses: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        description: { type: 'string' },
                                        date: { type: 'string' },
                                        origin: { type: 'string' },
                                    },
                                },
                            },
                            customer: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    phone: { type: 'string' },
                                },
                            },
                            delivery_address: {
                                type: 'object',
                                properties: {
                                    street: { type: 'string' },
                                    number: { type: 'string' },
                                    neighborhood: { type: 'string' },
                                    city: { type: 'string' },
                                    state: { type: 'string' },
                                    zip_code: { type: 'string' },
                                    coordinates: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer' },
                                            latitude: { type: 'number' },
                                            longitude: { type: 'number' },
                                        },
                                    },
                                },
                            },
                            order_id: { type: 'string' },
                        },
                    },
                },
            },
            400: {
                description: 'Validation error or business rule violation',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
            500: {
                description: 'Internal server error',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
        },
    },
    handler: async (request, reply) => {
        return receiveOrderController.handle(request, reply);
    },
});

app.route({
    method: 'POST',
    url: '/orders/:id/confirm',
    schema: {
        tags: ['Transição de Estado'],
        summary: 'Confirmar pedido (transição de status RECEIVED → CONFIRMED)',
        description:
            'Transiciona um pedido do status RECEIVED para CONFIRMED. ' +
            'Valida que o pedido está no status RECEIVED antes de confirmar.',
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
        response: {
            200: {
                description: 'Order confirmed successfully',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    order: {
                        type: 'object',
                        properties: {
                            payments: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        payment_type: { type: 'string' },
                                        payment_method: { type: 'string' },
                                        value: { type: 'number' },
                                    },
                                },
                            },
                            last_status_name: { type: 'string' },
                            store: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                },
                            },
                            total_price: { type: 'number' },
                            items: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        description: { type: 'string' },
                                        quantity: { type: 'integer' },
                                        unit_price: { type: 'number' },
                                        total_price: { type: 'number' },
                                    },
                                },
                            },
                            created_at: { type: 'string' },
                            statuses: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        description: { type: 'string' },
                                        date: { type: 'string' },
                                        origin: { type: 'string' },
                                    },
                                },
                            },
                            customer: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    phone: { type: 'string' },
                                },
                            },
                            delivery_address: {
                                type: 'object',
                                properties: {
                                    street: { type: 'string' },
                                    number: { type: 'string' },
                                    neighborhood: { type: 'string' },
                                    city: { type: 'string' },
                                    state: { type: 'string' },
                                    zip_code: { type: 'string' },
                                    coordinates: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer' },
                                            latitude: { type: 'number' },
                                            longitude: { type: 'number' },
                                        },
                                    },
                                },
                            },
                            order_id: { type: 'string' },
                        },
                    },
                },
            },
            400: {
                description: 'Validation error or business rule violation',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
            500: {
                description: 'Internal server error',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
        },
    },
    handler: async (request, reply) => {
        return confirmOrderController.handle(request, reply);
    },
});

app.route({
    method: 'POST',
    url: '/orders/:id/dispatch',
    schema: {
        tags: ['Transição de Estado'],
        summary: 'Enviar pedido (transição de status CONFIRMED → DISPATCHED)',
        description:
            'Transiciona um pedido do status CONFIRMED para DISPATCHED. ' +
            'Valida que o pedido está no status CONFIRMED antes de despachar.',
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
        response: {
            200: {
                description: 'Order dispatched successfully',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    order: {
                        type: 'object',
                        properties: {
                            payments: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        payment_type: { type: 'string' },
                                        payment_method: { type: 'string' },
                                        value: { type: 'number' },
                                    },
                                },
                            },
                            last_status_name: { type: 'string' },
                            store: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                },
                            },
                            total_price: { type: 'number' },
                            items: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        description: { type: 'string' },
                                        quantity: { type: 'integer' },
                                        unit_price: { type: 'number' },
                                        total_price: { type: 'number' },
                                    },
                                },
                            },
                            created_at: { type: 'string' },
                            statuses: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        description: { type: 'string' },
                                        date: { type: 'string' },
                                        origin: { type: 'string' },
                                    },
                                },
                            },
                            customer: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    phone: { type: 'string' },
                                },
                            },
                            delivery_address: {
                                type: 'object',
                                properties: {
                                    street: { type: 'string' },
                                    number: { type: 'string' },
                                    neighborhood: { type: 'string' },
                                    city: { type: 'string' },
                                    state: { type: 'string' },
                                    zip_code: { type: 'string' },
                                    coordinates: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer' },
                                            latitude: { type: 'number' },
                                            longitude: { type: 'number' },
                                        },
                                    },
                                },
                            },
                            order_id: { type: 'string' },
                        },
                    },
                },
            },
            400: {
                description: 'Validation error or business rule violation',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
            500: {
                description: 'Internal server error',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
        },
    },
    handler: async (request, reply) => {
        return dispatchOrderController.handle(request, reply);
    },
});

app.route({
    method: 'POST',
    url: '/orders/:id/deliver',
    schema: {
        tags: ['Transição de Estado'],
        summary: 'Pedido entregue (transição de status DISPATCHED → DELIVERED)',
        description:
            'Transiciona um pedido do status DISPATCHED para DELIVERED. ' +
            'Valida que o pedido está no status DISPATCHED antes de entregar.',
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
        response: {
            200: {
                description: 'Order delivered successfully',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    order: {
                        type: 'object',
                        properties: {
                            payments: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        payment_type: { type: 'string' },
                                        payment_method: { type: 'string' },
                                        value: { type: 'number' },
                                    },
                                },
                            },
                            last_status_name: { type: 'string' },
                            store: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                },
                            },
                            total_price: { type: 'number' },
                            items: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        description: { type: 'string' },
                                        quantity: { type: 'integer' },
                                        unit_price: { type: 'number' },
                                        total_price: { type: 'number' },
                                    },
                                },
                            },
                            created_at: { type: 'string' },
                            statuses: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        description: { type: 'string' },
                                        date: { type: 'string' },
                                        origin: { type: 'string' },
                                    },
                                },
                            },
                            customer: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    phone: { type: 'string' },
                                },
                            },
                            delivery_address: {
                                type: 'object',
                                properties: {
                                    street: { type: 'string' },
                                    number: { type: 'string' },
                                    neighborhood: { type: 'string' },
                                    city: { type: 'string' },
                                    state: { type: 'string' },
                                    zip_code: { type: 'string' },
                                    coordinates: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer' },
                                            latitude: { type: 'number' },
                                            longitude: { type: 'number' },
                                        },
                                    },
                                },
                            },
                            order_id: { type: 'string' },
                        },
                    },
                },
            },
            400: {
                description: 'Validation error or business rule violation',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
            500: {
                description: 'Internal server error',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
        },
    },
    handler: async (request, reply) => {
        return deliverOrderController.handle(request, reply);
    },
});

app.route({
    method: 'POST',
    url: '/orders/:id/cancel',
    schema: {
        tags: ['Transição de Estado'],
        summary:
            'Cancelar pedido (transição de DRAFT|RECEIVED|CONFIRMED → CANCELED)',
        description:
            'Transiciona um pedido dos status DRAFT, RECEIVED ou CONFIRMED para CANCELED. ' +
            'Valida que o pedido está em um dos estados canceláveis antes de cancelar. ' +
            'Pedidos em DISPATCHED ou DELIVERED não podem ser cancelados.',
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
        response: {
            200: {
                description: 'Order canceled successfully',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    order: {
                        type: 'object',
                        properties: {
                            payments: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        payment_type: { type: 'string' },
                                        payment_method: { type: 'string' },
                                        value: { type: 'number' },
                                    },
                                },
                            },
                            last_status_name: { type: 'string' },
                            store: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                },
                            },
                            total_price: { type: 'number' },
                            items: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        description: { type: 'string' },
                                        quantity: { type: 'integer' },
                                        unit_price: { type: 'number' },
                                        total_price: { type: 'number' },
                                    },
                                },
                            },
                            created_at: { type: 'string' },
                            statuses: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        description: { type: 'string' },
                                        date: { type: 'string' },
                                        origin: { type: 'string' },
                                    },
                                },
                            },
                            customer: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    phone: { type: 'string' },
                                },
                            },
                            delivery_address: {
                                type: 'object',
                                properties: {
                                    street: { type: 'string' },
                                    number: { type: 'string' },
                                    neighborhood: { type: 'string' },
                                    city: { type: 'string' },
                                    state: { type: 'string' },
                                    zip_code: { type: 'string' },
                                    coordinates: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer' },
                                            latitude: { type: 'number' },
                                            longitude: { type: 'number' },
                                        },
                                    },
                                },
                            },
                            order_id: { type: 'string' },
                        },
                    },
                },
            },
            400: {
                description: 'Validation error or business rule violation',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
            500: {
                description: 'Internal server error',
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
        },
    },
    handler: async (request, reply) => {
        return cancelOrderController.handle(request, reply);
    },
});

const start = async () => {
    try {
        await app.ready();
        await app.listen({ port: 8080, host: '0.0.0.0' });
        console.log('Server running at http://localhost:8080');
        console.log('Swagger docs at http://localhost:8080/docs');
    } catch (err) {
        console.error(err);
    }
};

start();
