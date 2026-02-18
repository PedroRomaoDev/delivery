import UpdateCustomerInOrderUseCase from './UpdateCustomerInOrder.js';

describe('UpdateCustomerInOrderUseCase', () => {
    const makeSut = () => {
        const findOrderByIdRepository = {
            execute: jest.fn(),
        };
        const updateOrderRepository = {
            execute: jest.fn(),
        };
        const sut = new UpdateCustomerInOrderUseCase(
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
            items: [],
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

    it('should update customer name successfully', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);
        updateOrderRepository.execute.mockImplementation((data) => data);

        const result = await sut.execute({
            orderId: 'order-456',
            updates: { name: 'Maria Santos' },
        });

        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'order-456',
        );
        expect(result.order.customer.name).toBe('Maria Santos');
        expect(result.order.customer.temporary_phone).toBe('11987654321');
        expect(updateOrderRepository.execute).toHaveBeenCalledTimes(1);
    });

    it('should update customer phone successfully', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);
        updateOrderRepository.execute.mockImplementation((data) => data);

        const result = await sut.execute({
            orderId: 'order-456',
            updates: { phone: '11999999999' },
        });

        expect(result.order.customer.name).toBe('João Silva');
        expect(result.order.customer.temporary_phone).toBe('11999999999');
    });

    it('should update both name and phone', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);
        updateOrderRepository.execute.mockImplementation((data) => data);

        const result = await sut.execute({
            orderId: 'order-456',
            updates: {
                name: 'Carlos Pereira',
                phone: '11888888888',
            },
        });

        expect(result.order.customer.name).toBe('Carlos Pereira');
        expect(result.order.customer.temporary_phone).toBe('11888888888');
    });

    it('should throw error when order is not found', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        findOrderByIdRepository.execute.mockResolvedValue(null);

        await expect(
            sut.execute({
                orderId: 'non-existent',
                updates: { name: 'Maria Santos' },
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
                updates: { name: 'Maria Santos' },
            }),
        ).rejects.toThrow(
            'Cannot update customer in order that is not in DRAFT status',
        );

        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when orderId is not provided', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        await expect(
            sut.execute({
                orderId: null,
                updates: { name: 'Maria Santos' },
            }),
        ).rejects.toThrow('orderId is required');

        expect(findOrderByIdRepository.execute).not.toHaveBeenCalled();
        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when updates is not provided', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        await expect(
            sut.execute({
                orderId: 'order-456',
                updates: null,
            }),
        ).rejects.toThrow('updates is required and must be an object');

        expect(findOrderByIdRepository.execute).not.toHaveBeenCalled();
        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when no field is provided', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);

        await expect(
            sut.execute({
                orderId: 'order-456',
                updates: {},
            }),
        ).rejects.toThrow(
            'At least one field (name or phone) must be provided',
        );

        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when name is empty', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);

        await expect(
            sut.execute({
                orderId: 'order-456',
                updates: { name: '' },
            }),
        ).rejects.toThrow('name must be a non-empty string');

        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when phone is empty', async () => {
        const { sut, findOrderByIdRepository, updateOrderRepository } =
            makeSut();

        const mockOrderData = createMockOrderData();
        findOrderByIdRepository.execute.mockResolvedValue(mockOrderData);

        await expect(
            sut.execute({
                orderId: 'order-456',
                updates: { phone: '   ' },
            }),
        ).rejects.toThrow('phone must be a non-empty string');

        expect(updateOrderRepository.execute).not.toHaveBeenCalled();
    });
});
