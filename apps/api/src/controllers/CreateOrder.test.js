import CreateOrderController from './CreateOrder.js';

describe('CreateOrderController', () => {
    let createOrderUseCase;
    let controller;
    let request;
    let reply;

    beforeEach(() => {
        // Mock do UseCase
        createOrderUseCase = {
            execute: jest.fn(),
        };

        controller = new CreateOrderController(createOrderUseCase);

        // Mock do request e reply do Fastify
        request = {
            body: {},
        };

        reply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    it('should throw error if CreateOrderUseCase is not provided', () => {
        expect(() => new CreateOrderController()).toThrow(
            'CreateOrderUseCase is required',
        );
    });

    it('should create order with valid data', async () => {
        const validUuid = '550e8400-e29b-41d4-a716-446655440000';
        request.body = {
            storeId: validUuid,
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        };

        const mockOrder = {
            store_id: validUuid,
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 0,
            },
        };

        createOrderUseCase.execute.mockResolvedValue(mockOrder);

        await controller.execute(request, reply);

        expect(reply.status).toHaveBeenCalledWith(201);
        expect(reply.send).toHaveBeenCalledWith(mockOrder);
    });

    it('should use default storeId when storeId is not provided', async () => {
        const DEFAULT_STORE_ID = '98765432-abcd-ef00-1234-567890abcdef';

        request.body = {
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        };

        const mockOrder = {
            store_id: DEFAULT_STORE_ID,
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 0,
            },
        };

        createOrderUseCase.execute.mockResolvedValue(mockOrder);

        await controller.execute(request, reply);

        expect(reply.status).toHaveBeenCalledWith(201);
        expect(createOrderUseCase.execute).toHaveBeenCalledWith({
            storeId: DEFAULT_STORE_ID,
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        });
    });

    it('should return 400 when customer is missing', async () => {
        request.body = {
            storeId: '550e8400-e29b-41d4-a716-446655440000',
        };

        await controller.execute(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: expect.stringContaining('customer'),
            errors: expect.arrayContaining([
                expect.objectContaining({
                    field: 'customer',
                }),
            ]),
        });
    });

    it('should return 400 when customer.name is missing', async () => {
        request.body = {
            storeId: '550e8400-e29b-41d4-a716-446655440000',
            customer: {
                phone: '11987654321',
            },
        };

        await controller.execute(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: expect.stringContaining('customer.name'),
            errors: expect.arrayContaining([
                expect.objectContaining({
                    field: 'customer.name',
                }),
            ]),
        });
    });

    it('should return 400 when customer.phone is missing', async () => {
        request.body = {
            storeId: '550e8400-e29b-41d4-a716-446655440000',
            customer: {
                name: 'João Silva',
            },
        };

        await controller.execute(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: expect.stringContaining('customer.phone'),
            errors: expect.arrayContaining([
                expect.objectContaining({
                    field: 'customer.phone',
                }),
            ]),
        });
    });

    it('should return 500 when UseCase throws error', async () => {
        request.body = {
            storeId: '550e8400-e29b-41d4-a716-446655440000',
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        };

        createOrderUseCase.execute.mockRejectedValue(
            new Error('Database error'),
        );

        await controller.execute(request, reply);

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });

    it('should call UseCase with correct parameters', async () => {
        const validUuid = '550e8400-e29b-41d4-a716-446655440000';
        request.body = {
            storeId: validUuid,
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        };

        createOrderUseCase.execute.mockResolvedValue({});

        await controller.execute(request, reply);

        expect(createOrderUseCase.execute).toHaveBeenCalledWith({
            storeId: validUuid,
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        });
    });
});
