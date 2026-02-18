import UpdateItemInOrderController from './UpdateItemInOrder.js';

describe('UpdateItemInOrderController', () => {
    const makeSut = () => {
        const updateItemInOrderUseCase = {
            execute: jest.fn(),
        };
        const sut = new UpdateItemInOrderController(updateItemInOrderUseCase);
        const reply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        return { sut, updateItemInOrderUseCase, reply };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update item quantity successfully', async () => {
        const { sut, updateItemInOrderUseCase, reply } = makeSut();

        const mockOrderUpdated = {
            store_id: 'store-123',
            order_id: 'order-456',
            order: {
                items: [
                    {
                        code: 123,
                        quantity: 5,
                        price: 50.0,
                        total_price: 250.0,
                        name: 'Pizza',
                    },
                ],
            },
        };

        updateItemInOrderUseCase.execute.mockResolvedValue(mockOrderUpdated);

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
            body: { quantity: 5 },
        };

        await sut.handle(request, reply);

        expect(updateItemInOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: 'b0c9e8a1-1234-4321-8765-123456789abc',
            code: 123,
            updates: { quantity: 5 },
        });
        expect(reply.status).toHaveBeenCalledWith(200);
        expect(reply.send).toHaveBeenCalledWith(mockOrderUpdated);
    });

    it('should update item observations successfully', async () => {
        const { sut, updateItemInOrderUseCase, reply } = makeSut();

        const mockOrderUpdated = {
            store_id: 'store-123',
            order_id: 'order-456',
            order: {
                items: [
                    {
                        code: 123,
                        observations: 'Extra cheese',
                    },
                ],
            },
        };

        updateItemInOrderUseCase.execute.mockResolvedValue(mockOrderUpdated);

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
            body: { observations: 'Extra cheese' },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(200);
    });

    it('should update multiple fields at once', async () => {
        const { sut, updateItemInOrderUseCase, reply } = makeSut();

        const mockOrderUpdated = { store_id: 'store-123' };
        updateItemInOrderUseCase.execute.mockResolvedValue(mockOrderUpdated);

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
            body: {
                quantity: 3,
                name: 'Updated Pizza',
                observations: 'No onions',
            },
        };

        await sut.handle(request, reply);

        expect(updateItemInOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: 'b0c9e8a1-1234-4321-8765-123456789abc',
            code: 123,
            updates: {
                quantity: 3,
                name: 'Updated Pizza',
                observations: 'No onions',
            },
        });
        expect(reply.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when order is not found', async () => {
        const { sut, updateItemInOrderUseCase, reply } = makeSut();

        updateItemInOrderUseCase.execute.mockRejectedValue(
            new Error('Order not found'),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
            body: { quantity: 5 },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Order not found',
        });
    });

    it('should return 400 when item is not found', async () => {
        const { sut, updateItemInOrderUseCase, reply } = makeSut();

        updateItemInOrderUseCase.execute.mockRejectedValue(
            new Error('Item not found'),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '999' },
            body: { quantity: 5 },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Item not found',
        });
    });

    it('should return 400 when order is not in DRAFT status', async () => {
        const { sut, updateItemInOrderUseCase, reply } = makeSut();

        updateItemInOrderUseCase.execute.mockRejectedValue(
            new Error(
                'Cannot update items in order that is not in DRAFT status',
            ),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
            body: { quantity: 5 },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Cannot update items in order that is not in DRAFT status',
        });
    });

    it('should return 400 when orderId is invalid UUID', async () => {
        const { sut, updateItemInOrderUseCase, reply } = makeSut();

        const request = {
            params: { id: 'invalid-uuid', code: '123' },
            body: { quantity: 5 },
        };

        await sut.handle(request, reply);

        expect(updateItemInOrderUseCase.execute).not.toHaveBeenCalled();
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
        const { sut, updateItemInOrderUseCase, reply } = makeSut();

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: 'abc' },
            body: { quantity: 5 },
        };

        await sut.handle(request, reply);

        expect(updateItemInOrderUseCase.execute).not.toHaveBeenCalled();
        expect(reply.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when body is empty', async () => {
        const { sut, updateItemInOrderUseCase, reply } = makeSut();

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
            body: {},
        };

        await sut.handle(request, reply);

        expect(updateItemInOrderUseCase.execute).not.toHaveBeenCalled();
        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining(
                    'At least one field must be provided',
                ),
            }),
        );
    });

    it('should return 400 when quantity is invalid', async () => {
        const { sut, updateItemInOrderUseCase, reply } = makeSut();

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
            body: { quantity: 0 },
        };

        await sut.handle(request, reply);

        expect(updateItemInOrderUseCase.execute).not.toHaveBeenCalled();
        expect(reply.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 when use case throws unexpected error', async () => {
        const { sut, updateItemInOrderUseCase, reply } = makeSut();

        updateItemInOrderUseCase.execute.mockRejectedValue(
            new Error('Database connection error'),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
            body: { quantity: 5 },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });

    it('should log error when unexpected error occurs', async () => {
        const { sut, updateItemInOrderUseCase, reply } = makeSut();
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        const error = new Error('Unexpected error');
        updateItemInOrderUseCase.execute.mockRejectedValue(error);

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc', code: '123' },
            body: { quantity: 5 },
        };

        await sut.handle(request, reply);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error updating item in order:',
            error,
        );

        consoleErrorSpy.mockRestore();
    });
});
