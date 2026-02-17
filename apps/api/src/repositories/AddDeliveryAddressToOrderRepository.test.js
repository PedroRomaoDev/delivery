import AddDeliveryAddressToOrderRepository from './AddDeliveryAddressToOrderRepository.js';
import fs from 'fs/promises';
import path from 'path';

describe('AddDeliveryAddressToOrderRepository', () => {
    let tempFilePath;

    beforeEach(async () => {
        tempFilePath = path.join(
            process.cwd(),
            'src/data/pedidos-delivery-test.json',
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
                        name: 'Loja Teste',
                        id: 'store-123',
                    },
                    items: [],
                    payments: [],
                    delivery_address: null,
                    created_at: 1770842000000,
                    total_price: 0,
                    statuses: [],
                },
            },
            {
                store_id: 'store-456',
                order_id: 'order-456',
                order: {
                    customer: {
                        temporary_phone: '11999999999',
                        name: 'Maria Santos',
                    },
                    last_status_name: 'DRAFT',
                    store: {
                        name: 'Loja Teste 2',
                        id: 'store-456',
                    },
                    items: [],
                    payments: [],
                    delivery_address: null,
                    created_at: 1770842000000,
                    total_price: 0,
                    statuses: [],
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

    it('should add delivery address to existing order successfully', async () => {
        const repository = new AddDeliveryAddressToOrderRepository(
            tempFilePath,
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
                store: {
                    name: 'Loja Teste',
                    id: 'store-123',
                },
                items: [],
                payments: [],
                delivery_address: {
                    street_name: 'Avenida Paulista',
                    street_number: '1578',
                    city: 'São Paulo',
                    state: 'SP',
                    postal_code: '01310-200',
                    country: 'Brasil',
                    neighborhood: 'Bela Vista',
                    reference: null,
                    coordinates: {
                        latitude: -23.5619,
                        longitude: -46.6564,
                        id: 1234567,
                    },
                },
                created_at: 1770842000000,
                total_price: 0,
                statuses: [],
            },
        };

        const result = await repository.execute(updatedOrder);

        expect(result).toEqual(updatedOrder);

        // Verifica se foi salvo no arquivo
        const data = await fs.readFile(tempFilePath, 'utf-8');
        const orders = JSON.parse(data);

        expect(orders[0].order.delivery_address).toBeDefined();
        expect(orders[0].order.delivery_address.street_name).toBe(
            'Avenida Paulista',
        );
        expect(orders[0].order.delivery_address.coordinates.latitude).toBe(
            -23.5619,
        );
    });

    it('should throw error when order not found', async () => {
        const repository = new AddDeliveryAddressToOrderRepository(
            tempFilePath,
        );

        const nonExistentOrder = {
            store_id: 'store-999',
            order_id: 'order-999',
            order: {
                customer: {
                    temporary_phone: '11000000000',
                    name: 'Inexistente',
                },
                last_status_name: 'DRAFT',
                store: {
                    name: 'Loja Fantasma',
                    id: 'store-999',
                },
                items: [],
                payments: [],
                delivery_address: {
                    street_name: 'Rua Teste',
                    street_number: '123',
                    city: 'Cidade',
                    state: 'Estado',
                    postal_code: '12345-678',
                    country: 'BR',
                    neighborhood: null,
                    reference: null,
                    coordinates: null,
                },
                created_at: 1770842000000,
                total_price: 0,
                statuses: [],
            },
        };

        await expect(repository.execute(nonExistentOrder)).rejects.toThrow(
            'Order not found',
        );

        // Verifica que o arquivo não foi alterado
        const data = await fs.readFile(tempFilePath, 'utf-8');
        const orders = JSON.parse(data);
        expect(orders).toHaveLength(2);
    });

    it('should update only the target order without affecting others', async () => {
        const repository = new AddDeliveryAddressToOrderRepository(
            tempFilePath,
        );

        const updatedOrder = {
            store_id: 'store-456',
            order_id: 'order-456',
            order: {
                customer: {
                    temporary_phone: '11999999999',
                    name: 'Maria Santos',
                },
                last_status_name: 'DRAFT',
                store: {
                    name: 'Loja Teste 2',
                    id: 'store-456',
                },
                items: [],
                payments: [],
                delivery_address: {
                    street_name: 'Avenida Atlântica',
                    street_number: '1702',
                    city: 'Rio de Janeiro',
                    state: 'RJ',
                    postal_code: '22021-001',
                    country: 'Brasil',
                    neighborhood: 'Copacabana',
                    reference: 'Em frente à praia',
                    coordinates: {
                        latitude: -22.9670133,
                        longitude: -43.1791849,
                        id: 1001662,
                    },
                },
                created_at: 1770842000000,
                total_price: 0,
                statuses: [],
            },
        };

        await repository.execute(updatedOrder);

        // Verifica se ambos os pedidos existem e apenas o correto foi atualizado
        const data = await fs.readFile(tempFilePath, 'utf-8');
        const orders = JSON.parse(data);

        expect(orders).toHaveLength(2);

        // Primeiro pedido não deve ter endereço
        expect(orders[0].order_id).toBe('order-123');
        expect(orders[0].order.delivery_address).toBeNull();

        // Segundo pedido deve ter o endereço atualizado
        expect(orders[1].order_id).toBe('order-456');
        expect(orders[1].order.delivery_address).toBeDefined();
        expect(orders[1].order.delivery_address.street_name).toBe(
            'Avenida Atlântica',
        );
        expect(orders[1].order.delivery_address.coordinates.latitude).toBe(
            -22.9670133,
        );
    });

    it('should handle delivery address with null coordinates', async () => {
        const repository = new AddDeliveryAddressToOrderRepository(
            tempFilePath,
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
                store: {
                    name: 'Loja Teste',
                    id: 'store-123',
                },
                items: [],
                payments: [],
                delivery_address: {
                    street_name: 'Rua Desconhecida',
                    street_number: '999',
                    city: 'Cidade Fantasma',
                    state: 'XX',
                    postal_code: '99999-999',
                    country: 'ZZ',
                    neighborhood: null,
                    reference: null,
                    coordinates: null,
                },
                created_at: 1770842000000,
                total_price: 0,
                statuses: [],
            },
        };

        const result = await repository.execute(updatedOrder);

        expect(result.order.delivery_address.coordinates).toBeNull();

        // Verifica se foi salvo no arquivo
        const data = await fs.readFile(tempFilePath, 'utf-8');
        const orders = JSON.parse(data);

        expect(orders[0].order.delivery_address.street_name).toBe(
            'Rua Desconhecida',
        );
        expect(orders[0].order.delivery_address.coordinates).toBeNull();
    });

    it('should use custom data path when provided', async () => {
        const customPath = path.join(
            process.cwd(),
            'src/data/custom-orders.json',
        );

        // Cria arquivo customizado
        const customOrders = [
            {
                store_id: 'store-custom',
                order_id: 'order-custom',
                order: {
                    customer: {
                        temporary_phone: '11555555555',
                        name: 'Cliente Custom',
                    },
                    last_status_name: 'DRAFT',
                    store: {
                        name: 'Loja Custom',
                        id: 'store-custom',
                    },
                    items: [],
                    payments: [],
                    delivery_address: null,
                    created_at: 1770842000000,
                    total_price: 0,
                    statuses: [],
                },
            },
        ];

        await fs.writeFile(
            customPath,
            JSON.stringify(customOrders, null, 2),
            'utf-8',
        );

        const repository = new AddDeliveryAddressToOrderRepository(customPath);

        const updatedOrder = {
            store_id: 'store-custom',
            order_id: 'order-custom',
            order: {
                customer: {
                    temporary_phone: '11555555555',
                    name: 'Cliente Custom',
                },
                last_status_name: 'DRAFT',
                store: {
                    name: 'Loja Custom',
                    id: 'store-custom',
                },
                items: [],
                payments: [],
                delivery_address: {
                    street_name: 'Rua Custom',
                    street_number: '100',
                    city: 'São Paulo',
                    state: 'SP',
                    postal_code: '01000-000',
                    country: 'Brasil',
                    neighborhood: null,
                    reference: null,
                    coordinates: null,
                },
                created_at: 1770842000000,
                total_price: 0,
                statuses: [],
            },
        };

        await repository.execute(updatedOrder);

        // Verifica se foi salvo no arquivo custom
        const data = await fs.readFile(customPath, 'utf-8');
        const orders = JSON.parse(data);

        expect(orders[0].order.delivery_address.street_name).toBe('Rua Custom');

        // Limpa arquivo custom
        await fs.unlink(customPath);
    });
});
