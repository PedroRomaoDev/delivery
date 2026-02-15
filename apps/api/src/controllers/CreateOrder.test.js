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
        request.body = {
            storeId: 'store-123',
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        };

        const mockOrder = {
            store_id: 'store-123',
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

    it('should return 400 when storeId is missing', async () => {
        request.body = {
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        };

        await controller.execute(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'storeId and customer are required',
        });
    });

    it('should return 400 when customer is missing', async () => {
        request.body = {
            storeId: 'store-123',
        };

        await controller.execute(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'storeId and customer are required',
        });
    });

    it('should return 400 when customer.name is missing', async () => {
        request.body = {
            storeId: 'store-123',
            customer: {
                phone: '11987654321',
            },
        };

        await controller.execute(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'customer.name and customer.phone are required',
        });
    });

    it('should return 400 when customer.phone is missing', async () => {
        request.body = {
            storeId: 'store-123',
            customer: {
                name: 'João Silva',
            },
        };

        await controller.execute(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'customer.name and customer.phone are required',
        });
    });

    it('should return 500 when UseCase throws error', async () => {
        request.body = {
            storeId: 'store-123',
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
        request.body = {
            storeId: 'store-123',
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        };

        createOrderUseCase.execute.mockResolvedValue({});

        await controller.execute(request, reply);

        expect(createOrderUseCase.execute).toHaveBeenCalledWith({
            storeId: 'store-123',
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        });
    });
});
