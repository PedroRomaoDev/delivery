import AddItemToOrderController from './AddItemToOrder.js';

describe('AddItemToOrderController', () => {
    let addItemToOrderUseCase;
    let addItemToOrderController;
    let request;
    let reply;

    beforeEach(() => {
        addItemToOrderUseCase = {
            execute: jest.fn(),
        };

        addItemToOrderController = new AddItemToOrderController(
            addItemToOrderUseCase,
        );

        request = {
            params: { id: '123e4567-e89b-12d3-a456-426614174000' }, // UUID válido
            body: {
                code: 123,
                quantity: 2,
                observations: 'Sem cebola',
                name: 'Test Product',
            },
        };

        reply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    it('should add item to order successfully', async () => {
        const mockOrder = {
            store_id: 'store-123',
            order_id: '123e4567-e89b-12d3-a456-426614174000',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                items: [
                    {
                        code: 123,
                        price: 50.0,
                        observations: 'Sem cebola',
                        total_price: 100.0,
                        name: 'Test Product',
                        quantity: 2,
                        discount: 0,
                        condiments: [],
                    },
                ],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 100.0,
            },
        };

        addItemToOrderUseCase.execute.mockResolvedValue(mockOrder);

        await addItemToOrderController.handle(request, reply);

        expect(addItemToOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: '123e4567-e89b-12d3-a456-426614174000',
            code: 123,
            quantity: 2,
            observations: 'Sem cebola',
            name: 'Test Product',
        });
        expect(reply.status).toHaveBeenCalledWith(200);
        expect(reply.send).toHaveBeenCalledWith(mockOrder);
    });

    it('should return 400 when code is missing', async () => {
        request.body.code = undefined;

        await addItemToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: expect.stringContaining('code'),
            errors: expect.arrayContaining([
                expect.objectContaining({
                    field: 'code',
                }),
            ]),
        });
    });

    it('should return 400 when quantity is missing', async () => {
        request.body.quantity = undefined;

        await addItemToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: expect.stringContaining('quantity'),
            errors: expect.arrayContaining([
                expect.objectContaining({
                    field: 'quantity',
                }),
            ]),
        });
    });

    it('should return 400 when quantity is not a positive number', async () => {
        request.body.quantity = 0;

        await addItemToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: expect.stringContaining('quantity'),
            errors: expect.arrayContaining([
                expect.objectContaining({
                    field: 'quantity',
                    message: expect.stringContaining('positive'),
                }),
            ]),
        });
    });

    it('should return 400 when order is not found', async () => {
        addItemToOrderUseCase.execute.mockRejectedValue(
            new Error('Order not found'),
        );

        await addItemToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Order not found',
        });
    });

    it('should return 400 when order is not in DRAFT status', async () => {
        addItemToOrderUseCase.execute.mockRejectedValue(
            new Error('Cannot add items to order that is not in DRAFT status'),
        );

        await addItemToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Cannot add items to order that is not in DRAFT status',
        });
    });

    it('should return 500 on unexpected errors', async () => {
        addItemToOrderUseCase.execute.mockRejectedValue(
            new Error('Database connection failed'),
        );

        await addItemToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });

    it('should set observations to null when not provided', async () => {
        request.body.observations = undefined;

        addItemToOrderUseCase.execute.mockResolvedValue({
            store_id: 'store-123',
            order_id: '123e4567-e89b-12d3-a456-426614174000',
            order: {
                items: [],
            },
        });

        await addItemToOrderController.handle(request, reply);

        expect(addItemToOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: '123e4567-e89b-12d3-a456-426614174000',
            code: 123,
            quantity: 2,
            observations: null,
            name: 'Test Product',
        });
    });

    it('should handle negative quantity', async () => {
        request.body.quantity = -1;

        await addItemToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: expect.stringContaining('quantity'),
            errors: expect.arrayContaining([
                expect.objectContaining({
                    field: 'quantity',
                    message: expect.stringContaining('positive'),
                }),
            ]),
        });
    });
});
