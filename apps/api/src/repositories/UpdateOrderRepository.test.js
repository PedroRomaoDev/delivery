import UpdateOrderRepository from './UpdateOrderRepository.js';
import fs from 'fs/promises';
import path from 'path';

describe('UpdateOrderRepository', () => {
    let tempFilePath;

    beforeEach(async () => {
        tempFilePath = path.join(
            process.cwd(),
            'src/data/pedidos-update-test.json',
        );

        // Remove arquivo se já existir
        try {
            await fs.unlink(tempFilePath);
        } catch {
            // Arquivo não existe, ok
        }

        // Garante que o diretório existe
        const dir = path.dirname(tempFilePath);
        await fs.mkdir(dir, { recursive: true });

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
                    payments: [
                        {
                            prepaid: true,
                            value: 100.0,
                            origin: 'PIX',
                        },
                    ],
                    delivery_address: {
                        street: 'Rua Teste',
                        number: '123',
                        neighborhood: 'Centro',
                        city: 'São Paulo',
                        state: 'SP',
                        zip_code: '01000-000',
                        coordinates: {
                            id: 1234567,
                            latitude: -23.55,
                            longitude: -46.63,
                        },
                    },
                    created_at: 1770842000000,
                    total_price: 100.0,
                    statuses: [
                        {
                            description: 'DRAFT',
                            date: 1770842000000,
                            origin: 'CUSTOMER',
                        },
                    ],
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
                    statuses: [
                        {
                            description: 'DRAFT',
                            date: 1770842000000,
                            origin: 'CUSTOMER',
                        },
                    ],
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

    it('should update order successfully', async () => {
        const repository = new UpdateOrderRepository(tempFilePath);

        const updatedOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'RECEIVED',
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
                        origin: 'PIX',
                    },
                ],
                delivery_address: {
                    street: 'Rua Teste',
                    number: '123',
                    neighborhood: 'Centro',
                    city: 'São Paulo',
                    state: 'SP',
                    zip_code: '01000-000',
                    coordinates: {
                        id: 1234567,
                        latitude: -23.55,
                        longitude: -46.63,
                    },
                },
                created_at: 1770842000000,
                total_price: 100.0,
                statuses: [
                    {
                        description: 'DRAFT',
                        date: 1770842000000,
                        origin: 'CUSTOMER',
                    },
                    {
                        description: 'RECEIVED',
                        date: 1770842100000,
                        origin: 'CUSTOMER',
                    },
                ],
            },
        };

        const result = await repository.execute(updatedOrder);

        expect(result).toEqual(updatedOrder);

        // Verifica se o arquivo foi atualizado
        const fileContent = await fs.readFile(tempFilePath, 'utf-8');
        const orders = JSON.parse(fileContent);

        const updatedOrderInFile = orders.find(
            (o) => o.order_id === 'order-123',
        );
        expect(updatedOrderInFile.order.last_status_name).toBe('RECEIVED');
        expect(updatedOrderInFile.order.statuses).toHaveLength(2);
        expect(updatedOrderInFile.order.statuses[1].description).toBe(
            'RECEIVED',
        );
    });

    it('should throw error when order is not found', async () => {
        const repository = new UpdateOrderRepository(tempFilePath);

        const updatedOrder = {
            store_id: 'store-999',
            order_id: 'non-existent-order',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'RECEIVED',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 0,
            },
        };

        await expect(repository.execute(updatedOrder)).rejects.toThrow(
            'Order not found',
        );
    });

    it('should handle file read errors', async () => {
        const repository = new UpdateOrderRepository('/invalid/path.json');

        const updatedOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'RECEIVED',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: 1770842000000,
                total_price: 0,
            },
        };

        await expect(repository.execute(updatedOrder)).rejects.toThrow();
    });

    it('should preserve other orders when updating', async () => {
        const repository = new UpdateOrderRepository(tempFilePath);

        const updatedOrder = {
            store_id: 'store-123',
            order_id: 'order-123',
            order: {
                customer: {
                    temporary_phone: '11987654321',
                    name: 'João Silva',
                },
                last_status_name: 'RECEIVED',
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
                        origin: 'PIX',
                    },
                ],
                delivery_address: {
                    street: 'Rua Teste',
                    number: '123',
                    neighborhood: 'Centro',
                    city: 'São Paulo',
                    state: 'SP',
                    zip_code: '01000-000',
                    coordinates: {
                        id: 1234567,
                        latitude: -23.55,
                        longitude: -46.63,
                    },
                },
                created_at: 1770842000000,
                total_price: 100.0,
                statuses: [
                    {
                        description: 'DRAFT',
                        date: 1770842000000,
                        origin: 'CUSTOMER',
                    },
                    {
                        description: 'RECEIVED',
                        date: 1770842100000,
                        origin: 'CUSTOMER',
                    },
                ],
            },
        };

        await repository.execute(updatedOrder);

        // Verifica se o outro pedido permanece inalterado
        const fileContent = await fs.readFile(tempFilePath, 'utf-8');
        const orders = JSON.parse(fileContent);

        expect(orders).toHaveLength(2);

        const otherOrder = orders.find((o) => o.order_id === 'order-456');
        expect(otherOrder).toBeDefined();
        expect(otherOrder.order.last_status_name).toBe('DRAFT');
    });
});
