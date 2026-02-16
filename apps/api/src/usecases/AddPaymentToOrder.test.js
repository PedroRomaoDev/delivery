import AddPaymentToOrderUseCase from './AddPaymentToOrder.js';

describe('AddPaymentToOrderUseCase', () => {
    let findOrderByIdRepository;
    let addPaymentToOrderRepository;
    let addPaymentToOrderUseCase;

    beforeEach(() => {
        // Mock dos repositories
        findOrderByIdRepository = {
            execute: jest.fn(),
        };

        addPaymentToOrderRepository = {
            execute: jest.fn(),
        };

        addPaymentToOrderUseCase = new AddPaymentToOrderUseCase(
            findOrderByIdRepository,
            addPaymentToOrderRepository,
        );
    });

    it('should add payment to order in DRAFT status', async () => {
        const existingOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
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
                        observations: null,
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

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        addPaymentToOrderRepository.execute.mockResolvedValue({
            ...existingOrder,
            order: {
                ...existingOrder.order,
                payments: [
                    {
                        prepaid: true,
                        value: 100.0,
                        origin: 'PIX',
                    },
                ],
            },
        });

        const result = await addPaymentToOrderUseCase.execute({
            orderId: 'order-123',
            origin: 'PIX',
            prepaid: true,
        });

        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'order-123',
        );
        expect(addPaymentToOrderRepository.execute).toHaveBeenCalled();
        expect(result.order.payments).toHaveLength(1);
        expect(result.order.payments[0].origin).toBe('PIX');
        expect(result.order.payments[0].value).toBe(100.0);
    });

    it('should use default prepaid value when not provided', async () => {
        const existingOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
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
                        total_price: 50.0,
                        quantity: 1,
                        discount: 0,
                        condiments: [],
                    },
                ],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 50.0,
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        addPaymentToOrderRepository.execute.mockImplementation((order) =>
            Promise.resolve(order),
        );

        const result = await addPaymentToOrderUseCase.execute({
            orderId: 'order-123',
            origin: 'CASH',
        });

        expect(result.order.payments[0].prepaid).toBe(true);
    });

    it('should calculate payment value from order total', async () => {
        const existingOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                items: [
                    {
                        code: 123,
                        price: 30.0,
                        total_price: 60.0,
                        quantity: 2,
                        discount: 0,
                        condiments: [],
                    },
                    {
                        code: 456,
                        price: 20.0,
                        total_price: 20.0,
                        quantity: 1,
                        discount: 0,
                        condiments: [],
                    },
                ],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 80.0,
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        addPaymentToOrderRepository.execute.mockImplementation((order) =>
            Promise.resolve(order),
        );

        const result = await addPaymentToOrderUseCase.execute({
            orderId: 'order-123',
            origin: 'CREDIT_CARD',
            prepaid: true,
        });

        expect(result.order.payments[0].value).toBe(80.0);
    });

    it('should throw error when order is not found', async () => {
        findOrderByIdRepository.execute.mockResolvedValue(null);

        await expect(
            addPaymentToOrderUseCase.execute({
                orderId: 'non-existent',
                origin: 'PIX',
            }),
        ).rejects.toThrow('Order not found');
    });

    it('should throw error when order is not in DRAFT status', async () => {
        const confirmedOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'CONFIRMED',
                items: [
                    {
                        code: 123,
                        price: 50.0,
                        total_price: 50.0,
                        quantity: 1,
                        discount: 0,
                        condiments: [],
                    },
                ],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 50.0,
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(confirmedOrder);

        await expect(
            addPaymentToOrderUseCase.execute({
                orderId: 'order-123',
                origin: 'PIX',
            }),
        ).rejects.toThrow(
            'Cannot add payments to order that is not in DRAFT status',
        );
    });

    it('should throw error when orderId is missing', async () => {
        await expect(
            addPaymentToOrderUseCase.execute({
                origin: 'PIX',
            }),
        ).rejects.toThrow('orderId and origin are required');
    });

    it('should throw error when origin is missing', async () => {
        await expect(
            addPaymentToOrderUseCase.execute({
                orderId: 'order-123',
            }),
        ).rejects.toThrow('orderId and origin are required');
    });

    it('should throw error when order has no items', async () => {
        const emptyOrder = {
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

        findOrderByIdRepository.execute.mockResolvedValue(emptyOrder);

        await expect(
            addPaymentToOrderUseCase.execute({
                orderId: 'order-123',
                origin: 'PIX',
            }),
        ).rejects.toThrow('Order must have items before adding payment');
    });

    it('should throw error when order already has a payment', async () => {
        const orderWithPayment = {
            store_id: 'store-123',
            order_id: 'order-123',
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
                        total_price: 50.0,
                        quantity: 1,
                        discount: 0,
                        condiments: [],
                    },
                ],
                payments: [
                    {
                        prepaid: true,
                        value: 50.0,
                        origin: 'PIX',
                    },
                ],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 50.0,
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(orderWithPayment);

        await expect(
            addPaymentToOrderUseCase.execute({
                orderId: 'order-123',
                origin: 'CREDIT_CARD',
            }),
        ).rejects.toThrow(
            'Order already has a payment. Only one payment is allowed per order',
        );
    });

    it('should call repository with updated order data', async () => {
        const existingOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
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
                        total_price: 50.0,
                        quantity: 1,
                        discount: 0,
                        condiments: [],
                    },
                ],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 50.0,
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        addPaymentToOrderRepository.execute.mockImplementation((order) =>
            Promise.resolve(order),
        );

        await addPaymentToOrderUseCase.execute({
            orderId: 'order-123',
            origin: 'VR',
            prepaid: false,
        });

        expect(addPaymentToOrderRepository.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                store_id: 'store-123',
                order_id: 'order-123',
                order: expect.objectContaining({
                    payments: expect.arrayContaining([
                        expect.objectContaining({
                            origin: 'VR',
                            value: 50.0,
                            prepaid: false,
                        }),
                    ]),
                }),
            }),
        );
    });
});
