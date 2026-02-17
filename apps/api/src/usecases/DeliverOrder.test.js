import DeliverOrderUseCase from './DeliverOrder.js';

describe('DeliverOrderUseCase', () => {
    let findOrderByIdRepository;
    let updateOrderRepository;
    let deliverOrderUseCase;

    beforeEach(() => {
        // Mock dos repositories
        findOrderByIdRepository = {
            execute: jest.fn(),
        };

        updateOrderRepository = {
            execute: jest.fn(),
        };

        deliverOrderUseCase = new DeliverOrderUseCase(
            findOrderByIdRepository,
            updateOrderRepository,
        );
    });

    it('should deliver an order in DISPATCHED status', async () => {
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
                ],
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        updateOrderRepository.execute.mockResolvedValue({
            ...existingOrder,
            order: {
                ...existingOrder.order,
                last_status_name: 'DELIVERED',
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
                        date: expect.any(Number),
                        origin: 'STORE',
                    },
                ],
            },
        });

        const result = await deliverOrderUseCase.execute({
            orderId: 'order-123',
        });

        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'order-123',
        );
        expect(updateOrderRepository.execute).toHaveBeenCalled();
        expect(result.order.last_status_name).toBe('DELIVERED');
        expect(result.order.statuses).toHaveLength(5);
        expect(result.order.statuses[4].description).toBe('DELIVERED');
        expect(result.order.statuses[4].origin).toBe('STORE');
    });

    it('should throw error when orderId is not provided', async () => {
        await expect(deliverOrderUseCase.execute({})).rejects.toThrow(
            'orderId is required',
        );
    });

    it('should throw error when order is not found', async () => {
        findOrderByIdRepository.execute.mockResolvedValue(null);

        await expect(
            deliverOrderUseCase.execute({ orderId: 'order-123' }),
        ).rejects.toThrow('Order not found');
    });

    it('should throw error when order is not in DISPATCHED status', async () => {
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
                ],
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);

        await expect(
            deliverOrderUseCase.execute({ orderId: 'order-123' }),
        ).rejects.toThrow('Only orders in DISPATCHED status can be delivered');
    });

    it('should propagate repository errors', async () => {
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
                ],
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        updateOrderRepository.execute.mockRejectedValue(
            new Error('Database error'),
        );

        await expect(
            deliverOrderUseCase.execute({ orderId: 'order-123' }),
        ).rejects.toThrow('Database error');
    });
});
