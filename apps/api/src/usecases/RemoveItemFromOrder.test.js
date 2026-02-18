import RemoveItemFromOrderUseCase from './RemoveItemFromOrder.js';

describe('RemoveItemFromOrderUseCase', () => {
    const makeSut = () => {
        const findOrderByIdRepository = {
            execute: jest.fn(),
        };
        const updateOrderRepository = {
            execute: jest.fn(),
        };
        const sut = new RemoveItemFromOrderUseCase(
            findOrderByIdRepository,
            updateOrderRepository,
        );
        return { sut, findOrderByIdRepository, updateOrderRepository };
    };

    const createMockOrderData = () => ({
        store_id: 'store-123',
        order_id: 'order-456',
        order: {
            payments: [],
            last_status_name: 'DRAFT',
            store: {
                name: 'Test Store',
                id: 'store-123',
            },
            total_price: 0,
            items: [
                {
                    code: 123,
                    quantity: 2,
                    price: 50.0,
                    total_price: 100.0,
                    name: 'Pizza',
                    observations: null,
                    discount: 0,
                    condiments: [],
                },
                {
                    code: 456,
                    quantity: 1,
                    price: 30.0,
                    total_price: 30.0,
                    name: 'Refrigerante',
                    observations: null,
                    discount: 0,
                    condiments: [],
                },
            ],
            created_at: Date.now(),
            statuses: [
                {
                    name: 'DRAFT',
                    created_at: Date.now(),
                    origin: 'CUSTOMER',
                },
            ],
            customer: {
                temporary_phone: '11987654321',
                name: 'João Silva',
            },
            delivery_address: null,
        },
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should remove item from order successfully', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);
        updateOrderRepository.execute.mockImplementation((data) => data);

        const result = await sut.execute({
            orderId: 'order-456',
            code: 123,
        });

        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'order-456',
        );
        expect(result.order.items).toHaveLength(1);
        expect(result.order.items[0].code).toBe(456);
        expect(updateOrderRepository.execute).toHaveBeenCalledTimes(1);
    });

    it('should remove the correct item when multiple exist', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        mockOrderData.order.items.push({
            code: 789,
            quantity: 3,
            price: 20.0,
            total_price: 60.0,
            name: 'Sobremesa',
            observations: null,
            discount: 0,
            condiments: [],
        });

        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);
        updateOrderRepository.execute.mockImplementation((data) => data);

        const result = await sut.execute({
            orderId: 'order-456',
            code: 456,
        });

        expect(result.order.items).toHaveLength(2);
        expect(
            result.order.items.find((item) => item.code === 123),
        ).toBeDefined();
        expect(
            result.order.items.find((item) => item.code === 789),
        ).toBeDefined();
        expect(
            result.order.items.find((item) => item.code === 456),
        ).toBeUndefined();
    });

    it('should remove last remaining item', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        mockOrderData.order.items = [
            {
                code: 123,
                quantity: 1,
                price: 50.0,
                total_price: 50.0,
                name: 'Pizza',
                observations: null,
                discount: 0,
                condiments: [],
            },
        ];

        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);
        updateOrderRepository.execute.mockImplementation((data) => data);

        const result = await sut.execute({
            orderId: 'order-456',
            code: 123,
        });

        expect(result.order.items).toHaveLength(0);
    });

    it('should throw error when order is not found', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        findOrderByIdRepository.execute.mockResolvedValue(null);

        await expect(
            sut.execute({
                orderId: 'non-existent',
                code: 123,
            }),
        ).rejects.toThrow('Order not found');

        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when order is not in DRAFT status', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        mockOrderData.order.last_status_name = 'RECEIVED';
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);

        await expect(
            sut.execute({
                orderId: 'order-456',
                code: 123,
            }),
        ).rejects.toThrow(
            'Cannot remove items from order that is not in DRAFT status',
        );

        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when item is not found', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);

        await expect(
            sut.execute({
                orderId: 'order-456',
                code: 999,
            }),
        ).rejects.toThrow('Item not found');

        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when orderId is not provided', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        await expect(
            sut.execute({
                orderId: null,
                code: 123,
            }),
        ).rejects.toThrow('orderId is required');

        expect(findOrderByIdRepository.execute).not.toHaveBeenCalled();
        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when code is not provided', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        await expect(
            sut.execute({
                orderId: 'order-456',
                code: null,
            }),
        ).rejects.toThrow('code is required');

        expect(findOrderByIdRepository.execute).not.toHaveBeenCalled();
        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });
});
