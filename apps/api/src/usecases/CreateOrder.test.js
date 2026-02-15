import CreateOrderUseCase from './CreateOrder.js';

describe('CreateOrderUseCase', () => {
    let createOrderRepository;
    let createOrderUseCase;

    beforeEach(() => {
        // Mock do repository
        createOrderRepository = {
            execute: jest.fn(),
        };
        createOrderUseCase = new CreateOrderUseCase(createOrderRepository);
    });

    it('should create a new order with valid data', async () => {
        const input = {
            storeId: 'store-123',
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        };

        const mockSavedOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 0,
            },
        };

        createOrderRepository.execute.mockResolvedValue(mockSavedOrder);

        const result = await createOrderUseCase.execute(input);

        expect(result.store_id).toBe('store-123');
        expect(result.order.customer.temporary_phone).toBe('11987654321');
        expect(result.order.customer.name).toBe('João Silva');
        expect(result.order.last_status_name).toBe('DRAFT');
        expect(createOrderRepository.execute).toHaveBeenCalledTimes(1);
    });

    it('should call repository with Order instance', async () => {
        const input = {
            storeId: 'store-123',
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        };

        createOrderRepository.execute.mockResolvedValue({});

        await createOrderUseCase.execute(input);

        const callArg = createOrderRepository.execute.mock.calls[0][0];

        expect(callArg).toHaveProperty('id');
        expect(callArg).toHaveProperty('storeId', 'store-123');
        expect(callArg).toHaveProperty('status', 'DRAFT');
        expect(callArg).toHaveProperty('toJSON');
    });

    it('should throw error when storeId is missing', async () => {
        const input = {
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        };

        await expect(createOrderUseCase.execute(input)).rejects.toThrow(
            'storeId and customer are required',
        );
    });

    it('should throw error when customer is missing', async () => {
        const input = {
            storeId: 'store-123',
        };

        await expect(createOrderUseCase.execute(input)).rejects.toThrow(
            'storeId and customer are required',
        );
    });

    it('should throw error when customer is invalid', async () => {
        const input = {
            storeId: 'store-123',
            customer: {
                name: 'João Silva',
                // phone is missing
            },
        };

        await expect(createOrderUseCase.execute(input)).rejects.toThrow(
            'customer.phone is required and must be a string',
        );
    });

    it('should return the saved order from repository', async () => {
        const input = {
            storeId: 'store-123',
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        };

        const mockSavedOrder = {
            store_id: 'store-123',
            order_id: 'order-456',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 0,
            },
        };

        createOrderRepository.execute.mockResolvedValue(mockSavedOrder);

        const result = await createOrderUseCase.execute(input);

        expect(result).toEqual(mockSavedOrder);
    });

    it('should propagate repository errors', async () => {
        const input = {
            storeId: 'store-123',
            customer: {
                name: 'João Silva',
                phone: '11987654321',
            },
        };

        createOrderRepository.execute.mockRejectedValue(
            new Error('Database error'),
        );

        await expect(createOrderUseCase.execute(input)).rejects.toThrow(
            'Database error',
        );
    });
});
