import AddItemToOrderUseCase from './AddItemToOrder.js';

describe('AddItemToOrderUseCase', () => {
    let findOrderByIdRepository;
    let addItemToOrderRepository;
    let addItemToOrderUseCase;

    beforeEach(() => {
        // Mock dos repositories
        findOrderByIdRepository = {
            execute: jest.fn(),
        };

        addItemToOrderRepository = {
            execute: jest.fn(),
        };

        addItemToOrderUseCase = new AddItemToOrderUseCase(
            findOrderByIdRepository,
            addItemToOrderRepository,
        );
    });

    it('should add item to order in DRAFT status', async () => {
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
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        addItemToOrderRepository.execute.mockResolvedValue({
            ...existingOrder,
            order: {
                ...existingOrder.order,
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
                total_price: 100.0,
            },
        });

        const result = await addItemToOrderUseCase.execute({
            orderId: 'order-123',
            code: 123,
            quantity: 2,
            observations: null,
            name: 'Test Product',
        });

        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'order-123',
        );
        expect(addItemToOrderRepository.execute).toHaveBeenCalled();
        expect(result.order.items).toHaveLength(1);
        expect(result.order.items[0].code).toBe(123);
    });

    it('should throw error when order is not found', async () => {
        findOrderByIdRepository.execute.mockResolvedValue(null);

        await expect(
            addItemToOrderUseCase.execute({
                orderId: 'non-existent',
                code: 123,
                quantity: 1,
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
                items: [],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 0,
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(confirmedOrder);

        await expect(
            addItemToOrderUseCase.execute({
                orderId: 'order-123',
                code: 123,
                quantity: 1,
            }),
        ).rejects.toThrow(
            'Cannot add items to order that is not in DRAFT status',
        );
    });

    it('should throw error when orderId is missing', async () => {
        await expect(
            addItemToOrderUseCase.execute({
                code: 123,
                quantity: 1,
            }),
        ).rejects.toThrow('orderId, code and quantity are required');
    });

    it('should throw error when code is missing', async () => {
        await expect(
            addItemToOrderUseCase.execute({
                orderId: 'order-123',
                quantity: 1,
            }),
        ).rejects.toThrow('orderId, code and quantity are required');
    });

    it('should throw error when quantity is missing', async () => {
        await expect(
            addItemToOrderUseCase.execute({
                orderId: 'order-123',
                code: 123,
            }),
        ).rejects.toThrow('orderId, code and quantity are required');
    });

    it('should throw error when quantity is zero or negative', async () => {
        await expect(
            addItemToOrderUseCase.execute({
                orderId: 'order-123',
                code: 123,
                quantity: 0,
            }),
        ).rejects.toThrow('quantity must be greater than 0');

        await expect(
            addItemToOrderUseCase.execute({
                orderId: 'order-123',
                code: 123,
                quantity: -1,
            }),
        ).rejects.toThrow('quantity must be greater than 0');
    });

    it('should generate random price for the item', async () => {
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
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(existingOrder);
        addItemToOrderRepository.execute.mockImplementation((data) =>
            Promise.resolve(data),
        );

        const result = await addItemToOrderUseCase.execute({
            orderId: 'order-123',
            code: 123,
            quantity: 1,
        });

        // Verifica se o preço foi gerado (deve estar entre 10 e 200)
        expect(result.order.items[0].price).toBeGreaterThanOrEqual(10.0);
        expect(result.order.items[0].price).toBeLessThanOrEqual(200.0);
    });
});
