import GetOrderByIdUseCase from './GetOrderById.js';

describe('GetOrderByIdUseCase', () => {
    const makeSut = () => {
        const findOrderByIdRepository = {
            execute: jest.fn(),
        };
        const sut = new GetOrderByIdUseCase(findOrderByIdRepository);
        return { sut, findOrderByIdRepository };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return order when found', async () => {
        const { sut, findOrderByIdRepository } = makeSut();

        const mockOrder = {
            store_id: 'store-123',
            order_id: 'order-456',
            order: {
                total_price: 150,
                items: [{ code: 1, name: 'Pizza', quantity: 1, price: 150 }],
                customer: { name: 'John Doe', phone: '123456789' },
                statuses: [
                    {
                        name: 'DRAFT',
                        created_at: new Date(),
                        origin: 'CUSTOMER',
                    },
                ],
                last_status_name: 'DRAFT',
            },
        };

        findOrderByIdRepository.execute.mockResolvedValue(mockOrder);

        const result = await sut.execute('order-456');

        expect(result).toEqual(mockOrder);
        expect(findOrderByIdRepository.execute).toHaveBeenCalledTimes(1);
        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'order-456',
        );
    });

    it('should throw error when order not found', async () => {
        const { sut, findOrderByIdRepository } = makeSut();

        findOrderByIdRepository.execute.mockResolvedValue(null);

        await expect(sut.execute('non-existent-id')).rejects.toThrow(
            'Order not found',
        );
        expect(findOrderByIdRepository.execute).toHaveBeenCalledTimes(1);
        expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
            'non-existent-id',
        );
    });

    it('should throw error when orderId is not provided', async () => {
        const { sut, findOrderByIdRepository } = makeSut();

        await expect(sut.execute()).rejects.toThrow('orderId is required');
        expect(findOrderByIdRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when orderId is null', async () => {
        const { sut, findOrderByIdRepository } = makeSut();

        await expect(sut.execute(null)).rejects.toThrow('orderId is required');
        expect(findOrderByIdRepository.execute).not.toHaveBeenCalled();
    });

    it('should throw error when orderId is empty string', async () => {
        const { sut, findOrderByIdRepository } = makeSut();

        await expect(sut.execute('')).rejects.toThrow('orderId is required');
        expect(findOrderByIdRepository.execute).not.toHaveBeenCalled();
    });

    it('should propagate error when repository throws', async () => {
        const { sut, findOrderByIdRepository } = makeSut();

        findOrderByIdRepository.execute.mockRejectedValue(
            new Error('Database connection error'),
        );

        await expect(sut.execute('order-123')).rejects.toThrow(
            'Database connection error',
        );
        expect(findOrderByIdRepository.execute).toHaveBeenCalledTimes(1);
    });
});
