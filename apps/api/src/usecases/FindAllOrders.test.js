import FindAllOrdersUseCase from './FindAllOrders.js';

describe('FindAllOrdersUseCase', () => {
    const makeSut = () => {
        const findAllOrdersRepository = {
            execute: jest.fn(),
        };
        const sut = new FindAllOrdersUseCase(findAllOrdersRepository);
        return { sut, findAllOrdersRepository };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all orders from repository', async () => {
        const { sut, findAllOrdersRepository } = makeSut();

        const mockOrders = [
            {
                store_id: 'store-1',
                order_id: 'order-1',
                order: { total_price: 100 },
            },
            {
                store_id: 'store-2',
                order_id: 'order-2',
                order: { total_price: 200 },
            },
        ];

        findAllOrdersRepository.execute.mockResolvedValue(mockOrders);

        const result = await sut.execute();

        expect(result).toEqual(mockOrders);
        expect(result).toHaveLength(2);
        expect(findAllOrdersRepository.execute).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when repository returns null', async () => {
        const { sut, findAllOrdersRepository } = makeSut();

        findAllOrdersRepository.execute.mockResolvedValue(null);

        const result = await sut.execute();

        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
        expect(findAllOrdersRepository.execute).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when repository returns undefined', async () => {
        const { sut, findAllOrdersRepository } = makeSut();

        findAllOrdersRepository.execute.mockResolvedValue(undefined);

        const result = await sut.execute();

        expect(result).toEqual([]);
        expect(findAllOrdersRepository.execute).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when repository returns empty array', async () => {
        const { sut, findAllOrdersRepository } = makeSut();

        findAllOrdersRepository.execute.mockResolvedValue([]);

        const result = await sut.execute();

        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
        expect(findAllOrdersRepository.execute).toHaveBeenCalledTimes(1);
    });

    it('should propagate error when repository throws', async () => {
        const { sut, findAllOrdersRepository } = makeSut();

        findAllOrdersRepository.execute.mockRejectedValue(
            new Error('Erro ao ler pedidos'),
        );

        await expect(sut.execute()).rejects.toThrow('Erro ao ler pedidos');
        expect(findAllOrdersRepository.execute).toHaveBeenCalledTimes(1);
    });
});
