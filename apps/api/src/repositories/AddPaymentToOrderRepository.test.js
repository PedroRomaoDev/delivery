import AddPaymentToOrderRepository from './AddPaymentToOrderRepository.js';
import fs from 'fs/promises';
import path from 'path';

describe('AddPaymentToOrderRepository', () => {
    let tempFilePath;

    beforeEach(async () => {
        tempFilePath = path.join(
            process.cwd(),
            'src/data/pedidos-payment-test.json',
        );

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
                    store: {
                        name: 'COCO BAMBU CHIQUE CHIQUE',
                        id: 'store-123',
                    },
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
            },
            {
                store_id: 'store-456',
                order_id: 'order-456',
                order: {
                    customer: {
                        temporary_phone: '11999998888',
                        name: 'Maria Santos',
                    },
                    last_status_name: 'DRAFT',
                    store: {
                        name: 'COCO BAMBU CHIQUE CHIQUE',
                        id: 'store-456',
                    },
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

    it('should update order with new payment', async () => {
        const repository = new AddPaymentToOrderRepository(tempFilePath);

        const updatedOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                store: {
                    name: 'COCO BAMBU CHIQUE CHIQUE',
                    id: 'store-123',
                },
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
                payments: [
                    {
                        prepaid: true,
                        value: 100.0,
                        origin: 'CREDIT_CARD',
                    },
                ],
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

        expect(orders[0].order.payments).toHaveLength(1);
        expect(orders[0].order.payments[0].origin).toBe('CREDIT_CARD');
        expect(orders[0].order.payments[0].value).toBe(100.0);
        expect(orders[0].order.payments[0].prepaid).toBe(true);
    });

    it('should throw error when order is not found', async () => {
        const repository = new AddPaymentToOrderRepository(tempFilePath);

        const nonExistentOrder = {
            store_id: 'store-999',
            order_id: 'order-999',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                items: [],
                payments: [
                    {
                        prepaid: true,
                        value: 100.0,
                        origin: 'PIX',
                    },
                ],
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
        const repository = new AddPaymentToOrderRepository(tempFilePath);

        const updatedOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                store: {
                    name: 'COCO BAMBU CHIQUE CHIQUE',
                    id: 'store-123',
                },
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
                payments: [
                    {
                        prepaid: false,
                        value: 100.0,
                        origin: 'CASH',
                    },
                ],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 100.0,
            },
        };

        await repository.execute(updatedOrder);

        // Verifica se o outro pedido foi preservado
        const data = await fs.readFile(tempFilePath, 'utf-8');
        const orders = JSON.parse(data);

        expect(orders).toHaveLength(2);
        expect(orders[1].order_id).toBe('order-456');
        expect(orders[1].order.customer.name).toBe('Maria Santos');
    });

    it('should handle multiple payments in same order', async () => {
        const repository = new AddPaymentToOrderRepository(tempFilePath);

        const updatedOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                store: {
                    name: 'COCO BAMBU CHIQUE CHIQUE',
                    id: 'store-123',
                },
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
                payments: [
                    {
                        prepaid: true,
                        value: 50.0,
                        origin: 'CREDIT_CARD',
                    },
                    {
                        prepaid: true,
                        value: 50.0,
                        origin: 'PIX',
                    },
                ],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 100.0,
            },
        };

        const result = await repository.execute(updatedOrder);

        expect(result.order.payments).toHaveLength(2);

        // Verifica se foi salvo no arquivo
        const data = await fs.readFile(tempFilePath, 'utf-8');
        const orders = JSON.parse(data);

        expect(orders[0].order.payments).toHaveLength(2);
        expect(orders[0].order.payments[0].origin).toBe('CREDIT_CARD');
        expect(orders[0].order.payments[1].origin).toBe('PIX');
    });

    it('should throw generic error on file system failures', async () => {
        const repository = new AddPaymentToOrderRepository(
            '/invalid/path/file.json',
        );

        const updatedOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'DRAFT',
                items: [],
                payments: [
                    {
                        prepaid: true,
                        value: 100.0,
                        origin: 'PIX',
                    },
                ],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 0,
            },
        };

        await expect(repository.execute(updatedOrder)).rejects.toThrow(
            'Failed to add payment to order',
        );
    });
});
