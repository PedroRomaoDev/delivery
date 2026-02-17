import DeliverOrderController from './DeliverOrder.js';

describe('DeliverOrderController', () => {
    let deliverOrderUseCase;
    let deliverOrderController;
    let request;
    let reply;

    beforeEach(() => {
        deliverOrderUseCase = {
            execute: jest.fn(),
        };

        deliverOrderController = new DeliverOrderController(
            deliverOrderUseCase,
        );

        request = {
            params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        };

        reply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    it('should deliver order successfully', async () => {
        const mockOrder = {
            store_id: 'store-123',
            order_id: '123e4567-e89b-12d3-a456-426614174000',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DELIVERED',
                store: {
                    name: 'COCO BAMBU CHIQUE CHIQUE',
                    id: 'store-123',
                },
                items: [
                    {
                        code: 123,
                        price: 50.0,
                        total_price: 100.0,
                        quantity: 2,
                        discount: 0,
                        condiments: [],
                    },
                ],
                payments: [
                    {
                        prepaid: true,
                        value: 100.0,
                        origin: 'PIX',
                    },
                ],
                delivery_address: {
                    street: 'Rua Teste',
                    number: '123',
                    neighborhood: 'Centro',
                    city: 'São Paulo',
                    state: 'SP',
                    zip_code: '01000-000',
                    coordinates: {
                        id: 1234567,
                        latitude: -23.55,
                        longitude: -46.63,
                    },
                },
                created_at: 1770842000000,
                total_price: 100.0,
                statuses: [
                    {
                        description: 'DRAFT',
                        date: 1770842000000,
                        origin: 'CUSTOMER',
                    },
                    {
                        description: 'RECEIVED',
                        date: 1770842100000,
                        origin: 'CUSTOMER',
                    },
                    {
                        description: 'CONFIRMED',
                        date: 1770842200000,
                        origin: 'STORE',
                    },
                    {
                        description: 'DISPATCHED',
                        date: 1770842300000,
                        origin: 'STORE',
                    },
                    {
                        description: 'DELIVERED',
                        date: 1770842400000,
                        origin: 'STORE',
                    },
                ],
            },
        };

        deliverOrderUseCase.execute.mockResolvedValue(mockOrder);

        await deliverOrderController.handle(request, reply);

        expect(deliverOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: '123e4567-e89b-12d3-a456-426614174000',
        });
        expect(reply.status).toHaveBeenCalledWith(200);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Order delivered successfully',
            order: mockOrder,
        });
    });

    it('should return 400 when orderId is invalid', async () => {
        request.params.id = 'invalid-uuid';

        await deliverOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: expect.stringContaining('id'),
            errors: expect.arrayContaining([
                expect.objectContaining({
                    field: 'id',
                }),
            ]),
        });
    });

    it('should return 400 when order is not found', async () => {
        deliverOrderUseCase.execute.mockRejectedValue(
            new Error('Order not found'),
        );

        await deliverOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Order not found',
        });
    });

    it('should return 400 when order is not in DISPATCHED status', async () => {
        deliverOrderUseCase.execute.mockRejectedValue(
            new Error('Only orders in DISPATCHED status can be delivered'),
        );

        await deliverOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Only orders in DISPATCHED status can be delivered',
        });
    });

    it('should return 500 when unexpected error occurs', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        deliverOrderUseCase.execute.mockRejectedValue(
            new Error('Unexpected database error'),
        );

        await deliverOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Internal server error',
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error in DeliverOrderController:',
            expect.any(Error),
        );

        consoleErrorSpy.mockRestore();
    });

    it('should handle database errors as 500', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        deliverOrderUseCase.execute.mockRejectedValue(
            new Error('Database connection failed'),
        );

        await deliverOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Internal server error',
        });

        consoleErrorSpy.mockRestore();
    });
});
