import AddItemToOrderRepository from './AddItemToOrderRepository.js';
import fs from 'fs/promises';
import path from 'path';

describe('AddItemToOrderRepository', () => {
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

    it('should update order with new item', async () => {
        const repository = new AddItemToOrderRepository(tempFilePath);

        const updatedOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                items: [
                    {
                        code: 123,
                        price: 50.0,
                        observations: null,
                        total_price: 100.0,
                        name: 'Test Product',
                        quantity: 2,
                        discount: 0,
                        condiments: [],
                    },
                ],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 100.0,
            },
        };

        const result = await repository.execute(updatedOrder);

        expect(result).toEqual(updatedOrder);

        // Verifica se foi salvo no arquivo
        const data = await fs.readFile(tempFilePath, 'utf-8');
        const orders = JSON.parse(data);

        expect(orders[0].order.items).toHaveLength(1);
        expect(orders[0].order.items[0].code).toBe(123);
        expect(orders[0].order.total_price).toBe(100.0);
    });

    it('should throw error when order is not found', async () => {
        const repository = new AddItemToOrderRepository(tempFilePath);

        const nonExistentOrder = {
            store_id: 'store-456',
            order_id: 'non-existent',
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

        await expect(repository.execute(nonExistentOrder)).rejects.toThrow(
            'Order not found',
        );
    });

    it('should preserve other orders when updating one', async () => {
        // Adiciona mais um pedido
        const data = await fs.readFile(tempFilePath, 'utf-8');
        const orders = JSON.parse(data);
        orders.push({
            store_id: 'store-456',
            order_id: 'order-456',
            order: {
                customer: {
                    temporary_phone: '11987654322',
                    name: 'Maria Santos',
                },
                last_status_name: 'DRAFT',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: 1770842100000,
                total_price: 0,
            },
        });
        await fs.writeFile(
            tempFilePath,
            JSON.stringify(orders, null, 2),
            'utf-8',
        );

        const repository = new AddItemToOrderRepository(tempFilePath);

        const updatedOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                items: [
                    {
                        code: 123,
                        price: 50.0,
                        observations: null,
                        total_price: 50.0,
                        name: 'Test Product',
                        quantity: 1,
                        discount: 0,
                        condiments: [],
                    },
                ],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 50.0,
            },
        };

        await repository.execute(updatedOrder);

        // Verifica se o outro pedido não foi alterado
        const updatedData = await fs.readFile(tempFilePath, 'utf-8');
        const updatedOrders = JSON.parse(updatedData);

        expect(updatedOrders).toHaveLength(2);
        expect(updatedOrders[1].order_id).toBe('order-456');
        expect(updatedOrders[1].order.items).toEqual([]);
    });
});
