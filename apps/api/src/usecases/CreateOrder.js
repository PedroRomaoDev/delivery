import Order from '../aggregates/Order.js';

class CreateOrderUseCase {
    constructor(createOrderRepository) {
        this.createOrderRepository = createOrderRepository;
    }

    async execute({ storeId, customer }) {
        // Valida os parâmetros
        if (!storeId || !customer) {
            throw new Error('storeId and customer are required');
        }

        // Cria o Aggregate Order
        const order = new Order(storeId, customer);

        // Persiste o pedido via repository
        const savedOrder = await this.createOrderRepository.execute(order);

        return savedOrder;
    }
}

export default CreateOrderUseCase;
