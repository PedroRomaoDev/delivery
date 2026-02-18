import GetOrderByIdController from './GetOrderById.js';

describe('GetOrderByIdController', () => {
    const makeSut = () => {
        const getOrderByIdUseCase = {
            execute: jest.fn(),
        };
        const sut = new GetOrderByIdController(getOrderByIdUseCase);
        const reply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        return { sut, getOrderByIdUseCase, reply };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw error if GetOrderByIdUseCase is not provided', () => {
        expect(() => new GetOrderByIdController()).toThrow(
            'GetOrderByIdUseCase is required',
        );
    });

    it('should return 200 with order when order is found', async () => {
        const { sut, getOrderByIdUseCase, reply } = makeSut();

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

        getOrderByIdUseCase.execute.mockResolvedValue(mockOrder);

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
        };

        await sut.handle(request, reply);

        expect(getOrderByIdUseCase.execute).toHaveBeenCalledWith(
            'b0c9e8a1-1234-4321-8765-123456789abc',
        );
        expect(reply.status).toHaveBeenCalledWith(200);
        expect(reply.send).toHaveBeenCalledWith(mockOrder);
    });

    it('should return 400 when order is not found', async () => {
        const { sut, getOrderByIdUseCase, reply } = makeSut();

        getOrderByIdUseCase.execute.mockRejectedValue(
            new Error('Order not found'),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
        };

        await sut.handle(request, reply);

        expect(getOrderByIdUseCase.execute).toHaveBeenCalledWith(
            'b0c9e8a1-1234-4321-8765-123456789abc',
        );
        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Order not found',
        });
    });

    it('should return 400 when id is not a valid UUID', async () => {
        const { sut, getOrderByIdUseCase, reply } = makeSut();

        const request = {
            params: { id: 'invalid-uuid' },
        };

        await sut.handle(request, reply);

        expect(getOrderByIdUseCase.execute).not.toHaveBeenCalled();
        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining(
                    'orderId must be a valid UUID',
                ),
                errors: expect.any(Array),
            }),
        );
    });

    it('should return 400 when id is missing', async () => {
        const { sut, getOrderByIdUseCase, reply } = makeSut();

        const request = {
            params: {},
        };

        await sut.handle(request, reply);

        expect(getOrderByIdUseCase.execute).not.toHaveBeenCalled();
        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.any(String),
                errors: expect.any(Array),
            }),
        );
    });

    it('should return 500 when use case throws unexpected error', async () => {
        const { sut, getOrderByIdUseCase, reply } = makeSut();

        getOrderByIdUseCase.execute.mockRejectedValue(
            new Error('Database connection error'),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
        };

        await sut.handle(request, reply);

        expect(getOrderByIdUseCase.execute).toHaveBeenCalledWith(
            'b0c9e8a1-1234-4321-8765-123456789abc',
        );
        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Internal server error',
        });
    });

    it('should log error when unexpected error occurs', async () => {
        const { sut, getOrderByIdUseCase, reply } = makeSut();
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        const error = new Error('Unexpected error');
        getOrderByIdUseCase.execute.mockRejectedValue(error);

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
        };

        await sut.handle(request, reply);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error in GetOrderByIdController:',
            error,
        );

        consoleErrorSpy.mockRestore();
    });
});
