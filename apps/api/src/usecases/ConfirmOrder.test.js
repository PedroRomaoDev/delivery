import ConfirmOrderUseCase from './ConfirmOrder.js';

describe('ConfirmOrderUseCase', () => {
    let findOrderByIdRepository;
    let updateOrderRepository;
    let confirmOrderUseCase;

    beforeEach(() => {
        // Mock dos repositories
        findOrderByIdRepository = {
            execute: jest.fn(),
        };

        updateOrderRepository = {
            execute: jest.fn(),
        };

        confirmOrderUseCase = new ConfirmOrderUseCase(
            findOrderByIdRepository,
            updateOrderRepository,
        );
    });

    it('should confirm an order in RECEIVED status', async () => {
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
                        description: 'DRAFT',
                        date: 1770842000000,
                        origin: 'CUSTOMER',
                    },
                    {
                        description: 'RECEIVED',
                        date: 1770842100000,
                        origin: 'CUSTOMER',
                    },
                ],
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        updateOrderRepository.execute.mockResolvedValue({
            ...existingOrder,
            order: {
                ...existingOrder.order,
                last_status_name: 'CONFIRMED',
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
                        date: expect.any(Number),
                        origin: 'STORE',
                    },
                ],
            },
        });

        const result = await confirmOrderUseCase.execute({
            orderId: 'order-123',
        });

        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'order-123',
        );
        expect(updateOrderRepository.execute).toHaveBeenCalled();
        expect(result.order.last_status_name).toBe('CONFIRMED');
        expect(result.order.statuses).toHaveLength(3);
        expect(result.order.statuses[2].description).toBe('CONFIRMED');
        expect(result.order.statuses[2].origin).toBe('STORE');
    });

    it('should throw error when orderId is not provided', async () => {
        await expect(confirmOrderUseCase.execute({})).rejects.toThrow(
            'orderId is required',
        );
    });

    it('should throw error when order is not found', async () => {
        findOrderByIdRepository.execute.mockResolvedValue(null);

        await expect(
            confirmOrderUseCase.execute({ orderId: 'order-123' }),
        ).rejects.toThrow('Order not found');
    });

    it('should throw error when order is not in RECEIVED status', async () => {
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
                ],
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);

        await expect(
            confirmOrderUseCase.execute({ orderId: 'order-123' }),
        ).rejects.toThrow('Only orders in RECEIVED status can be confirmed');
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
                        description: 'DRAFT',
                        date: 1770842000000,
                        origin: 'CUSTOMER',
                    },
                    {
                        description: 'RECEIVED',
                        date: 1770842100000,
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
            confirmOrderUseCase.execute({ orderId: 'order-123' }),
        ).rejects.toThrow('Database error');
    });
});
