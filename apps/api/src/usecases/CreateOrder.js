import Order from '../aggregates/Order.js';

class CreateOrderUseCase {
    constructor(createOrderRepository) {
        this.createOrderRepository = createOrderRepository;
    }

    async execute({ storeId, customer }) {
        if (!storeId || !customer) {
            throw new Error('storeId and customer are required');
        }

        const order = new Order(storeId, customer);

        const savedOrder = await this.createOrderRepository.execute(order);

        return savedOrder;
    }
}

export default CreateOrderUseCase;
