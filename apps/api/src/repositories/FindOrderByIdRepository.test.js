import FindOrderByIdRepository from './FindOrderByIdRepository.js';
import fs from 'fs/promises';
import path from 'path';

describe('FindOrderByIdRepository', () => {
    let tempFilePath;

    beforeEach(async () => {
        tempFilePath = path.join(process.cwd(), 'src/data/pedidos-test.json');

        // Remove arquivo se já existir
        try {
            await fs.unlink(tempFilePath);
        } catch {
            // Arquivo não existe, ok
        }

        // Cria arquivo com pedidos de teste
        const testOrders = [
            {
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
            },
            {
                store_id: 'store-456',
                order_id: 'order-456',
                order: {
                    customer: {
                        temporary_phone: '11987654322',
                        name: 'Maria Santos',
                    },
                    last_status_name: 'CONFIRMED',
                    items: [],
                    payments: [],
                    delivery_address: null,
                    created_at: 1770842100000,
                    total_price: 0,
                },
            },
        ];

        await fs.writeFile(
            tempFilePath,
            JSON.stringify(testOrders, null, 2),
            'utf-8',
        );
    });

    afterEach(async () => {
        try {
            await fs.unlink(tempFilePath);
        } catch {
            // Arquivo não existe, ok
        }
    });

    it('should find order by id', async () => {
        const repository = new FindOrderByIdRepository(tempFilePath);

        const order = await repository.execute('order-123');

        expect(order).toBeDefined();
        expect(order.order_id).toBe('order-123');
        expect(order.store_id).toBe('store-123');
        expect(order.order.customer.name).toBe('João Silva');
    });

    it('should return null when order is not found', async () => {
        const repository = new FindOrderByIdRepository(tempFilePath);

        const order = await repository.execute('non-existent-id');

        expect(order).toBeNull();
    });

    it('should find different orders by their ids', async () => {
        const repository = new FindOrderByIdRepository(tempFilePath);

        const order1 = await repository.execute('order-123');
        const order2 = await repository.execute('order-456');

        expect(order1.order_id).toBe('order-123');
        expect(order2.order_id).toBe('order-456');
        expect(order1.order.customer.name).toBe('João Silva');
        expect(order2.order.customer.name).toBe('Maria Santos');
    });

    it('should throw error when file does not exist', async () => {
        const repository = new FindOrderByIdRepository(
            'non-existent-file.json',
        );

        await expect(repository.execute('order-123')).rejects.toThrow(
            'Erro ao buscar pedido',
        );
    });
});
