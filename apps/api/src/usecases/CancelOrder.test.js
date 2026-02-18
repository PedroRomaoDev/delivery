import CancelOrderUseCase from './CancelOrder.js';

describe('CancelOrderUseCase', () => {
    let findOrderByIdRepository;
    let updateOrderRepository;
    let cancelOrderUseCase;

    beforeEach(() => {
        // Mock dos repositories
        findOrderByIdRepository = {
            execute: jest.fn(),
        };

        updateOrderRepository = {
            execute: jest.fn(),
        };

        cancelOrderUseCase = new CancelOrderUseCase(
            findOrderByIdRepository,
            updateOrderRepository,
        );
    });

    it('should cancel an order in DRAFT status', async () => {
        const existingOrder = {
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
                statuses: [
                    {
                        name: 'DRAFT',
                        created_at: 1770842000000,
                        origin: 'CUSTOMER',
                    },
                ],
            },
        };

        const canceledOrder = {
            ...existingOrder,
            order: {
                ...existingOrder.order,
                last_status_name: 'CANCELED',
                statuses: [
                    ...existingOrder.order.statuses,
                    {
                        name: 'CANCELED',
                        created_at: expect.any(Number),
                        origin: 'STORE',
                    },
                ],
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        updateOrderRepository.execute.mockResolvedValue(canceledOrder);

        const result = await cancelOrderUseCase.execute({
            orderId: 'order-123',
        });

        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'order-123',
        );
        expect(updateOrderRepository.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                order_id: 'order-123',
                order: expect.objectContaining({
                    last_status_name: 'CANCELED',
                    statuses: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'CANCELED',
                            origin: 'STORE',
                        }),
                    ]),
                }),
            }),
        );
        expect(result.order.last_status_name).toBe('CANCELED');
        expect(result.order.statuses).toHaveLength(2);
    });

    it('should cancel an order in RECEIVED status', async () => {
        const existingOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'RECEIVED',
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
                ],
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        updateOrderRepository.execute.mockImplementation((data) => data);

        const result = await cancelOrderUseCase.execute({
            orderId: 'order-123',
        });

        expect(result.order.last_status_name).toBe('CANCELED');
        expect(result.order.statuses).toHaveLength(3);
    });

    it('should cancel an order in CONFIRMED status', async () => {
        const existingOrder = {
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
                        observations: null,
                        total_price: 100.0,
                        name: 'Test Product',
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
                        name: 'CONFIRMED',
                        created_at: 1770842200000,
                        origin: 'STORE',
                    },
                ],
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        updateOrderRepository.execute.mockImplementation((data) => data);

        const result = await cancelOrderUseCase.execute({
            orderId: 'order-123',
        });

        expect(result.order.last_status_name).toBe('CANCELED');
        expect(result.order.statuses).toHaveLength(4);
    });

    it('should throw error when orderId is not provided', async () => {
        await expect(cancelOrderUseCase.execute({})).rejects.toThrow(
            'orderId is required',
        );

        expect(findOrderByIdRepository.execute).not.toHaveBeenCalled();
        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when order is not found', async () => {
        findOrderByIdRepository.execute.mockResolvedValue(null);

        await expect(
            cancelOrderUseCase.execute({ orderId: 'non-existent-order' }),
        ).rejects.toThrow('Order not found');

        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'non-existent-order',
        );
        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when order is in DISPATCHED status', async () => {
        const existingOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DISPATCHED',
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
                        name: 'CONFIRMED',
                        created_at: 1770842200000,
                        origin: 'STORE',
                    },
                    {
                        name: 'DISPATCHED',
                        created_at: 1770842300000,
                        origin: 'STORE',
                    },
                ],
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);

        await expect(
            cancelOrderUseCase.execute({ orderId: 'order-123' }),
        ).rejects.toThrow(
            'Only orders in DRAFT, RECEIVED, or CONFIRMED status can be canceled',
        );

        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'order-123',
        );
        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when repository fails', async () => {
        const existingOrder = {
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
                statuses: [
                    {
                        name: 'DRAFT',
                        created_at: 1770842000000,
                        origin: 'CUSTOMER',
                    },
                ],
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        updateOrderRepository.execute.mockRejectedValue(
            new Error('Database error'),
        );

        await expect(
            cancelOrderUseCase.execute({ orderId: 'order-123' }),
        ).rejects.toThrow('Database error');

        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'order-123',
        );
        expect(updateOrderRepository.execute).toHaveBeenCalled();
    });
});
