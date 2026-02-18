import UpdateCustomerInOrderController from './UpdateCustomerInOrder.js';

describe('UpdateCustomerInOrderController', () => {
    const makeSut = () => {
        const updateCustomerInOrderUseCase = {
            execute: jest.fn(),
        };
        const sut = new UpdateCustomerInOrderController(
            updateCustomerInOrderUseCase,
        );
        const reply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        return { sut, updateCustomerInOrderUseCase, reply };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update customer name successfully', async () => {
        const { sut, updateCustomerInOrderUseCase, reply } = makeSut();

        const mockOrderUpdated = {
            store_id: 'store-123',
            order_id: 'order-456',
            order: {
                customer: {
                    name: 'Maria Santos',
                    temporary_phone: '11987654321',
                },
            },
        };

        updateCustomerInOrderUseCase.execute.mockResolvedValue(
            mockOrderUpdated,
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
            body: { name: 'Maria Santos' },
        };

        await sut.handle(request, reply);

        expect(updateCustomerInOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: 'b0c9e8a1-1234-4321-8765-123456789abc',
            updates: { name: 'Maria Santos' },
        });
        expect(reply.status).toHaveBeenCalledWith(200);
        expect(reply.send).toHaveBeenCalledWith(mockOrderUpdated);
    });

    it('should update customer phone successfully', async () => {
        const { sut, updateCustomerInOrderUseCase, reply } = makeSut();

        const mockOrderUpdated = {
            store_id: 'store-123',
            order_id: 'order-456',
            order: {
                customer: {
                    name: 'João Silva',
                    temporary_phone: '11999999999',
                },
            },
        };

        updateCustomerInOrderUseCase.execute.mockResolvedValue(
            mockOrderUpdated,
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
            body: { phone: '11999999999' },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(200);
    });

    it('should update both name and phone', async () => {
        const { sut, updateCustomerInOrderUseCase, reply } = makeSut();

        const mockOrderUpdated = { store_id: 'store-123' };
        updateCustomerInOrderUseCase.execute.mockResolvedValue(
            mockOrderUpdated,
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
            body: {
                name: 'Carlos Pereira',
                phone: '11888888888',
            },
        };

        await sut.handle(request, reply);

        expect(updateCustomerInOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: 'b0c9e8a1-1234-4321-8765-123456789abc',
            updates: { name: 'Carlos Pereira', phone: '11888888888' },
        });
        expect(reply.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when orderId is invalid', async () => {
        const { sut, updateCustomerInOrderUseCase, reply } = makeSut();

        const request = {
            params: { id: 'invalid-id' },
            body: { name: 'Maria Santos' },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining(
                    'orderId must be a valid UUID',
                ),
            }),
        );
        expect(updateCustomerInOrderUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when no field is provided', async () => {
        const { sut, updateCustomerInOrderUseCase, reply } = makeSut();

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
            body: {},
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining(
                    'At least one field must be provided',
                ),
            }),
        );
        expect(updateCustomerInOrderUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when name is not a string', async () => {
        const { sut, updateCustomerInOrderUseCase, reply } = makeSut();

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
            body: { name: 123 },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(updateCustomerInOrderUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when phone is not a string', async () => {
        const { sut, updateCustomerInOrderUseCase, reply } = makeSut();

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
            body: { phone: 123456789 },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(updateCustomerInOrderUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when order is not found', async () => {
        const { sut, updateCustomerInOrderUseCase, reply } = makeSut();

        updateCustomerInOrderUseCase.execute.mockRejectedValue(
            new Error('Order not found'),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
            body: { name: 'Maria Santos' },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: 'Order not found',
        });
    });

    it('should return 400 when order is not in DRAFT status', async () => {
        const { sut, updateCustomerInOrderUseCase, reply } = makeSut();

        updateCustomerInOrderUseCase.execute.mockRejectedValue(
            new Error(
                'Cannot update customer in order that is not in DRAFT status',
            ),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
            body: { name: 'Maria Santos' },
        };

        await sut.handle(request, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message:
                'Cannot update customer in order that is not in DRAFT status',
        });
    });

    it('should return 500 when an unexpected error occurs', async () => {
        const { sut, updateCustomerInOrderUseCase, reply } = makeSut();

        updateCustomerInOrderUseCase.execute.mockRejectedValue(
            new Error('Unexpected error'),
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
            body: { name: 'Maria Santos' },
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

    it('should ignore extra fields not in schema', async () => {
        const { sut, updateCustomerInOrderUseCase, reply } = makeSut();

        const mockOrderUpdated = { store_id: 'store-123' };
        updateCustomerInOrderUseCase.execute.mockResolvedValue(
            mockOrderUpdated,
        );

        const request = {
            params: { id: 'b0c9e8a1-1234-4321-8765-123456789abc' },
            body: {
                name: 'Valid Name',
                extraField: 'should be ignored',
            },
        };

        await sut.handle(request, reply);

        // Zod deve ter filtrado o campo extra
        expect(updateCustomerInOrderUseCase.execute).toHaveBeenCalledWith({
            orderId: 'b0c9e8a1-1234-4321-8765-123456789abc',
            updates: { name: 'Valid Name' },
        });
        expect(reply.status).toHaveBeenCalledWith(200);
    });
});
