import RemoveItemFromOrderController from './RemoveItemFromOrder.js';

describe('RemoveItemFromOrderController', () => {
    const makeSut = () => {
        const removeItemFromOrderUseCase = {
            execute: jest.fn(),
        };
        const sut = new RemoveItemFromOrderController(
            removeItemFromOrderUseCase,
        );
        const reply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        return { sut, removeItemFromOrderUseCase, reply };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should remove item successfully', async () => {
        const { sut, removeItemFromOrderUseCase, reply } = makeSut();

        const mockOrderUpdated = {
            store_id: 'store-123',
            order_id: 'order-456',
            order: {
                items: [
                    {
                        code: 456,
                        quantity: 1,
                        price: 30.0,
                        total_price: 30.0,
                        name: 'Refrigerante',
                    },
                ],
            },
        };

        removeItemFromOrderUseCase.execute.mockResolvedValue(mockOrderUpdated);

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
        };

        await sut.handle(request, reply);

        expect(removeItemFromOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: 'b0c9e8a1-1234-4321-8765-123456789abc',
            code: 123,
        });
        expect(reply.status).toHaveBeenCalledWith(200);
        expect(reply.send).toHaveBeenCalledWith(mockOrderUpdated);
    });

    it('should convert code from string to number', async () => {
        const { sut, removeItemFromOrderUseCase, reply } = makeSut();

        const mockOrderUpdated = { store_id: 'store-123' };
        removeItemFromOrderUseCase.execute.mockResolvedValue(mockOrderUpdated);

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '789' },
        };

        await sut.handle(request, reply);

        expect(removeItemFromOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: 'b0c9e8a1-1234-4321-8765-123456789abc',
            code: 789,
        });
    });

    it('should return 400 when order is not found', async () => {
        const { sut, removeItemFromOrderUseCase, reply } = makeSut();

        removeItemFromOrderUseCase.execute.mockRejectedValue(
            new Error('Order not found'),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Order not found',
        });
    });

    it('should return 400 when item is not found', async () => {
        const { sut, removeItemFromOrderUseCase, reply } = makeSut();

        removeItemFromOrderUseCase.execute.mockRejectedValue(
            new Error('Item not found'),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '999' },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Item not found',
        });
    });

    it('should return 400 when order is not in DRAFT status', async () => {
        const { sut, removeItemFromOrderUseCase, reply } = makeSut();

        removeItemFromOrderUseCase.execute.mockRejectedValue(
            new Error(
                'Cannot remove items from order that is not in DRAFT status',
            ),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message:
                'Cannot remove items from order that is not in DRAFT status',
        });
    });

    it('should return 400 when orderId is invalid UUID', async () => {
        const { sut, removeItemFromOrderUseCase, reply } = makeSut();

        const request = {
            params: { id: 'invalid-uuid', code: '123' },
        };

        await sut.handle(request, reply);

        expect(removeItemFromOrderUseCase.execute).not.toHaveBeenCalled();
        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining(
                    'orderId must be a valid UUID',
                ),
            }),
        );
    });

    it('should return 400 when code is invalid', async () => {
        const { sut, removeItemFromOrderUseCase, reply } = makeSut();

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: 'abc' },
        };

        await sut.handle(request, reply);

        expect(removeItemFromOrderUseCase.execute).not.toHaveBeenCalled();
        expect(reply.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when code is negative', async () => {
        const { sut, removeItemFromOrderUseCase, reply } = makeSut();

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '-1' },
        };

        await sut.handle(request, reply);

        expect(removeItemFromOrderUseCase.execute).not.toHaveBeenCalled();
        expect(reply.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 when an unexpected error occurs', async () => {
        const { sut, removeItemFromOrderUseCase, reply } = makeSut();

        removeItemFromOrderUseCase.execute.mockRejectedValue(
            new Error('Unexpected error'),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
        };

        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.any(String),
            }),
        );
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
