import FindAllOrdersController from './FindAllOrders.js';

describe('FindAllOrdersController', () => {
    const makeSut = () => {
        const findAllOrdersUseCase = {
            execute: jest.fn(),
        };
        const sut = new FindAllOrdersController(findAllOrdersUseCase);
        return { sut, findAllOrdersUseCase };
    };

    const makeReply = () => ({
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and all orders on success', async () => {
        const { sut, findAllOrdersUseCase } = makeSut();
        const reply = makeReply();
        const request = {};

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

        findAllOrdersUseCase.execute.mockResolvedValue(mockOrders);

        await sut.execute(request, reply);

        expect(findAllOrdersUseCase.execute).toHaveBeenCalledTimes(1);
        expect(reply.status).toHaveBeenCalledWith(200);
        expect(reply.send).toHaveBeenCalledWith(mockOrders);
    });

    it('should return 200 and empty array when no orders exist', async () => {
        const { sut, findAllOrdersUseCase } = makeSut();
        const reply = makeReply();
        const request = {};

        findAllOrdersUseCase.execute.mockResolvedValue([]);

        await sut.execute(request, reply);

        expect(findAllOrdersUseCase.execute).toHaveBeenCalledTimes(1);
        expect(reply.status).toHaveBeenCalledWith(200);
        expect(reply.send).toHaveBeenCalledWith([]);
    });

    it('should return 500 when useCase throws error', async () => {
        const { sut, findAllOrdersUseCase } = makeSut();
        const reply = makeReply();
        const request = {};

        findAllOrdersUseCase.execute.mockRejectedValue(
            new Error('Erro ao ler pedidos'),
        );

        await sut.execute(request, reply);

        expect(findAllOrdersUseCase.execute).toHaveBeenCalledTimes(1);
        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });

    it('should return 500 when unexpected error occurs', async () => {
        const { sut, findAllOrdersUseCase } = makeSut();
        const reply = makeReply();
        const request = {};

        findAllOrdersUseCase.execute.mockRejectedValue(
            new Error('Unexpected error'),
        );

        await sut.execute(request, reply);

        expect(findAllOrdersUseCase.execute).toHaveBeenCalledTimes(1);
        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });
});
