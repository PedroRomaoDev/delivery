import UpdateItemInOrderUseCase from './UpdateItemInOrder.js';

describe('UpdateItemInOrderUseCase', () => {
    const makeSut = () => {
        const findOrderByIdRepository = {
            execute: jest.fn(),
        };
        const updateOrderRepository = {
            execute: jest.fn(),
        };
        const sut = new UpdateItemInOrderUseCase(
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
                    price: 50.0,
                    observations: 'Original obs',
                    total_price: 100.0,
                    name: 'Pizza',
                    quantity: 2,
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

    it('should update item quantity successfully', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);
        updateOrderRepository.execute.mockImplementation((data) => data);

        const result = await sut.execute({
            orderId: 'order-456',
            code: 123,
            updates: { quantity: 5 },
        });

        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'order-456',
        );
        expect(result.order.items[0].quantity).toBe(5);
        expect(result.order.items[0].total_price).toBe(250.0);
        expect(updateOrderRepository.execute).toHaveBeenCalledTimes(1);
    });

    it('should update item observations successfully', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);
        updateOrderRepository.execute.mockImplementation((data) => data);

        const result = await sut.execute({
            orderId: 'order-456',
            code: 123,
            updates: { observations: 'New observations' },
        });

        expect(result.order.items[0].observations).toBe('New observations');
        expect(result.order.items[0].quantity).toBe(2); // unchanged
    });

    it('should update item name successfully', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);
        updateOrderRepository.execute.mockImplementation((data) => data);

        const result = await sut.execute({
            orderId: 'order-456',
            code: 123,
            updates: { name: 'Super Pizza' },
        });

        expect(result.order.items[0].name).toBe('Super Pizza');
    });

    it('should update multiple fields at once', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);
        updateOrderRepository.execute.mockImplementation((data) => data);

        const result = await sut.execute({
            orderId: 'order-456',
            code: 123,
            updates: {
                quantity: 3,
                name: 'Updated Pizza',
                observations: 'Extra cheese',
            },
        });

        expect(result.order.items[0].quantity).toBe(3);
        expect(result.order.items[0].total_price).toBe(150.0);
        expect(result.order.items[0].name).toBe('Updated Pizza');
        expect(result.order.items[0].observations).toBe('Extra cheese');
    });

    it('should throw error when order is not found', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        findOrderByIdRepository.execute.mockResolvedValue(null);

        await expect(
            sut.execute({
                orderId: 'non-existent',
                code: 123,
                updates: { quantity: 5 },
            }),
        ).rejects.toThrow('Order not found');

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
                code: 999, // item not found
                updates: { quantity: 5 },
            }),
        ).rejects.toThrow('Item not found');

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
                updates: { quantity: 5 },
            }),
        ).rejects.toThrow(
            'Cannot update items in order that is not in DRAFT status',
        );

        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when orderId is not provided', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        await expect(
            sut.execute({
                orderId: null,
                code: 123,
                updates: { quantity: 5 },
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
                updates: { quantity: 5 },
            }),
        ).rejects.toThrow('code is required');

        expect(findOrderByIdRepository.execute).not.toHaveBeenCalled();
        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when updates is not provided', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        await expect(
            sut.execute({
                orderId: 'order-456',
                code: 123,
                updates: null,
            }),
        ).rejects.toThrow('updates is required and must be an object');

        expect(findOrderByIdRepository.execute).not.toHaveBeenCalled();
        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when quantity is invalid', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);

        await expect(
            sut.execute({
                orderId: 'order-456',
                code: 123,
                updates: { quantity: 0 },
            }),
        ).rejects.toThrow('Quantity must be a number greater than 0');

        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });
});
