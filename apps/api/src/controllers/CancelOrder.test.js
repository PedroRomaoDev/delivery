import CancelOrderController from './CancelOrder.js';

describe('CancelOrderController', () => {
    let cancelOrderUseCase;
    let cancelOrderController;
    let request;
    let reply;

    beforeEach(() => {
        cancelOrderUseCase = {
            execute: jest.fn(),
        };

        cancelOrderController = new CancelOrderController(cancelOrderUseCase);

        request = {
            params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        };

        reply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    it('should cancel order successfully', async () => {
        const mockOrder = {
            store_id: 'store-123',
            order_id: '123e4567-e89b-12d3-a456-426614174000',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'CANCELED',
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
                        name: 'DRAFT',
                        created_at: 1770842000000,
                        origin: 'CUSTOMER',
                    },
                    {
                        name: 'RECEIVED',
                        created_at: 1770842100000,
                        origin: 'CUSTOMER',
                    },
                    {
                        name: 'CANCELED',
                        created_at: 1770842200000,
                        origin: 'STORE',
                    },
                ],
            },
        };

        cancelOrderUseCase.execute.mockResolvedValue(mockOrder);

        await cancelOrderController.handle(request, reply);

        expect(cancelOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: '123e4567-e89b-12d3-a456-426614174000',
        });
        expect(reply.status).toHaveBeenCalledWith(200);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Order canceled successfully',
            order: mockOrder,
        });
    });

    it('should return 400 when order ID is invalid UUID', async () => {
        request.params.id = 'invalid-uuid';

        await cancelOrderController.handle(request, reply);

        expect(cancelOrderUseCase.execute).not.toHaveBeenCalled();
        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            errors: expect.arrayContaining([
                expect.objectContaining({
                    field: 'id',
                    message: expect.any(String),
                }),
            ]),
            message: expect.any(String),
        });
    });

    it('should return 400 when order is not found', async () => {
        cancelOrderUseCase.execute.mockRejectedValue(
            new Error('Order not found'),
        );

        await cancelOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Order not found',
        });
    });

    it('should return 400 when order cannot be canceled', async () => {
        cancelOrderUseCase.execute.mockRejectedValue(
            new Error(
                'Only orders in DRAFT, RECEIVED, or CONFIRMED status can be canceled',
            ),
        );

        await cancelOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message:
                'Only orders in DRAFT, RECEIVED, or CONFIRMED status can be canceled',
        });
    });

    it('should return 500 when an unexpected error occurs', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        cancelOrderUseCase.execute.mockRejectedValue(
            new Error('Unexpected error'),
        );

        await cancelOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    it('should return 500 when database error occurs', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        cancelOrderUseCase.execute.mockRejectedValue(
            new Error('Database connection failed'),
        );

        await cancelOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });
});
