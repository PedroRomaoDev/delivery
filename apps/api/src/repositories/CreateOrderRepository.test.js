import CreateOrderRepository from './CreateOrderRepository.js';
import Order from '../aggregates/Order.js';
import fs from 'fs/promises';
import path from 'path';

describe('CreateOrderRepository', () => {
    let tempFilePath;

    beforeEach(async () => {
        // Cria arquivo temporário para testes
        tempFilePath = path.join(process.cwd(), 'src/data/pedidos-test.json');

        // Limpa o arquivo se existir
        try {
            await fs.unlink(tempFilePath);
        } catch {
            // Arquivo não existe, ok
        }
    });

    afterEach(async () => {
        // Limpa o arquivo de teste após cada teste
        try {
            await fs.unlink(tempFilePath);
        } catch {
            // Arquivo não existe, ok
        }
    });

    it('should save a new order to file', async () => {
        const repository = new CreateOrderRepository(tempFilePath);
        const order = new Order('store-123', {
            name: 'João Silva',
            phone: '11987654321',
        });

        const savedOrder = await repository.execute(order);

        expect(savedOrder.order_id).toBe(order.id);
        expect(savedOrder.store_id).toBe('store-123');
        expect(savedOrder.order.customer.temporary_phone).toBe('11987654321');
        expect(savedOrder.order.customer.name).toBe('João Silva');
        expect(savedOrder.order.last_status_name).toBe('DRAFT');
    });

    it('should append order to existing orders', async () => {
        const repository = new CreateOrderRepository(tempFilePath);

        const order1 = new Order('store-123', {
            name: 'João Silva',
            phone: '11987654321',
        });

        const order2 = new Order('store-456', {
            name: 'Maria Santos',
            phone: '11987654322',
        });

        await repository.execute(order1);
        await repository.execute(order2);

        // Verifica se ambos os pedidos foram salvos
        const data = await fs.readFile(tempFilePath, 'utf-8');
        const orders = JSON.parse(data);

        expect(orders).toHaveLength(2);
        expect(orders[0].order_id).toBe(order1.id);
        expect(orders[1].order_id).toBe(order2.id);
    });

    it('should create file if it does not exist', async () => {
        const repository = new CreateOrderRepository(tempFilePath);
        const order = new Order('store-123', {
            name: 'João Silva',
            phone: '11987654321',
        });

        await repository.execute(order);

        // Verifica se o arquivo foi criado
        const fileExists = await fs
            .access(tempFilePath)
            .then(() => true)
            .catch(() => false);

        expect(fileExists).toBe(true);
    });

    it('should persist order data correctly', async () => {
        const repository = new CreateOrderRepository(tempFilePath);
        const order = new Order('store-123', {
            name: 'João Silva',
            phone: '11987654321',
        });

        await repository.execute(order);

        // Lê o arquivo e verifica os dados
        const data = await fs.readFile(tempFilePath, 'utf-8');
        const orders = JSON.parse(data);

        expect(orders[0].store_id).toBe('store-123');
        expect(orders[0].order_id).toBe(order.id);
        expect(orders[0].order.customer.temporary_phone).toBe('11987654321');
        expect(orders[0].order.customer.name).toBe('João Silva');
        expect(orders[0].order.last_status_name).toBe('DRAFT');
        expect(orders[0].order.items).toEqual([]);
        expect(orders[0].order.payments).toEqual([]);
        expect(orders[0].order.delivery_address).toBeNull();
        expect(orders[0].order.created_at).toBeDefined();
        expect(orders[0].order.total_price).toBe(0);
    });

    it('should throw error when order is invalid', async () => {
        const repository = new CreateOrderRepository(tempFilePath);

        await expect(repository.execute(null)).rejects.toThrow(
            'Erro ao criar pedido',
        );
    });
});
