import AddPaymentToOrderController from './AddPaymentToOrder.js';

describe('AddPaymentToOrderController', () => {
    let addPaymentToOrderUseCase;
    let addPaymentToOrderController;
    let request;
    let reply;

    beforeEach(() => {
        addPaymentToOrderUseCase = {
            execute: jest.fn(),
        };

        addPaymentToOrderController = new AddPaymentToOrderController(
            addPaymentToOrderUseCase,
        );

        request = {
            params: { id: '123e4567-e89b-12d3-a456-426614174000' },
            body: {
                origin: 'CREDIT_CARD',
                prepaid: true,
            },
        };

        reply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    it('should add payment to order successfully', async () => {
        const mockOrder = {
            store_id: 'store-123',
            order_id: '123e4567-e89b-12d3-a456-426614174000',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                items: [],
                payments: [
                    {
                        prepaid: true,
                        value: 89.9,
                        origin: 'CREDIT_CARD',
                    },
                ],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 0,
            },
        };

        addPaymentToOrderUseCase.execute.mockResolvedValue(mockOrder);

        await addPaymentToOrderController.handle(request, reply);

        expect(addPaymentToOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: '123e4567-e89b-12d3-a456-426614174000',
            origin: 'CREDIT_CARD',
            prepaid: true,
        });
        expect(reply.status).toHaveBeenCalledWith(200);
        expect(reply.send).toHaveBeenCalledWith(mockOrder);
    });

    it('should return 400 when origin is missing', async () => {
        request.body.origin = undefined;

        await addPaymentToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: expect.stringContaining('origin'),
            errors: expect.arrayContaining([
                expect.objectContaining({
                    field: 'origin',
                }),
            ]),
        });
    });

    it('should return 400 when order is not found', async () => {
        addPaymentToOrderUseCase.execute.mockRejectedValue(
            new Error('Order not found'),
        );

        await addPaymentToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Order not found',
        });
    });

    it('should return 400 when order is not in DRAFT status', async () => {
        addPaymentToOrderUseCase.execute.mockRejectedValue(
            new Error(
                'Cannot add payments to order that is not in DRAFT status',
            ),
        );

        await addPaymentToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Cannot add payments to order that is not in DRAFT status',
        });
    });

    it('should return 400 when order already has a payment', async () => {
        addPaymentToOrderUseCase.execute.mockRejectedValue(
            new Error(
                'Order already has a payment. Only one payment is allowed per order',
            ),
        );

        await addPaymentToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message:
                'Order already has a payment. Only one payment is allowed per order',
        });
    });

    it('should return 500 on unexpected errors', async () => {
        addPaymentToOrderUseCase.execute.mockRejectedValue(
            new Error('Unexpected error'),
        );

        await addPaymentToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });

    it('should use default prepaid value (true) when not provided', async () => {
        request.body.prepaid = undefined;

        const mockOrder = {
            store_id: 'store-123',
            order_id: '123e4567-e89b-12d3-a456-426614174000',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                items: [],
                payments: [
                    {
                        prepaid: true,
                        value: 89.9,
                        origin: 'CREDIT_CARD',
                    },
                ],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 0,
            },
        };

        addPaymentToOrderUseCase.execute.mockResolvedValue(mockOrder);

        await addPaymentToOrderController.handle(request, reply);

        expect(addPaymentToOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: '123e4567-e89b-12d3-a456-426614174000',
            origin: 'CREDIT_CARD',
            prepaid: true,
        });
        expect(reply.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when orderId param is missing', async () => {
        request.params.id = undefined;

        await addPaymentToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: expect.any(String),
            errors: expect.any(Array),
        });
    });

    it('should return 400 when origin is invalid and show available options', async () => {
        request.body.origin = 'CREDITO';

        await addPaymentToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        const sendCall = reply.send.mock.calls[0][0];
        expect(sendCall.message).toContain('origin');
        expect(sendCall.errors[0].message).toContain('CREDIT_CARD');
        expect(sendCall.errors[0].message).toContain('DEBIT_CARD');
        expect(sendCall.errors[0].message).toContain('CASH');
        expect(sendCall.errors[0].message).toContain('PIX');
        expect(sendCall.errors[0].message).toContain('VR');
    });

    it('should return 400 when prepaid is not a boolean', async () => {
        request.body.prepaid = 'true'; // string instead of boolean

        await addPaymentToOrderController.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        const sendCall = reply.send.mock.calls[0][0];
        expect(sendCall.message).toContain('prepaid');
        expect(sendCall.errors[0].message).toContain('boolean');
    });

    it('should accept all valid payment origins', async () => {
        const validOrigins = ['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'PIX', 'VR'];

        for (const origin of validOrigins) {
            // Limpar mocks entre iterações
            jest.clearAllMocks();

            request.body.origin = origin;

            const mockOrder = {
                store_id: 'store-123',
                order_id: '123e4567-e89b-12d3-a456-426614174000',
                order: {
                    customer: {
                        temporary_phone: '11987654321',
                        name: 'João Silva',
                    },
                    last_status_name: 'DRAFT',
                    items: [],
                    payments: [
                        {
                            prepaid: true,
                            value: 89.9,
                            origin: origin,
                        },
                    ],
                    delivery_address: null,
                    created_at: 1770842000000,
                    total_price: 0,
                },
            };

            addPaymentToOrderUseCase.execute.mockResolvedValue(mockOrder);

            await addPaymentToOrderController.handle(request, reply);

            expect(addPaymentToOrderUseCase.execute).toHaveBeenCalledWith({
                orderId: '123e4567-e89b-12d3-a456-426614174000',
                origin: origin,
                prepaid: true,
            });
            expect(reply.status).toHaveBeenCalledWith(200);
        }
    });
});
